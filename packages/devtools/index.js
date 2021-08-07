import { createElement as c, render } from "./remini.js";

chrome.devtools.panels.create("Remini", "", "/panel.html", (panel) => {
  const root = document.getElementById("root");

  const App = () => {
    return c(
      "div",
      {
        style: {
          background: "white",
          width: "100vw",
          height: "100vh",
        },
        class: "text-xl",
      },
      "abcd123"
    );
  };

  render(c(App), root);
});
