'use client'

import {createRef, forwardRef, FunctionComponent, PureComponent} from "react";
import {leafConfig, leafI} from "@wonderlandlabs/forest/lib/types";
import {BehaviorSubject, debounceTime, Subject, Subscription, switchMap, from} from "rxjs";
import {Forest} from "@wonderlandlabs/forest";

let id = 0;
const DEFAULT = {
  stateProp: 'state',
  valueProp: 'value',
}
const UNMOUNT_THRESHOLD = 300;
const DEBUG = true;
export default function withForest(View: FunctionComponent, options = DEFAULT) {

  const {stateProp = 'state', valueProp = 'value', leafConstructor} = options;

  class ForestComponent extends PureComponent {

    constructor(props) {
      super(props);
      this.state = {leaf: null, value: null,};
      this.createForest = this.createForest.bind(this);
      this.updateChildRef = this.updateChildRef.bind(this);
      this.checkForUnmounting = this.checkForUnmounting.bind(this);
      this.childRef = createRef<HTMLDivElement | null>();
      if (leafConstructor) {
        this.createForest(leafConstructor(props));
      }
      this.eleStream.subscribe(this.checkForUnmounting);
    }

    private childRef;
    private _leaf?: leafI | null;

    createForest(config: leafConfig) {
      if (config) {
        const leaf = new Forest(config)
        if (this._mounted) {
          this.initLeaf(leaf)
        } else {
          this._leaf = leaf;
        }
      }
    }

    private _urlObserver: MutationObserver;

    watchForUrlChange() {
      let oldHref = document.location.href;
      const body = document.querySelector("body");
      const self = this;
      this._urlObserver = new MutationObserver(() => {
        if (oldHref !== document.location.href) {
          self.terminate();
        }
      });
      this._urlObserver.observe(body, {childList: true, subtree: true});
    }

    eleStream = new BehaviorSubject<HTMLDivElement | null>(null)

    updateChildRef(ele) {
      if (ele) {
        this.eleStream.next(ele);
      }
    }

    private _sub?: Subscription;

    initLeaf(leaf) {
      this.setState((state) => ({...state, leaf, value: leaf.value}));
      const self = this;
      this._sub = leaf.subscribe({
        next(value) {
          self.setState((state) => ({...state, value}));
        },
        error(err) {
          console.log('state error: ', err);
        }
      });
    }

    private _mounted = false;

    componentDidMount() {
      if (this._leaf) {
        this.initLeaf(this._leaf);
        this._leaf = null;
      }
      this.watchForUrlChange();

      const self = this;
      // terminate if a disconnected/missing element is detected in UNMOUNT_THRESHOLD ms;
      this.hasConnectedEle
          .pipe(debounceTime(UNMOUNT_THRESHOLD))
          .subscribe({
            next(value) {
              if (value) {
                self.terminate();
              }
            },
            error(_err) {}
          });
      this._mounted = true;
    }

    terminate() {
      this._sub?.unsubscribe();
      this.hasConnectedEle.complete();
      this.eleStream.complete();
      this._urlObserver?.disconnect();
      if (DEBUG) {
        console.log('terminating forest instance')
      }
    }

    get _currentEle(): HTMLDivElement | null {
      return this.eleStream.value;
    }

    hasConnectedEle = new Subject();

    private checkForUnmounting() {
      if (
          (!this._currentEle?.parentNode) ||
          (!this._currentEle.isConnected)
      ) {
        this.hasConnectedEle.next(true);
      } else {
        this.hasConnectedEle.next(false);
      }
    }

    componentWillUnmount() {
      setTimeout(() => {
        this.checkForUnmounting();
      }, 200)
    }

    render() {
      const {leaf, value} = this.state;
      if (!leaf) {
        return (
            <div style={{display: 'none'}} ref={this.updateChildRef}>
              <View
                  {...this.props}
                  {...{createForest: this.createForest, [stateProp]: null, [valueProp]: undefined}
                  }
              />
            </div>)
      } else {
        return (
            <View
                {...this.props}
                {...{[stateProp]: leaf, [valueProp]: value}}
                ref={this.updateChildRef}
            />
        )
      }
    }
  }


  return ForestComponent;
}
