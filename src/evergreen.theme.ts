import { defaultTheme, mergeTheme } from 'evergreen-ui'

const theme = {
  /* colors,
   fills,
   intents,
   radii,
   shadows,*/
  fontFamilies: {
    display: '...',
    ui: '...',
    mono: '...',
  },
  fontSizes: {
    /* ... */
  },
  fontWeights: {
    /* ... */
  },
  letterSpacings: {
    /* ... */
  },
  lineHeights: [
    /* ... */
  ],
  /*  zIndices,*/
  components: {
    Alert: {
      /* ... */
    },
    Avatar: {
      /* ... */
    },
    Badge: {
      /* ... */
    },
    Button: {
      /* ... */
    },
    Card: {
      /* ... */
    },
    Checkbox: {
      /* ... */
    },
    Code: {
      /* ... */
    },
    DialogBody: {
      /* ... */
    },
    DialogFooter: {
      /* ... */
    },
    DialogHeader: {
      /* ... */
    },
    Group: {
      /* ... */
    },
    Heading: {
      /* ... */
    },
    Icon: {
      /* ... */
    },
    InlineAlert: {
      /* ... */
    },
    Input: {
      /* ... */
    },
    Label: {
      /* ... */
    },
    List: {
      /* ... */
    },
    Link: {
      /* ... */
    },
    MenuItem: {
      /* ... */
    },
    Option: {
      /* ... */
    },
    Pane: {
      appearances: {
        pageMenu: {
          as: 'nav',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          pad: 'sm',
          justifyContent: 'between',
          alignItems: 'center'
        },
        mainFrame: {
          width: '100%',
          as: 'main',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hide',
          borderWidth: '1px',
          borderColor: 'red',
          backgroundColor: 'red'
        }
      }
      /* ... */
    },
    Paragraph: {
      /* ... */
    },
    Radio: {
      /* ... */
    },
    Select: {
      /* ... */
    },
    Spinner: {
      /* ... */
    },
    Switch: {
      /* ... */
    },
    Tab: {
      /* ... */
    },
    Table: {
      /* ... */
    },
    TableCell: {
      /* ... */
    },
    TableHead: {
      /* ... */
    },
    TableRow: {
      /* ... */
    },
    TagInput: {
      /* ... */
    },
    Text: {
      /* ... */
    },
    TextDropdownButton: {
      /* ... */
    },
    Tooltip: {
      /* ... */
    },
  },
}

//@ts-ignore
export default mergeTheme(defaultTheme, theme);
