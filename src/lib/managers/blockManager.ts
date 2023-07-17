import { Subject, SubjectLike, Subscription, Unsubscribable } from 'rxjs'
import { historyStream } from '~/lib/managers/historyStream'

/**
 * the BlockManager allows one activity to run until it completes (or errors);
 * any other activity submitted. As the nature of the blocker is not really important,
 * you can either submit a subject or allow one to spawn in its absence
 */
class BlockManager {
  private _historySub: Subscription

  constructor() {
    this._historySub = historyStream.subscribe((url) => {
      this.clear();
    })
  }

  private _obsSub: Unsubscribable | null = null;
  public blockerName: string | null = null;
  public block(blockerName: string, blocker?: SubjectLike<any>, force = false) {

    // prevent any activity from being initiated if there is a current blocker
    if (this.blocker) {
      if (force) {
        this.blocker.complete();
      } else {
        throw new Error('modality is occupied');
      }
    }

    if (!blocker) {
      blocker = new Subject();
    }
    this.blocker = blocker;
    this.blockerName = blockerName;
    const self = this;
    this._obsSub = blocker.subscribe({
      error(err) {
        console.warn('error in interruptManager:', err);
        self.clear();
      },
      complete() {
        console.log('blocker clearing');
        self.clear();
        console.log('end blocker clearing');
      }
    })
    return blocker;
  };

  public get isBlocked() {
    return !!this.blocker;
  }

  private clear() {
    this._obsSub = null;
    this.blocker?.complete();
    this.blocker = null;
    this.blockerName = null;
  }

  private blocker: SubjectLike<any> | null = null;
}

const blockManager = new BlockManager();
export default blockManager;
