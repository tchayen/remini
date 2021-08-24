import {
  createElement as c,
  render,
  renderWithConfig,
} from "../../../packages/remini/lib";
import {
  HostElement,
  HostNode,
  RNode,
  TextNode,
} from "../../../packages/remini/types";
import {
  findClosestComponent,
  findClosestHostNode,
} from "../../../packages/remini/utils";

const App = () => {
  return (
    <box x={100} y={100} width={50} height={200} color="#ffd000">
      123
    </box>
  );
};

const root = document.getElementById("root");

if (!root) {
  throw new Error('<div id="root"></div> element not found in index.html.');
}

const canvas = document.createElement("canvas");
root.appendChild(canvas);

const width = window.innerWidth;
const height = window.innerHeight;
const pixelRatio = window.devicePixelRatio;

canvas.setAttribute("style", `width:${width}px;height:${height}px`);
canvas.width = width * pixelRatio;
canvas.height = height * pixelRatio;

const gl = canvas.getContext("webgl");

if (gl === null) {
  throw new Error("Failed to setup GL context");
}

gl.clearColor(0, 0, 0, 0);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
gl.enable(gl.BLEND);

const config = {
  host: {
    appendChild: (parent: any, child: any) => {
      console.log("appendChild", parent, child);
    },
    createHostNode: (element: HostElement) => {
      if (!["box", "matrix"].includes(element.tag)) {
        throw new Error("Unsupported native tag.");
      }
      console.log("createHostNode", `<${element.tag} />`, element.props);

      return {
        whatIsIt: "hostNode",
      };
    },
    createTextNode: (text: string) => {
      console.log("createTextNode", text);
    },
    removeHostNode: (node: RNode) => {
      console.log("removeHostNode", node);
    },
    updateHostNode: (current: HostNode, expected: HostElement) => {
      console.log("updateHostNode", current, expected);
    },
    updateTextNode: (current: TextNode, text: string) => {
      console.log("updateTextNode", current, text);
    },
    findClosestComponent,
    findClosestHostNode,
  },
};

renderWithConfig(<App />, root, config);
