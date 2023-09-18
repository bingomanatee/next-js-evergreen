import * as React from "react";

const EditIcon = (props) => <svg
    width="100%"
    height="100%"
    viewBox="0 0 25 25"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2
    }} {...props} >
  <rect id="edit" x={0.773} y={0.074} width={24} height={24} style={{
    fill: "none"
  }}/>
  <clipPath id="_EditIconClip">
    <rect id="edit1" x={0.773} y={0.074} width={24} height={24}/>
  </clipPath>
  <g clipPath="url(#_EditIconClip)">
    <path d="M0.773,7.31L8.773,0.126L24.773,16.291L24.773,24.074L17.388,24.074L0.773,7.31Z" style={{
      fill: "currentcolor"
    }}/>
  </g>
</svg>;
export default EditIcon;
