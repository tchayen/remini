import { transformSync } from "@babel/core";
import babelPlugin from ".";

const transform = (code) => {
  return transformSync(code, {
    babelrc: false,
    configFile: false,
    parserOpts: {
      sourceType: "module",
      allowAwaitOutsideFunction: true,
      plugins: [],
    },
    plugins: [babelPlugin],
    ast: true,
  });
};

const source = `
import { createElement as c, useState } from "../../packages/remini/lib";

const trap = () => {
  return "test";
};

const local = "a";

const A = () => {
  const [counter, setCounter] = useState(0);
  const onClick = () => setCounter(counter + 1);

  return c(
    "div",
    {},
    c("button", { onClick }, \`Clicked \${counter} times! \${secondState}\`)
  );
};

function B() {
  return c("div", {}, "B");
}

const C = function () {
  return c("div", "C");
};

export const D = () => {
  return c("div", "D");
};

export const E = function () {
  return c("div", "E");
};

export default A;
`;

const expected = `
import { createElement as c, useState } from "../../packages/remini/lib";

const trap = () => {
  return "test";
};

const local = "a";

const A = () => {
  const [counter, setCounter] = useState(0);

  const onClick = () => setCounter(counter + 1);

  return c("div", {}, c("button", {
    onClick
  }, \`Clicked \${counter} times! \${secondState}\`));
};

$RefreshReg$(A, $id$(), "A", "[counter, setCounter] = useState(0)")

function B() {
  return c("div", {}, "B");
}

$RefreshReg$(B, $id$(), "B")

const C = function () {
  return c("div", "C");
};

$RefreshReg$(C, $id$(), "C")
export const D = () => {
  return c("div", "D");
};
$RefreshReg$(D, $id$(), "D");
export const E = function () {
  return c("div", "E");
};
$RefreshReg$(E, $id$(), "E");
export default A;
`.trim();

describe("Babel plugin", () => {
  it("works with various function declaration methods", () => {
    const result = transform(source);
    expect(result.code).toBe(expected);
  });
});
