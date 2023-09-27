'use client'
import {createMultiStyleConfigHelpers, defineStyle, extendTheme} from '@chakra-ui/react'
import {CacheProvider} from '@chakra-ui/next-js'
import {ChakraProvider} from '@chakra-ui/react'
import {checkboxAnatomy} from '@chakra-ui/anatomy'
import {baseStyle} from '@chakra-ui/avatar/dist/avatar'
import {h} from '@chakra-ui/toast/dist/toast.types-f226a101'
import {size} from 'lodash'

const FRAMES_LIST = {
  fontSize: '0.8em',
  overflow: 'hidden',
  fontWeight: 400,
  px: 2,
  py: 0.5,
  noOfLines: 1
};

const FRAME_VIEW = {
  overflow: "visible",
  position: "absolute",
  borderWidth: "2px",
  borderStyle: 'solid',
  borderColor: "blackAlpha.600",
  backgroundColor: "white",
  display: "block"
}

const LINK_FRAME = {
  zIndex: 900000,
  position: 'absolute',
  borderWidth: '3px',
  borderStyle: 'solid',
  alignItems: 'start',
  p: 8
}

const CONTROL_PANEL_ITEM = {
  display: 'flex',
  flexDirection: 'row',
  px: 2,
  py: 1,
  borderWidth: 1,
  borderColor: 'blackAlpha.50'
}
const LIST_ITEM = {
  px: [1, 2, 2],
  py: [0.5, 1, 1],
  borderColor: 'alpha.50',
  borderWidth: 1,
  backgroundColor: 'white',
  _hover: {
    backgroundColor: 'accent-lt',
    borderColor: 'accent-dk',
  }
}
const LAYER_STYLES = {
  'control-panel-item':
  CONTROL_PANEL_ITEM,
  'confirm-dialog': {
    position: 'absolute',
    bottom: 14,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    pointerEvents: 'none',
    zIndex: 10000000,
  },
  'confirm-dialog-inner': {
    backgroundColor: 'whiteAlpha.600',
    p: 4,
    pointerEvents: 'all'
  },
  'grid-view-box': {
    position: 'absolute',
    w: '100vw',
    h: '100vh',
    left: 0,
    top: 0
  },
  'input-group-item-wrapper': {
    w: '100%',
    borderWidth: 1,
    borderRightColor: 'blackAlpha.200',
    borderTopColor: 'blackAlpha.200',
    borderBottomColor: 'blackAlpha.200',
    borderLeftColor: 'transparent',
    alignContent: 'center'
  },
  'input-label': {
    minWidth: '50px',
    flex: 0,
    textAlign: 'right',
    justifyContent: 'flex-end',
    backgroundColor: 'blackAlpha.50',
  },
  'input-label-sm': {
    minWidth: '40px',
    textAlign: 'right',
    flex: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'blackAlpha.50',
  },
  'control-panel-item-hover': {
    ...CONTROL_PANEL_ITEM,
    borderColor: 'accent',
    backgroundColor: 'blackAlpha.50'
  },
  'frame-placeholder-text': {
    px: 2,
    py: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  'frame-control-checkbox': {
    backgroundColor: 'white',
    mx: 3,
    my: 2,
  },
  'outline': {
    borderWidth: '1px',
    borderColor: 'blackAlpha.300',
    px: [1, 2, 2],
    py: 0,
    borderRadius: 2
  },
  'control-bar': {
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'white',
    shadow: 'base',
    zIndex: 10000000,
    py: 1,
    px: 3,
    Button: {
      textTransform: 'none',
      fontSize: '10pt',
      backgroundColor: 'transparent',
      _hover: {
        fontWeight: 600,
      }
    }
  },
  'popup-item': {
    w: '100%',
    px: 2,
    py: 1,
    _hover: {
      backgroundColor: 'hover-row',
    },
    _active: {
      backgroundColor: 'accent',
    }
  },
  'link-frame-target-locked': {
    ...LINK_FRAME,
    borderColor: 'nav-dark',
    backgroundColor: 'nav-alpha-lt',
    pointerEvents: 'all',
  }, 'link-frame-target': {
    ...LINK_FRAME,
    borderColor: 'nav',
    pointerEvents: 'none',
  },
  'line-view-button': {
    position: 'absolute',
    zIndex: 1000002000,
  },
  'line-view-flex': {
    pointerEvents: 'all',
    p: 4,
    backgroundColor: 'whiteAlpha.500'
  },
  'image-preview': {
    height: '250px',
    justifyContent: "center",
    align: 'center',
    width: '100%',
    backgroundImage: `url('/img/image-background.png')`,
    objectPosition: 'center'
  },
  'drop-target': {
    my: 2,
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderColor: 'nav',
    backgroundColor: 'nav-x-light',
    p: 2
  },
  'nav-frame': {
    direction: "row",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 0,
    pt: 2,
    px: 4,
    h: 8,
    w: "100%",
    as: "header",
    zIndex: 100000,
    backgroundColor: 'whiteAlpha.600',
    position: 'fixed',
    l: 0,
    r: 0,
    t: 0
  },
  'text-document': {
    px: 16,
    py: 10,
    h: '100%',
    overflowY: 'auto'
  },
  'move-outline': {
    position: 'absolute',
    borderColor: 'magenta',
    borderWidth: '1px',
    borderStyle: 'solid',
    zIndex: 100000
  },
  frameView: FRAME_VIEW,
  'frameView-tooSmall': {
    ...FRAME_VIEW,
    backgroundColor: 'frame-placeholder',
    overflow: 'visible',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: '50%',
    display: 'flex',
  },
  'frameView-hover': {
    ...FRAME_VIEW,
    borderColor: "frame-view-hover-border",
  },
  'frameView-clicked': {
    ...FRAME_VIEW,
    borderColor: "frame-view-clicked-border",
    boxSizing: 'border-box',
  },
  'frameView-clicked-hover': {
    ...FRAME_VIEW,
    borderColor: "frame-view-clicked-hover-border",
  },
  'frame-detail-wrapper': {
    display: "block",
    width: "100%",
    height: "100%",
    overflow: "hidden"
  },
  markdownOuter: {
    display: "block",
    as: 'div',
    width: "100%",
    height: "100%",
    overflow: "hidden"
  },
  label: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    px: 2,
    py: 0.5
  },
  keyHintRow: {
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.8)',
    px: 3,
    py: 2
  },
  newFrame: {
    position: "absolute",
    zIndex: "50",
    background: "black", color: "white",
    pad: 2,
    overflow: "hidden",
  },
  keyHint: {
    px: '3px',
    py: '2px',
    borderRadius: '0.333em',
    borderColor: 'gray.500',
    borderWidth: '1px',
    mr: 4,
    backgroundColor: 'white',
    width: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },

  'list-item': {
    ...LIST_ITEM
  },
  'list-item-active': {
    ...LIST_ITEM,
    borderColor: 'black'
  }
};

