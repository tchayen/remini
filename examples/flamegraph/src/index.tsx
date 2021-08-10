import { createElement as c, render } from "../../../packages/remini/lib";

const MIN_WIDTH_TO_DISPLAY = 1;
const MIN_WIDTH_TO_DISPLAY_TEXT = 12;
const ROW_HEIGHT = 20;
const TEXT_HEIGHT = 18;

// http://gka.github.io/palettes/#colors=#37AFA9,#FEBC38|steps=25|bez=0|coL=0
const backgroundColorGradient = [
  "#37afa9",
  "#4bb0a5",
  "#5ab0a1",
  "#67b19d",
  "#72b299",
  "#7cb295",
  "#86b390",
  "#8fb48c",
  "#97b488",
  "#9fb584",
  "#a6b680",
  "#aeb67b",
  "#b5b777",
  "#bcb772",
  "#c2b86e",
  "#c9b869",
  "#cfb965",
  "#d5b960",
  "#dbba5b",
  "#e1ba56",
  "#e7bb50",
  "#edbb4b",
  "#f3bb45",
  "#f8bc3f",
  "#febc38",
];

type RectangleProps = {
  x: number;
  y: number;
  isDimmed?: boolean;
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
  label: string;
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
}: RectangleProps) => {
  return (
    <g style={{ transition: "all ease-in-out 200ms" }}>
      <rect width={width} height={height} fill={backgroundColor}></rect>
      <foreignObject
        width={width}
        height={height}
        style={{
          transition: "all ease-in-out 200ms",
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
            transition: "all ease-in-out 200ms",
            userSelect: "none",
            //
            color,
          }}
        >
          {label}
        </div>
      </foreignObject>
    </g>
  );
};

type ChartNode = {
  backgroundColor: string;
  color: string;
  depth: number;
  left: number;
  name: string;
  tooltip?: string;
  width: number;
};

type ChartData = {
  height: number;
  levels: string[][];
  nodes: { [uid: string]: ChartNode };
  root: string;
};

const data: ChartData = {
  height: 4,
  levels: [["0"], [], [], []],
  nodes: {
    "0": {
      backgroundColor: "#ff00ff",
      color: "#ffffff",
      depth: 0,
      left: 0,
      width: 100,
      name: "0",
    },
  },
  root: "0",
};

const App = () => {
  const hm = data.levels
    .map((level, i) =>
      level.map((node) => (
        <Rectangle
          backgroundColor={data.nodes[node].backgroundColor}
          color={data.nodes[node].color}
          height={ROW_HEIGHT}
          width={data.nodes[node].width}
          label={data.nodes[node].name}
          x={data.nodes[node].left}
          y={i * ROW_HEIGHT}
        />
      ))
    )
    // TODO:
    // Property 'flat' does not exist on type 'any[][]'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2019' or later.ts(2550)
    .flat();

  return (
    <svg width="100vw" height="100vh" viewBox="0 0 100 100">
      {/* <Rectangle
          backgroundColor="#ff00ff"
          color="#fff"
          height={24}
          width={50}
          label="Test"
          x={0}
          y={0}
        /> */}
      {hm}
    </svg>
  );
};

render(<App />, document.getElementById("root"));
