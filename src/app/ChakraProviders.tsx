'use client'
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  layerStyles: {
    'text-document': {
      px: 16,
      py: 10,
      h: '100%',
      overflowY: 'auto'
    }
  },
  colors: {
    accent: 'hsl(30,100%,50%)',
    'dark-accent': 'hsl(30,100%,33%)',
    'x-dark-accent': 'hsl(30,50%,25%)',
    'light-accent': 'hsl(30,100%,75%)',
    'x-light-accent': 'hsl(30,100%,85%)',
    'form-title': 'hsl(244,50%,25%)',
    'nav-x-light': 'hsl(200,100%,90%)',
    'nav-light': 'hsl(200,86%,80%)',
    'nav': 'hsl(200,55%,50%)',
    'nav-dark': 'hsl(200,100%,25%)',
  },
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
            'border-radius': 0,
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
            'border-radius': 0
          },
          body: {
            'border-radius': 0,
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
      variants: {
        textTitle: {
          fontSize: '2xl',
          textAlign: 'center'
        }
      }
    },
    Text: {}
  },

  textStyles: {
    par: {
      fontSize: 'md',
      mb: '8',
      mt: '4'
    },
  }
});

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'

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
