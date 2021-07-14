import { createElement as c, render, useState } from "./lib";

const Counter = () => {
  const [value, setValue] = useState(0);

  const onClick = () => {
    setValue(value + 1);
  };

  const dom = c("div", {}, [
    c("div", {}, `${value}`),
    c("button", { onClick }, "Click"),
  ]);

  return dom;
};

const tree = c("div", {}, [c(Counter, {}, [])]);
const root = document.getElementById("root");

render(tree, root!);