const COLORS = {
  accent: 'hsl(30,100%,50%)',
  'accent-dk': 'hsl(30,100%,33%)',
  'x-accent-dk': 'hsl(30,50%,25%)',
  'accent-lt': 'hsl(30,100%,75%)',
  'accent-xl': 'hsl(30,100%,85%)',
  'hover-row': 'hsl(60,100%,85%)',

  'frame-view-hover-border': 'hsla(30,100%,50%,0.5)',
  'frame-view-clicked-border': 'hsla(280,100%,50%,0.5)',
  'frame-view-clicked-hover-border': 'hsl(280,100%,66%)',
  'frame-placeholder': 'hsl(280,25%,66%)',

  'form-title': 'hsl(244,50%,25%)',
  'nav-x-light': 'hsl(200,100%,90%)',
  'nav-light': 'hsl(200,86%,80%)',
  'nav': 'hsl(200,55%,50%)',
  'nav-alpha-lt': 'hsla(200,55%,50%, 0.10)',
  'nav-alpha': 'hsla(200,55%,50%, 0.4)',
  'nav-dark': 'hsl(200,100%,25%)',
  'nav-dark-alpha': 'hsla(200,100%,25%, 0.333)',
  'nav-x-dark': 'hsl(200,100%,12.5%)',
  'editLink': 'hsl(228,70%,50%)',
  'active-button-back': 'hsl(30,50%,25%)',
  'button-back': 'hsl(30,0%,85%)',
  'active-button': 'hsl(30,100%,75%)',
  'active-button-bg': 'hsl(30,100%,33%)',
  'inactive-button': 'hsl(150,20%,50%)',
  'inactive-button-bg': 'hsl(150,20%,25%)',
};

