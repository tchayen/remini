import {
  createElement as c,
  useEffect,
  useRef,
} from "../../../packages/remini/lib";
import { MIN_WIDTH_TO_DISPLAY_TEXT } from "./consts";

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
    <div
      class="g"
      style={{
        transform: `translate(${Math.floor(x)}px,${y}px)`,
        opacity: isDimmed ? 0.5 : 1,
        width: `${Math.floor(width) - 1}px`,
        height: `${height - 1}px`,
        backgroundColor,
      }}
      onClick={onClick}
    >
      {width >= MIN_WIDTH_TO_DISPLAY_TEXT && (
        <div
          class="text"
          style={{ color, transform: `translate(${x < 0 ? -x : 0}px,0)` }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Rectangle;
