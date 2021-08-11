import {
  createElement as c,
  render,
  useMemo,
  useState,
} from "../../../packages/remini/lib";
import {
  BACKGROUND_COLORS_GRADIENT,
  MIN_WIDTH_TO_DISPLAY,
  ROW_HEIGHT,
  TEXT_COLOR,
} from "./consts";

import input from "./data.json";
import Rectangle from "./Rectangle";
import { ChartData, ChartNode, SourceNode } from "./types";

function processInput(node: SourceNode): ChartData {
  let depth = 0;
  let root: string | null = null;
  let id = 0;
  const nodes: { [uid: string]: ChartNode } = {};
  const levels: string[][] = [];

  function run(node: SourceNode, depth: number, valueFromLeft: number) {
    if (!Array.isArray(levels[depth])) {
      levels[depth] = [];
    }

    const chartNode: ChartNode = {
      uid: `node-${id}`,
      backgroundColor:
        BACKGROUND_COLORS_GRADIENT[
          Math.min(depth, BACKGROUND_COLORS_GRADIENT.length - 1)
        ],
      color: TEXT_COLOR,
      depth,
      left: valueFromLeft,
      name: node.name,
      width: node.value,
    };

    id += 1;
    if (root === null) {
      root = chartNode.uid;
    }

    levels[depth].push(chartNode.uid);
    nodes[chartNode.uid] = chartNode;

    if (!node.children) {
      return;
    }

    let valueSum = valueFromLeft;
    node.children.forEach((child) => {
      run(child, depth + 1, valueSum);
      valueSum += child.value;
    });
  }

  run(node, depth, 0);

  if (root === null) {
    throw new Error("Incorrect input.");
  }

  return {
    height: levels.length,
    levels,
    nodes,
    root,
  };
}

const WIDTH = 1508;

const App = () => {
  const data = useMemo(() => processInput(input), []);
  const [focusedNode, setFocusedNote] = useState(data.root);

  const onClick = (node: string) => {
    console.log(node);
    setFocusedNote(node);
  };

  const scale = (value: number) =>
    (value / data.nodes[focusedNode].width) * WIDTH;

  const focusedNodeLeft = scale(data.nodes[focusedNode].left);
  const focusedNodeWidth = scale(data.nodes[focusedNode].width);

  const hm = data.levels
    .map((level, i) => {
      return level.map((node) => {
        const nodeLeft = scale(data.nodes[node].left);
        const nodeWidth = scale(data.nodes[node].width);

        // if (nodeWidth < MIN_WIDTH_TO_DISPLAY) {
        //   return null;
        // }

        // if (
        //   nodeLeft + nodeWidth < focusedNodeLeft ||
        //   nodeLeft > focusedNodeLeft + focusedNodeWidth
        // ) {
        //   return null;
        // }

        return (
          <Rectangle
            backgroundColor={data.nodes[node].backgroundColor}
            color={data.nodes[node].color}
            label={data.nodes[node].name}
            height={ROW_HEIGHT}
            width={nodeWidth}
            x={nodeLeft - focusedNodeLeft}
            y={i * ROW_HEIGHT}
            isDimmed={i < data.nodes[focusedNode].depth}
            onClick={() => onClick(node)}
          />
        );
      });
    })
    // TODO:
    // Property 'flat' does not exist on type 'any[][]'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2019' or later.ts(2550)
    .flat();

  return (
    <svg
      width={WIDTH}
      height={data.levels.length * ROW_HEIGHT}
      viewBox={`0 0 ${WIDTH} ${data.levels.length * ROW_HEIGHT}`}
    >
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
