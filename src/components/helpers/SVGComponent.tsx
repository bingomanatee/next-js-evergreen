import { Component, createRef, RefObject } from 'react'
import { Box } from '@chakra-ui/react'
import { Dom, Svg, SVG } from '@svgdotjs/svg.js'


export class SVGComponent extends Component<any, any> {
  protected readonly containerRef: RefObject<HTMLElement | null>
  protected draw: Svg;

  constructor(props) {
    super(props);
    this.containerRef = createRef();
  }

  componentDidMount() {
    if (!this.draw) {
      this.draw = SVG()
        .addTo(this.containerRef.current!)
        .size('100%', '100%');
    }
  }

  render() {
    return <Box as="section"
                className="overflow-svg-container"
                position="absolute"
                overflow="show"
                w="100px" h="100px"
                ref={this.containerRef}
                pointerEvents="none"
    >
    </Box>
  }
}
