import { createElement as c, render, useEffect, useState } from "./lib";

const Counter = () => {
  const [value, setValue] = useState(0);

  const onClick = () => {
    setValue(value + 1);
  };

  return c("div", { class: "p-10 bg-green-100 h-screen" }, [
    c("div", { class: "mb-4 text-2xl" }, `${value}`),
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
};

const tree = c("div", {}, [c(Counter, {}, [])]);
const root = document.getElementById("root");

render(tree, root!);
