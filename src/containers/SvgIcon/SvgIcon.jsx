import React from "react";

const getPath = (title, customClass) => {
  let element = null;
  switch (title) {
    case "arrow-down":
      element = (
        <svg
          id={title}
          width="10px"
          className={customClass}
          height="14px"
          viewBox="0 0 10 14"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <g
            id="v2"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <g
              id="A01"
              transform="translate(-758.000000, -17.000000)"
              fill="#ED0F00"
              fillRule="nonzero"
            >
              <g id="icons" transform="translate(661.000000, 17.000000)">
                <g
                  id="ic_callquality"
                  transform="translate(97.000000, 0.000000)"
                >
                  <path
                    d="M9.75593242,8.70707774 L5.58917894,13.7071224 C5.26375549,14.0976259 4.73624451,14.0976259 4.41082106,13.7071224 L0.244067585,8.70707774 C-0.0813558616,8.31657426 -0.0813558616,7.6835686 0.244067585,7.29306512 C0.569491031,6.90256163 1.09700202,6.90256163 1.42242547,7.29306512 L4.16664931,10.5860945 L4.16664931,1 C4.16664931,0.447503996 4.53957374,0 5,0 C5.46042626,0 5.83335069,0.447503996 5.83335069,1 L5.83335069,10.5860945 L8.57757453,7.29306512 C8.74007792,7.09806338 8.9534157,7.0000625 9.16675347,7.0000625 C9.38009125,7.0000625 9.59342903,7.09756337 9.75593242,7.29306512 C10.0813559,7.6835686 10.0813559,8.31657426 9.75593242,8.70707774 Z"
                    id="icon_arr_down"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      );
      break;
    case "arrow-up":
      element = (
        <svg
          id={title}
          className={customClass}
          width="10px"
          height="14px"
          viewBox="0 0 10 14"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <g
            id="v2"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <g
              id="A01"
              transform="translate(-768.000000, -17.000000)"
              fill="#82C36C"
              fillRule="nonzero"
            >
              <g id="icons" transform="translate(661.000000, 17.000000)">
                <g
                  id="ic_callquality"
                  transform="translate(97.000000, 0.000000)"
                >
                  <path
                    d="M19.7559324,8.70707774 L15.5891789,13.7071224 C15.2637555,14.0976259 14.7362445,14.0976259 14.4108211,13.7071224 L10.2440676,8.70707774 C9.91864414,8.31657426 9.91864414,7.6835686 10.2440676,7.29306512 C10.569491,6.90256163 11.097002,6.90256163 11.4224255,7.29306512 L14.1666493,10.5860945 L14.1666493,1 C14.1666493,0.447503996 14.5395737,0 15,0 C15.4604263,0 15.8333507,0.447503996 15.8333507,1 L15.8333507,10.5860945 L18.5775745,7.29306512 C18.7400779,7.09806338 18.9534157,7.0000625 19.1667535,7.0000625 C19.3800913,7.0000625 19.593429,7.09756337 19.7559324,7.29306512 C20.0813559,7.6835686 20.0813559,8.31657426 19.7559324,8.70707774 Z"
                    id="icon_arr_up"
                    transform="translate(15.000000, 7.000000) scale(1, -1) translate(-15.000000, -7.000000) "
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      );
      break;
    default:
      element = null;
  }
  return element;
};

export const SvgIcon = (props) => {
  let customClass = "";
  if (props.customClass) {
    customClass = props.customClass;
  }
  return <>{getPath(props.name, customClass)}</>;
};
