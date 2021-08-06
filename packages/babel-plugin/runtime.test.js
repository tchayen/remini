import RefreshRuntime from "./runtime";
import {
  createElement as c,
  render,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "../remini/lib";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Fast refresh runtime", () => {
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

  it("cleans up and re-runs hooks properly", () => {
    // TODO
    // Finish it and implement missing parts.

    const runOnEffect = jest.fn();
    const runOnCleanUp = jest.fn();

    const App = () => {
      const ref = useRef();
      const memo = useMemo(() => 2 * 2, []);

      useEffect(() => {
        runOnEffect();
        return () => {
          runOnCleanUp();
        };
      }, []);

      return c("div", {}, c("span", { ref }, "test"), c("span", {}, `${memo}`));
    };

    RefreshRuntime.register(
      App,
      "/User/test/Desktop/App.js",
      "App",
      // TODO
      // I think both ref and memo are not supported yet.
      "ref = useRef();memo = useMemo(() => 2 * 2, [])"
    );

    render(c(App), document.body);
  });

  it("doesn't destroy state of siblings or parent", () => {
    const Parent = ({ children }) => {
      const [counter, setCounter] = useState(0);
      const onClick = () => setCounter(counter + 1);
      return c(
        "div",
        {},
        c("button", { id: "parent", onClick }, `Parent clicked: ${counter}`),
        children
      );
    };

    const Sibling = () => {
      const [counter, setCounter] = useState(0);
      const onClick = () => setCounter(counter + 1);
      return c(
        "button",
        { id: "sibling", onClick },
        `Sibling clicked: ${counter}`
      );
    };

    const Current = () => {
      return c("div", {}, "abc");
    };

    RefreshRuntime.register(Current, "/User/test/Desktop/index.js", "Current");
    render(c(Parent, {}, c(Current), c(Sibling)), document.body);
    RefreshRuntime.performRefresh();

    const parentButton = document.getElementById("parent");
    const siblingButton = document.getElementById("sibling");

    parentButton.click();
    parentButton.click();
    siblingButton.click();
    siblingButton.click();
    siblingButton.click();

    expect(document.body.innerHTML).toBe(
      '<div><button id="parent">Parent clicked: 2</button><div>abc</div><button id="sibling">Sibling clicked: 3</button></div>'
    );

    const UpdatedCurrent = () => {
      return c("div", {}, "abcde");
    };

    RefreshRuntime.register(
      UpdatedCurrent,
      "/User/test/Desktop/index.js",
      "Current"
    );
    RefreshRuntime.performRefresh();

    expect(document.body.innerHTML).toBe(
      '<div><button id="parent">Parent clicked: 2</button><div>abcde</div><button id="sibling">Sibling clicked: 3</button></div>'
    );
  });

  it("preserve state of children", () => {
    const Child = () => {
      const [counter, setCounter] = useState(0);
      const onClick = () => setCounter(counter + 1);
      return c("button", { onClick, id: "child" }, `Clicked ${counter} times!`);
    };

    const App = () => {
      const [state, setState] = useState("a");
      return c("div", {}, c("span", {}, state), c(Child));
    };
    RefreshRuntime.register(
      App,
      "/User/test/Desktop/App.js",
      "App",
      "[state, setState] = useState('a')"
    );
    render(c(App), document.body);
    RefreshRuntime.performRefresh();

    const button = document.getElementById("child");

    button.click();
    button.click();

    expect(document.body.innerHTML).toBe(
      '<div><span>a</span><button id="child">Clicked 2 times!</button></div>'
    );

    const UpdatedApp = () => {
      const [state, setState] = useState("b");
      return c("div", {}, c("span", {}, state), c(Child));
    };
    RefreshRuntime.register(
      UpdatedApp,
      "/User/test/Desktop/App.js",
      "App",
      "[state, setState] = useState('b')"
    );
    RefreshRuntime.performRefresh();

    expect(document.body.innerHTML).toBe(
      '<div><span>b</span><button id="child">Clicked 2 times!</button></div>'
    );
  });

  // TODO
  // Find a way to test recovering from syntax errors.
});
