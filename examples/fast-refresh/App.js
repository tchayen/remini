import { createElement as c, useState } from "../../packages/remini/lib";

// If anything appears inside - means things went wrong;
const trap = () => {
  return "test";
};

// This should not be recognized as component.
const local = "a";

const A = () => {
  const [counter, setCounter] = useState(0);
  const [secondState, setSecondState] = useState(10);
  const onClick = () => setCounter(counter + 1);

  return c(
    "div",
    {},
    c("button", { onClick }, `Clicked ${counter} times! ${secondState}`)
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
