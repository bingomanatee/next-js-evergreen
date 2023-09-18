import {useState, useEffect, useCallback, useMemo, useRef, useContext, memo} from 'react';
import stateFactory from './Map.state.ts';
import useForest from '~/lib/useForest';
import {Frame} from '~/types'
import px, {vectorToStyle} from '~/lib/utils/px'
import {Vector2} from 'three'
import {PlanEditorStateCtx} from '~/components/pages/PlanEditor/PlanEditor'
import {useBoolean} from "@chakra-ui/react";

type MapProps = { frame: Frame }

function MapViewInner(props: MapProps) {
  const {frame} = props;
  const planEditorState = useContext(PlanEditorStateCtx);

  const [value, state] = useForest([stateFactory, props, planEditorState],
      (localState) => {
        localState.do.init(props.frame);
      });

  useEffect(() => {
    state.do.mergeFrame(frame);
  }, [frame, state])

  const {mapData} = value;

  const size = useMemo(() => new Vector2(frame.width, frame.height).round(),
      [frame.width, frame.height]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.resize();
        mapRef.current.setCenter(mapData.lng, mapData.lat);
        mapRef.current.triggerRepaint();
      }, 100);
    }
  }, [mapData.lat, mapData.lng, size])

  if (!(mapData.lng && mapData.lat)) return null;
  return (
      <div style={{width: px(size.x), height: px(size.y), overflow: 'visible', position: 'relative'}}
           ref={state.do.setRef}>
      </div>
  )
}

const MapViewInnerM = memo(MapViewInner);

export default function MapView(props: MapProps) {

  const [frameSnapshot, setFrameSnap] = useState('');
  const [showMap, setShowMap] = useBoolean(true)

  useEffect(() => {
    const bounce = () => {
      setShowMap.off();
      let currentFrame = props.frame;
      setTimeout(() => {
        if (currentFrame === props.frame) {
          setShowMap.on();
        }
      }, 100);
    }

    if (!props.frame) {
      setFrameSnap('');
    } else {
      try {
        const snap = JSON.stringify(props.frame);
        if (snap !== frameSnapshot) {
          setFrameSnap(snap);
          bounce();
        }
      } catch (err) {
        setFrameSnap('cannot serialize');
        bounce();
      }
    }
  }, [props.frame]);

  if (!showMap) return <span>&nbsp;</span>

  return <MapViewInnerM frame={props.frame}/>
}
