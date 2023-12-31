import * as React from "react";

const SvgComponent = () => <svg width="100%" height="100%" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve"
                                style={{
  fillRule: "evenodd",
  clipRule: "evenodd",
  strokeLinejoin: "round",
  strokeMiterlimit: 2
}}>
  <rect id="fi-map" x={0} y={0} width={32} height={32} style={{
    fill: "none"
  }}/>
  <g>
    <path d="M13.443,-0L2.898,-0L18.74,32L29.284,32L13.443,-0Z" style={{
      fillRule: "nonzero",
      fill: "currentcolor"
    }}/>
    <path d="M0,21.153L0,31.865L32,15.516L32,4.804L0,21.153Z" style={{
      fillRule: "nonzero",
      fill: "currentcolor"
    }}/>
  </g>
</svg>;
export default SvgComponent;
