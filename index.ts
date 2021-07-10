import { createElement, render, useState } from "./lib";

const Counter = () => {
  const [value, setValue] = useState(0);

  return createElement("div", {}, [
    createElement("div", {}, [`${value}`]),
    createElement(
      "button",
      {
        onClick: () => {
          setValue(value + 1);
        },
        id: "counter",
      },
      ["Click"]
    ),
  ]);
};

const tree = createElement("div", {}, [createElement(Counter, {}, [])]);

render(tree);
