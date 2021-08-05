import RefreshRuntime from "./runtime";
import { createElement as c, render, useState } from "../remini/lib";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Runtime", () => {
  it("works with simple component", () => {
    const App = () => {
      return c("div", {}, "abc");
    };
    RefreshRuntime.register(App, "/User/test/Desktop/App.js", "App");
    RefreshRuntime.performRefresh();

    render(c(App), document.body);

    expect(document.body.innerHTML).toBe("<div>abc</div>");

    const AppUpdated = () => {
      return c("div", {}, "abcde");
    };

    RefreshRuntime.register(AppUpdated, "/User/test/Desktop/App.js", "App");
    RefreshRuntime.performRefresh();

    expect(document.body.innerHTML).toBe("<div>abcde</div>");
  });

  it("works with useState hook", () => {
    const App = () => {
      const [counter, setCounter] = useState(0);
      const onClick = () => setCounter(counter + 1);
      return c(
        "button",
        { onClick, id: "button" },
        `Clicked ${counter} times!`
      );
    };
    RefreshRuntime.register(
      App,
      "/User/test/Desktop/App.js",
      "App",
      "[counter, setCounter] = useState(0)"
    );

    render(c(App), document.body);
    RefreshRuntime.performRefresh();

    expect(document.body.innerHTML).toBe(
      '<button id="button">Clicked 0 times!</button>'
    );

    const button = document.getElementById("button");
    button.click();
    button.click();

    expect(document.body.innerHTML).toBe(
      '<button id="button">Clicked 2 times!</button>'
    );

    const AppUpdated = () => {
      const [counter, setCounter] = useState(10);
      const onClick = () => setCounter(counter + 1);
      return c(
        "button",
        { onClick, id: "button" },
        `Clicked ${counter} times!`
      );
    };

    RefreshRuntime.register(
      AppUpdated,
      "/User/test/Desktop/App.js",
      "App",
      "[counter, setCounter] = useState(10)"
    );
    RefreshRuntime.performRefresh();

    expect(document.body.innerHTML).toBe(
      '<button id="button">Clicked 10 times!</button>'
    );
  });
});
