import { createElement as c } from "../../../packages/remini/lib";
import { MIN_WIDTH_TO_DISPLAY_TEXT } from "./consts";
import { ChartNode } from "./types";

type RectangleProps = {
  x: number;
  y: number;
  isDimmed?: boolean;
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  label: string;
  onClick: (node: string) => void;
};

const transition = "all ease-in-out 0ms";

const Rectangle = ({
  x,
  y,
  isDimmed,
  width,
  height,
  color,
  backgroundColor,
  label,
  onClick,
}: RectangleProps) => {
  return (
    <g transform={`translate(${Math.floor(x)},${y})`} style={{ transition }}>
      <rect
        width={Math.floor(width) - 1}
        height={height - 1}
        fill={backgroundColor}
        onClick={onClick}
        style={{
          cursor: "pointer",
          transition,
          opacity: isDimmed ? 0.5 : 1,
        }}
      ></rect>
      {width >= MIN_WIDTH_TO_DISPLAY_TEXT && (
        <foreignObject
          width={Math.floor(width) - 1}
          height={height - 1}
          style={{
            transition,
            display: "block",
            pointerEvents: "none",
            //
            opacity: isDimmed ? 0.75 : 1,
            paddingLeft: x < 0 ? -x : 0,
          }}
          y={0}
        >
          <div
            style={{
              pointerEvents: "none",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              fontSize: "12px",
              fontFamily: "sans-serif",
              marginLeft: "4px",
              marginRight: "4px",
              lineHeight: 1.5,
              padding: 0,
              transition,
              userSelect: "none",
              //
              color,
            }}
          >
            {label}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default Rectangle;
