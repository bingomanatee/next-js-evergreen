import { Box, Text } from '@chakra-ui/react'
import px from '~/lib/utils/px'

import * as React from "react";
import ImageIcon from '~/components/icons/ImageIcon'
import MapIcon from '~/components/icons/MapIcon'
import MarkdownIcon from '~/components/icons/MarkdownIcon'
import UnknownIcon from '~/components/icons/UnknownIcon'
import { FrameTypes } from '~/types'

export default function FrameIcon(props: { active: boolean, color?: string, type: string | FrameTypes, size: number }) {

  let { active, size = 20, type = 'unknown' } = props;

  let iconColor = active ? 'active-button' : 'inactive-button';
  let backgroundColor = active ? 'active-button-bg' : 'inactive-button-bg';
  if (size < 18) {
    iconColor = 'white';
    backgroundColor = 'black';
  }

  let Icon = UnknownIcon;
  switch(type) {
    case 'image':
      Icon = ImageIcon;
      break;

    case 'map':
      Icon = MapIcon;
      break;

    case 'markdown':
      Icon = MarkdownIcon;
      break;

    case FrameTypes.image:
      Icon = ImageIcon;
      type = 'image';
      break;

    case FrameTypes.markdown:
      Icon = MarkdownIcon;
      type = 'markdown'
      break;

    case FrameTypes.map:
      Icon = MapIcon;
      type = 'map';
      break;
  }
  return <Text color={iconColor}>
    <Box role={`frame-icon-${type}-${size}`}
         backgroundColor={backgroundColor}
         w={px(size+2)}
         h={px(size+2)}
         p="1px"
    >
      <Icon />
    </Box>
  </Text>
}
