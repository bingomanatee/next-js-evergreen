import { Box, useBoolean, Text, HStack, Tooltip } from '@chakra-ui/react'
import Image from 'next/image'
import src from 'react-mapbox-gl/src'
import { label } from 'three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements'
import px from '~/lib/utils/px'


export default function ControlBarItem(
  {
    icon,
    iconItem = null,
    height = 25,
    showOpen = false,
    label,
    children,
    onClick,
    rightAlign = false
  }) {

  const [isDown, isDownState] = useBoolean(false);
  const [isHover, isHoverState] = useBoolean(false);

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
        onClick={onClick}
        layerStyle={`control-panel-item${isHover || showOpen ? '-hover' : ''}`}
      >
        {iconItem || <Image
          src={icon}
          alt={label}
          width={20}
          height={20}
        />}
        {children ? (
          <Box position="absolute"
               {...(rightAlign ? { right: 0 } : { left: 0 })}
               top={px(-height)} visibility={isHover ? 'visible' : 'hidden'}>
            {children}
          </Box>
        ) : null}
      </Box>
    </Tooltip>
  )

}
