'use client'
import { extendTheme } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

const FRAMES_LIST = {
  as: 'div',
  fontSize: '0.8em',
  overflow: 'hidden',
  fontWeight: 400,
  px: 3,
  py: 1,
  noOfLines: 1
};

const EDIT_LINK = {
  color: 'editLink',
  _hover: {
    textDecoration: 'underline'
  }
}

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
  justifyContent: 'center',
  alignItems: 'center',
}

const LAYER_STYLES = {
  'link-frame-target-locked': {
    ...LINK_FRAME,
    borderColor: 'nav-dark',
    backgroundColor: 'nav-alpha',
    pointerEvents: 'all',
  }, 'link-frame-target': {
    ...LINK_FRAME,
    borderColor: 'nav',
    pointerEvents: 'none',
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
    justify: "space-between",
    align: "center",
    py: 0, pt: 2, h: 8,
    px: 4,
    w: "100%",
    as: "header",
    zIndex: 100000,
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
  'frameView-hover': {
    ...FRAME_VIEW,
    borderColor: "frame-view-hover-border",
  },
  'frameView-clicked': {
    ...FRAME_VIEW,
    borderColor: "frame-view-clicked-border",
  },
  'frameView-clicked-hover': {
    ...FRAME_VIEW,
    borderColor: "frame-view-clicked-hover-border",
  },
  frameDetailWrapper: {
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
  }
};

const COLORS = {
  accent: 'hsl(30,100%,50%)',
  'dark-accent': 'hsl(30,100%,33%)',
  'x-dark-accent': 'hsl(30,50%,25%)',
  'light-accent': 'hsl(30,100%,75%)',
  'x-light-accent': 'hsl(30,100%,85%)',

  'frame-view-hover-border': 'hsla(30,100%,50%,0.5)',
  'frame-view-clicked-border': 'hsla(90,100%,50%,0.5)',
  'frame-view-clicked-hover-border': 'hsl(90,100%,50%)',

  'form-title': 'hsl(244,50%,25%)',
  'nav-x-light': 'hsl(200,100%,90%)',
  'nav-light': 'hsl(200,86%,80%)',
  'nav': 'hsl(200,55%,50%)',
  'nav-alpha': 'hsla(200,55%,50%, 0.15)',
  'nav-dark': 'hsl(200,100%,25%)',
  'nav-x-dark': 'hsl(200,100%,12.5%)',
  'editLink': 'hsl(228,70%,50%)',
  'active-button-back': 'hsl(30,50%,25%)',
  'button-back': 'hsl(30,0%,85%)',
  'active-button': 'hsl(30,100%,75%)',
  'inactive-button': 'hsl(150,20%,33%)',
};

const TEXT_STYLES = {
  'link-frame-target': {
    color: 'nav-x-dark',
    fontSize: 'lg',
    fontWeight: 600,
    textAlign: 'center',
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
  framesListItem: FRAMES_LIST,
  'framesListItem-hover': {
    ...FRAMES_LIST,
    backgroundColor: 'light-accent'
  },
  'framesListItem-clicked-hover': {
    ...FRAMES_LIST,
    backgroundColor: 'accent'
  },
  'framesListItem-clicked': {
    ...FRAMES_LIST,
    backgroundColor: 'light-accent'
  },
  'framesListItem-edit': {
    ...FRAMES_LIST,
    ...EDIT_LINK
  },
  'framesListItem-edit-hover': {
    ...FRAMES_LIST,
    ...EDIT_LINK,
    backgroundColor: 'light-accent',
  },
  'framesListItem-edit-clicked': {
    ...FRAMES_LIST,
    ...EDIT_LINK,
    backgroundColor: 'light-accent',
  },
  'framesListItem-edit-clicked-hover': {
    ...FRAMES_LIST,
    ...EDIT_LINK,
    backgroundColor: 'accent',
  },

  framesListHead: {
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
    fontSize: 'sm',
    color: 'gray.700',
    padding: 3
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

const theme = extendTheme({
  layerStyles: LAYER_STYLES,
  colors: COLORS,
  components: {
    Button: {
      baseStyle: {
        textTransform: 'uppercase',
        fontWeight: 300,
        px: '8px',
        py: '2px',
        borderRadius: '0.333em',
        lineHeight: '100%',
        _hover: {
          fontWeight: 500
        }
      },

      variants: {
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
          borderColor: 'light-accent',
          backgroundColor: 'white',
          _hover: {
            color: 'x-dark-accent',
            backgroundColor: 'x-light-accent'
          }
        }
      }
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

export function ChakraProviders({ children }: {
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
