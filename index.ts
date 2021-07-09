import { createElement, render, useState } from "./lib";

const Counter = () => {
  const [value, setValue] = useState(0);

  document.addEventListener("click", () => {
    console.log("click");
  });

  return createElement("div", {}, [
    createElement("div", {}, [`${value}`]),
    createElement(
      "button",
      {
        onclick: () => {
          console.log("a");
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
