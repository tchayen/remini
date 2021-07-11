import { createElement, render, useState } from "./lib";

let update = null;

const Counter = () => {
  const [state, setState] = useState({ value: 0 });

  const onClick = () => {
    console.log("a");
    setState({ value: state.value + 1 });
  };

  update = () => setState({ value: state.value + 1 });

  return createElement("div", {}, [
    createElement("button", { id: "button", onClick }, ["Click"]),
    createElement("div", { id: "value" }, [`${state.value}`]),
  ]);
};

const tree = createElement("div", {}, [createElement(Counter, {}, [])]);

// render(tree);

const rendered = render(tree);

console.log(JSON.stringify(rendered, null, 2));

setTimeout(() => {
  update();
  console.log(JSON.stringify(rendered, null, 2));
}, 1500);
