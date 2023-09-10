import {Box, useBoolean, Text, HStack, Tooltip} from '@chakra-ui/react'
import Image from 'next/image'
import src from 'react-mapbox-gl/src'
import {label} from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements'
import px from '~/lib/utils/px'

import blockManager from '~/lib/managers/blockManager'
import {useCallback} from "react";
import stopPropagation from "~/lib/utils/stopPropagation";
import useForestFiltered from "~/lib/useForestFiltered";

export default function ControlBarItem(
    {
      icon,
      iconItem = null,
      height = 25,
      showOpen = false,
      label,
      allowBlockedClick = false,
      children,
      onClick,
      rightAlign = false
    }) {

  const [isDown, isDownState] = useBoolean(false);
  const [isHover, isHoverState] = useBoolean(false);

  const action = useCallback((e) => {
    stopPropagation(e);
    if (allowBlockedClick || (!blockManager.$.isBlocked())) {
      onClick(e);
    }
  }, [onClick, allowBlockedClick])

  const {id: blocked} = useForestFiltered(blockManager, ['id']);

  return (
      <Tooltip placement="top" label={label} offset={[0, 40]}>
        <Box
            onMouseEnter={isHoverState.on}
            position="relative"
            onMouseLeave={() => {
              isDownState.off();
              isHoverState.off();
            }}
            onMouseDown={isDownState.on}
            onClick={action}
            layerStyle={`control-panel-item${isHover || showOpen ? '-hover' : ''}`}
        >
          {iconItem || <Image
              style={{opacity: (!allowBlockedClick && blocked) ? 0.5 : 1}}
              src={icon}
              alt={label}
              width={20}
              height={20}
          />}
          {children ? (
              <Box position="absolute"
                   {...(rightAlign ? {right: 0} : {left: 0})}
                   top={px(-height)} visibility={isHover ? 'visible' : 'hidden'}>
                {children}
              </Box>
          ) : null}
        </Box>
      </Tooltip>
  )

}
