import { createElement as c, render, useState } from "./lib";

const Counter = () => {
  const [value, setValue] = useState(0);

  const onClick = () => {
    setValue(value + 1);
  };

  const dom = c("div", { class: "p-10" }, [
    c("div", { class: "mb-4 text-xl" }, `${value}`),
    c(
      "button",
      {
        onClick,
        class:
          "bg-green-500 hover:bg-green-600 py-2 px-4 rounded-xl text-white font-medium",
      },
      "Counter++"
    ),
  ]);

  return dom;
};

const tree = c("div", {}, [c(Counter, {}, [])]);
const root = document.getElementById("root");

render(tree, root!);
