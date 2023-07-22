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
    <g transform="matrix(1,0,0,1,-89,-347.27)">
      <g
        id="dp-image-button"
        transform="matrix(0.888889,0,0,0.909583,165.889,106.395)"
      >
        <rect
          x={-86.5}
          y={264.819}
          width={36}
          height={35.181}
          style={{
            fill: "none",
          }}
        />
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
                  "var(--chakra-colors-button-back)",
              }}
            />
          </g>
          <g transform="matrix(1.2375,0,0,1.20935,-194.725,-62.2539)">
            <clipPath id="_clip2">
              <rect x={92} y={275} width={20} height={20} />
            </clipPath>
            <g clipPath="url(#_clip2)">
              <path
                d="M89,287L97.41,278.59L103.239,284.419L106.555,281.103L113.578,288.127L114,300L89,299L89,287Z"
                style={{
                  fill: "currentcolor",
                }}
              />
            </g>
            <path
              d="M112,275L112,295L92,295L92,275L112,275ZM111.091,275.909L92.909,275.909L92.909,294.091L111.091,294.091L111.091,275.909Z"
              style={{
                fill: "currentcolor",
              }}
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
)
export { SvgComponent as ImageIcon }
