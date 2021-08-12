import "./style.css";

import {
  createElement as c,
  Fragment,
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

  const nodes = data.levels
    .map((level, i) => {
      // if (i > 20) {
      //   return [];
      // }

      return level.map((uid) => {
        const node = data.nodes[uid];
        const nodeLeft = scale(node.left);
        const nodeWidth = scale(node.width);

        if (nodeWidth < MIN_WIDTH_TO_DISPLAY) {
          return <></>;
        }

        if (
          nodeLeft + nodeWidth < focusedNodeLeft ||
          nodeLeft > focusedNodeLeft + focusedNodeWidth
        ) {
          return <></>;
        }

        return (
          <Rectangle
            backgroundColor={node.backgroundColor}
            color={node.color}
            label={node.name}
            height={ROW_HEIGHT}
            width={nodeWidth}
            x={nodeLeft - focusedNodeLeft}
            y={i * ROW_HEIGHT}
            isDimmed={i < data.nodes[focusedNode].depth}
            onClick={() => onClick(uid)}
          />
        );
      });
    })
    // TODO:
    // Property 'flat' does not exist on type 'any[][]'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2019' or later.ts(2550)
    .flat();

  return (
    <div
      style={{
        position: "relative",
        width: `${WIDTH - 1}px`,
        height: `${data.levels.length * ROW_HEIGHT}px`,
        overflow: "hidden",
      }}
    >
      {nodes}
    </div>
  );
};

render(<App />, document.getElementById("root"));