const TEXT_STYLES = {
  "frame-target-text": {
    fontSize: 'sm',
    fontWeight: 500
  },
  'table-head': {
    fontSize: 'md',
    color: 'blackAlpha.600',
    fontWeight: 'normal',
    textAlign: 'center',
  },
  'control-panel-label': {
    fontSize: 'xs'
  },
  'footer-label': {
    fontSize: '10pt',
    size: "xs"
  },
  'popup-item': {
    fontSize: '0.8em',
    noOfLines: 1,
  },
  'pagination-number': {
    fontSize: '0.8em'
  },
  'link-frame-target': {
    color: 'nav-x-dark',
    fontSize: 'lg',
    fontWeight: 600,
    textAlign: 'left',
  },
  par: {
    fontSize: 'md',
    mb: '8',
    mt: '4'
  },
  markdownHead: {
    fontWeight: 'normal',
    textAlign: 'center',
    color: 'blackAlpha.200',
    numLines: 1,
    _hover: {
      color: 'black'
    }
  },
  'frame-list-item': FRAMES_LIST,
  'frame-list-item-edit': {
    ...FRAMES_LIST,
    color: 'nav-dark-alpha',
    _hover: {
      color: 'nav-dark',
      textDecoration: 'underline'
    }
  },
  'frames-list-head': {
    ...FRAMES_LIST,
    color: 'blackAlpha.700',
    borderBottom: '1px solid gray',
    borderColor: 'blackAlpha.300',
    textAlign: 'center'
  },
  code: {
    fontFamily: 'var(--font-space-mono) monospace',
    fontSize: 'sm',
    lineHeight: '100%'
  },
  info: {
    fontSize: '0.85em',
    color: 'blackAlpha.600',
    fontWeight: 300,
  },
  'info-sm': {
    fontSize: 'sm',
    color: 'blackAlpha.500',
    fontWeight: 300,
  },
  'info-xs': {
    fontSize: 'xs',
    color: 'blackAlpha.400',
    fontWeight: 300,
  },
  'info-dropzone': {
    color: 'nav-dark',
    fontSize: 'sm',
    textAlign: 'center',
    py: 3
  },
  keyHintKey: {
    textAlign: 'center',
    fontSize: 'sm',
    color: 'black'
  },
  keyHint: {
    textAlign: 'center',
    fontSize: 'sm',
    color: 'gray.700'
  }
};

