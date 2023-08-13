import styles from './FramesView.module.scss';
import { Frame } from '~/types'
import { FrameView } from '~/components/pages/PlanEditor/FramesView/FrameView'

type FramesViewProps = { frames: Frame[] }

export default function FramesList(props: FramesViewProps) {
  const { frames } = props;

  return (<div className={styles.container}>
    {frames.map((frame) => (<FrameView key={frame.id} frame={frame}/>))}
  </div>);
}
