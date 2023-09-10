import {memo, useContext} from "react";
import {PlanEditorStateCtx} from "~/components/pages/PlanEditor/PlanEditor";
import useForestFiltered from "~/lib/useForestFiltered";

function UnZoom({children}) {
  const planEditorState = useContext(PlanEditorStateCtx);
  const {zoom} = useForestFiltered(planEditorState!, ['zoom'])

  return (
      <div style={{transform: `scale(${100 / zoom})`, transformOrigin: 'top left'}}>
        {children}
      </div>
  )
}

const UnZoomM =  memo(UnZoom);

export default UnZoomM;
