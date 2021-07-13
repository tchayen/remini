import { createElement as c, render, useState } from "./lib";

const Counter = () => {
  const [value, setValue] = useState(0);
  // console.log("render", value);

  const onClick = () => {
    setValue(value + 1);
  };

  const dom = c("div", {}, [
    c("span", {}, `${value}`),
    c("button", { onClick }, "Click"),
  ]);

  return dom;
};

const tree = c("div", {}, [c(Counter, {}, [])]);

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Root is missing from HTML.");
}

render(tree, root);
