import * as React from "react"
const SvgComponent = ({active}) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
  >
    <g transform="matrix(1,0,0,1,-130.876,-304.608)">
      <g
        id="dp-map-button"
        transform="matrix(0.888889,0,0,0.909583,207.765,63.733)"
      >
        <clipPath id="_clip1">
          <rect x={-86.5} y={264.819} width={36} height={35.181} />
        </clipPath>
        <g clipPath="url(#_clip1)">
          <g
            id="log-in-circle"
            transform="matrix(1.16129,0,0,1.13487,-109.726,-128.981)"
          >
            <path
              d="M35.5,347C44.055,347 51,353.945 51,362.5C51,371.055 44.055,378 35.5,378C26.945,378 20,371.055 20,362.5C20,353.945 26.945,347 35.5,347ZM35.5,350.875C29.084,350.875 23.875,356.084 23.875,362.5C23.875,368.916 29.084,374.125 35.5,374.125C41.916,374.125 47.125,368.916 47.125,362.5C47.125,356.084 41.916,350.875 35.5,350.875Z"
              style={{
                fill: "white",
              }}
            />
            <circle
              cx={35.5}
              cy={362.5}
              r={15.5}
              style={{
                fill: active ?  "var(--chakra-colors-active-button-back)":
                  "var(--chakra-colors-button-back)",              }}
            />
          </g>
          <g
            id="compass"
            transform="matrix(0.525,0,0,0.513056,-278.361,92.7206)"
          >
            <g transform="matrix(0.793946,0,0,0.8,78.4518,70)">
              <circle
                cx={405}
                cy={375}
                r={15}
                style={{
                  fill: "currentcolor",
                }}
              />
            </g>
            <g transform="matrix(2.5,0,0,2.5,-5.32907e-13,355)">
              <path
                d="M153.792,7.931L148,6L153.792,4.069C153.602,4.679 153.5,5.328 153.5,6C153.5,6.672 153.602,7.321 153.792,7.931ZM158.069,-0.208L160,-6L161.931,-0.208C161.321,-0.398 160.672,-0.5 160,-0.5C159.328,-0.5 158.679,-0.398 158.069,-0.208ZM166.208,4.069L172,6L166.208,7.931C166.398,7.321 166.5,6.672 166.5,6C166.5,5.328 166.398,4.679 166.208,4.069ZM161.931,12.208L160,18L158.069,12.208C158.679,12.398 159.328,12.5 160,12.5C160.672,12.5 161.321,12.398 161.931,12.208Z"
                style={{
                  fill: "currentcolor",
                }}
              />
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
)
export { SvgComponent as MapIcon }
