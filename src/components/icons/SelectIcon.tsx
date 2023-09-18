import * as React from "react";

const SelectIcon = (props) => <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve"
                                 style={{
  fillRule: "evenodd",
  clipRule: "evenodd",
  strokeLinejoin: "round",
  strokeMiterlimit: 2
}} {...props} >
    <rect x={0} y={0} width={9} height={3} style={{
      fill: "currentColor"
    }}/>
    <rect x={0} y={21} width={9} height={3} style={{
      fill: "currentColor"
    }}/>
    <rect x={15} y={0} width={9} height={3} style={{
      fill: "currentColor"
    }}/>
    <rect x={15} y={21} width={9} height={3} style={{
      fill: "currentColor"
    }}/>
    <rect x={21} y={0} width={3} height={9} style={{
      fill: "currentColor"
    }}/>
    <rect x={0} y={0} width={3} height={9} style={{
      fill: "currentColor"
    }}/>
    <rect x={0} y={15} width={3} height={9} style={{
      fill: "currentColor"
    }}/>
    <rect x={21} y={15} width={3} height={9} style={{
      fill: "currentColor"
    }}/>
</svg>;
export default SelectIcon;
