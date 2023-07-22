import styles from './FramesView.module.scss';
import { Frame } from '~/types'
import { FrameView } from '~/components/pages/PlanEditor/FramesView/FrameView'

type FramesViewProps = { frames: Frame[] }

export default function FramesView(props: FramesViewProps) {
  const { frames } = props;
  /*  const [value, state] = useForest([stateFactory, props],
      (localState) => {
      });

    const {} = value;*/

  return (<div className={styles.container}>
    {frames.map((frame) => (<FrameView key={frame.id} frame={frame}/>))}
  </div>);
}