const BUTTONS = {
  'pagination-button': defineStyle({
    size: 'sm',
    p: 1,
    h: 'auto',
    background: 'white',
    borderRadius: 0,
  }),
  'frame-control-icon': {
    ml: 1,
    p: 2,
    w: "36px",
    h: "36px",
    backgroundColor: "white",
    isRound: true,
    border: "1px solid black",
    borderColor: "blackAlpha.500"
  },
  controlIcon: {
    size: 'sm',
    isRound: true,
    backgroundColor: 'rgba(0,0,0,0)',
    _hover: {
      backgroundColor: 'rgba(0,0,0,0)',
    }
  },
  'frame-link-locker': {
    pointerEvents: 'all',
    colorScheme: 'teal',
    size: 'sm',
    fontWeight: 600
  },
  nav: {
    borderColor: 'nav-x-light',
    background: 'white',
    _hover: {
      color: 'nav-dark',
      backgroundColor: 'nav-x-light',
    }
  },
  delete: {
    borderColor: 'red.100',
    color: 'red.500',
    background: 'white',
    _hover: {
      color: 'red.800',
      backgroundColor: 'red.50',
    }
  },
  submit: {
    borderWidth: '1px',
    borderColor: 'accent-lt',
    backgroundColor: 'white',
    _hover: {
      color: 'x-accent-dk',
      backgroundColor: 'accent-xl'
    }
  },
  'frame-list-button': {
    h: 'auto',
    isRound: true,
    w: '100%',
    p: 0.5,
    backgroundColor: 'nav-alpha-lt',
    textAlign: 'center',
    fontSize: '0.8em',
    borderRadius: '8px',
    textTransform: 'none',
    _hover: {
      backgroundColor: 'nav-alpha',
      fontWeight: 800
    }
  },
  'frame-list-button-icon': {
    h: 'auto',
    isRound: true,
    p: 0,
    backgroundColor: 'transparent',
    textAlign: 'center',
    _hover: {
      backgroundColor: 'transparent',
      fontWeight: 800
    }
  },
  "map-link-button": {
    textTransform: 'none',
    fontWeight: 500,
    fontSize: 'sm',
    backgroundColor: 'white',
    height: 'auto',
    px: 2,
    py: 1,
    borderWidth: 2,
    color: 'nav-dark',
    borderColor: 'nav',
    shadow: 'md'
  },
  "frame-target-link-button": {
    textTransform: 'none',
    fontSize: 'sm',
    fontWeight: 500,
    color: 'black',
    backgroundColor: 'gray.300',
    height: 'auto',
    px: 2,
    py: 1,
    shadow: 'md'
  }
};

const {definePartsStyle, defineMultiStyleConfig} =
    createMultiStyleConfigHelpers(checkboxAnatomy.keys)

const CheckboxBaseStyle = definePartsStyle({
  // define the part you're going to style

  control: {
    padding: 1, // change the padding of the control
    borderRadius: 0, // change the border radius of the control
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    mx: 2,
    shadow: 'md'
  },
})

export const checkboxTheme = defineMultiStyleConfig({baseStyle: CheckboxBaseStyle})

const theme = extendTheme({
  layerStyles: LAYER_STYLES,
  colors: COLORS,
  components: {
    IconButton: {
      variants: BUTTONS
    },
    Button: {
      baseStyle: {
        textTransform: 'uppercase',
        fontWeight: 300,
        px: 2,
        py: 0.5,
        borderRadius: '0.333em',
        lineHeight: '100%',
        _hover: {
          fontWeight: 500
        }
      },

      variants: BUTTONS
    },
    FormLabel: {
      baseStyle: {
        fontStyle: 'italic',
        color: 'form-title',
        fontWeight: 400,
        fontSize: 'sm',
        mb: '2px'
      }
    },
    Checkbox: checkboxTheme,
    Card: {
      variants: {
        ['form-card']: {
          container: {
            borderRadius: 0,
            boxShadow: 'lg',
            Input: {
              backgroundColor: 'white'
            }
          },
          footer: {
            justifyContent: 'flex-end',
            align: 'center',
            width: '100%',
            p: 1
          }
        },
        ['list-item']: {
          header: {
            p: [1, 1.5],
          },
          container: {
            w: "100%",
            m: [0.25, 0.5],
            p: 0,
            borderRadius: 0
          },
          body: {
            borderRadius: 0,
            px: 1.5,
            py: 0.5,

          },
          footer: {
            justifyContent: 'flex-end',
            align: 'center',
            width: '100%',
            p: 1
          }
        }
      }
    },
    Heading: {
      baseStyle: {},
      variants: {
        'dialog-subhead': {
          fontSize: 'lg',
          color: 'blackAlpha.700',
          py: 2
        },
        markdownHead: {
          fontWeight: 'normal',
          noOfLines: 1,
          position: 'absolute',
          width: '100%',
          _hover: {
            color: 'black'
          }
        },
        "accordionHead": {
          fontSize: 'xs',
          fontWeight: 600,
          lineHeight: '100%'
        },
        textTitle: {
          fontSize: '2xl',
          textAlign: 'center'
        }
      }
    },
    Text: {},
  },

  textStyles: TEXT_STYLES
});

export function ChakraProviders({children}: {
  children: React.ReactNode
}) {
  return (
      <CacheProvider>
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </CacheProvider>
  )
}
