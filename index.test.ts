import {
  createElement as c,
  render,
  useEffect,
  useState,
  _rootNode,
} from "./lib";

jest.useFakeTimers();

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("createElement", () => {
  it("works for simple HTML", () => {
    const tree = c("button", {}, c("strong", {}, "Hello world"));

    const expected = {
      type: "button",
      props: {
        children: [
          {
            type: "strong",
            props: {
              children: "Hello world",
            },
          },
        ],
      },
    };

    expect(tree).toStrictEqual(expected);
  });

  it("works with props", () => {
    const tree = c("a", { href: "https://google.com" }, "Google");

    const expected = {
      type: "a",
      props: {
        href: "https://google.com",
        children: "Google",
      },
    };

    expect(tree).toStrictEqual(expected);
  });

  it("works with components", () => {
    const Title = ({ children }: { children: string }) => {
      return c("h1", {}, children);
    };

    const tree = c(
      "div",
      {},
      c(Title, {}, "Hello world"),
      c("span", {}, "Text")
    );

    const expected = {
      type: "div",
      props: {
        children: [
          {
            type: Title,
            props: {
              children: "Hello world",
            },
          },
          {
            type: "span",
            props: {
              children: "Text",
            },
          },
        ],
      },
    };

    expect(tree).toStrictEqual(expected);
  });

  it("works with array of children", () => {
    const Title = ({ children }: { children: string }) => {
      return c("h1", {}, children);
    };

    const tree = c("div", {}, [
      c(Title, {}, "Hello world"),
      c("span", {}, "Text"),
    ]);

    const expected = {
      type: "div",
      props: {
        children: [
          {
            type: Title,
            props: {
              children: "Hello world",
            },
          },
          {
            type: "span",
            props: {
              children: "Text",
            },
          },
        ],
      },
    };

    expect(tree).toStrictEqual(expected);
  });
});

describe("render", () => {
  it("works", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const Counter = ({ children }: { children: string }) => {
      return c(
        "div",
        {},
        c("span", {}, children),
        c("span", { style: "color: #ff0000" }, "0")
      );
    };

    const tree = c("div", {}, c(Counter, {}, "Counter: "), c("h1", {}, "Test"));

    render(tree, root);

    expect(_rootNode?.descendants[0].descendants).toHaveLength(2);
  });

  it("works with state", () => {
    const getPrintedNumber = () => {
      const node =
        _rootNode!.descendants[0].descendants[0].descendants[0].descendants[1];
      if (node.type === null) {
        throw new Error("Encountered null node.");
      }

      return node.props.children;
    };

    let update = () => {};

    const root = document.createElement("div");
    document.body.appendChild(root);

    const Counter = ({ children }: { children: string }) => {
      const [value, setValue] = useState(0);

      update = () => setValue(value + 1);

      return c(
        "div",
        {},
        c("span", {}, children),
        c("span", { style: "color: #ff0000" }, `${value}`)
      );
    };

    const tree = c("div", {}, c(Counter, {}, "Counter: "), c("h1", {}, "Test"));

    render(tree, root);

    expect(getPrintedNumber()).toBe("0");

    update();

    expect(getPrintedNumber()).toBe("1");
  });

  it("works with node replacing", () => {
    let update = () => {};

    const root = document.createElement("div");
    document.body.appendChild(root);

    const Alter = () => {
      const [show, setShow] = useState(false);

      update = () => {
        setShow(!show);
      };

      return c(
        "div",
        {},
        show ? c("span", {}, "Show") : null,
        c("div", {}, "This is always here")
      );
    };

    const tree = c(Alter);

    render(tree, root);

    expect(_rootNode!.descendants[0].descendants[0].descendants[0].type).toBe(
      null
    );

    update();

    expect(_rootNode!.descendants[0].descendants[0].descendants[0].type).toBe(
      "span"
    );

    update();

    expect(_rootNode!.descendants[0].descendants[0].descendants[0].type).toBe(
      null
    );
  });

  xit("works with node removal", () => {
    // TODO
  });
});

describe("useState", () => {
  it("doesn't take immediate effect on state value", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    let update = () => {};
    let nextValue;

    const App = () => {
      const [value, setValue] = useState(0);

      update = () => {
        setValue(value + 1);
        nextValue = value;
      };

      return c("span", {}, `${value}`);
    };

    render(c(App), root);

    expect(document.body.innerHTML).toBe("<div><span>0</span></div>");

    update();

    expect(nextValue).toBe(0);
    expect(document.body.innerHTML).toBe("<div><span>1</span></div>");
  });

  it("can be called more than once", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    let updateA = () => {};
    let updateB = () => {};

    const App = () => {
      const [a, setA] = useState("a");
      const [b, setB] = useState(0);

      updateA = () => {
        setA("b");
      };

      updateB = () => {
        setB(1);
      };

      return c("div", {}, c("span", {}, a), c("span", {}, b.toString()));
    };

    render(c(App), root);

    expect(document.body.innerHTML).toBe(
      "<div><div><span>a</span><span>0</span></div></div>"
    );

    updateA();

    expect(document.body.innerHTML).toBe(
      "<div><div><span>b</span><span>0</span></div></div>"
    );

    updateB();

    expect(document.body.innerHTML).toBe(
      "<div><div><span>b</span><span>1</span></div></div>"
    );
  });
});

describe("useEffect", () => {
  it("works with empty deps array", () => {
    let update = () => {};
    const mock = jest.fn();

    const root = document.createElement("div");
    document.body.appendChild(root);

    const App = () => {
      const [, setData] = useState("");

      update = () => setData("123");

      useEffect(() => {
        mock();
      }, []);

      return c("span", {}, "Hello");
    };

    const tree = c(App);

    render(tree, root);

    update();

    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("works with no deps array", () => {
    let update = () => {};
    const mock = jest.fn();

    const root = document.createElement("div");
    document.body.appendChild(root);

    const App = () => {
      const [, setData] = useState("");

      update = () => setData("123");

      useEffect(() => {
        mock();
      });

      return c("span", {}, "Hello");
    };

    const tree = c(App);

    render(tree, root);

    update();

    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("works with deps array", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const Profile = ({ username }: { username: string }) => {
      const [user, setUser] = useState<{ username: string } | null>(null);

      useEffect(() => {
        setUser({ username });
      }, [username]);

      return c("div", {}, c("span", {}, user ? user.username : "Anonymous"));
    };

    const tree = c(Profile, { username: "John" });

    render(tree, root);

    expect(document.body.innerHTML).toBe(
      "<div><div><span>John</span></div></div>"
    );
  });

  it("works with callback", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const mock = jest.fn();

    const Goodbye = () => {
      useEffect(() => {
        return () => mock();
      }, []);

      return c("span", {}, "Hello");
    };

    const App = () => {
      const [show, setShow] = useState(true);
      useEffect(() => {
        setShow(false);
      }, []);

      return c("div", {}, show ? c(Goodbye) : null);
    };

    render(c(App), root);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(document.body.innerHTML).toBe("<div><div></div></div>");
  });
});

describe("DOM", () => {
  it("works with basic elements", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const tree = c(
      "div",
      { id: "root" },
      c("a", { href: "https://google.com" }, "Google")
    );

    render(tree, root);

    expect(document.body.innerHTML).toBe(
      '<div><div id="root"><a href="https://google.com">Google</a></div></div>'
    );
  });

  it("works with components", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const Title = ({ children }: { children: string }) => {
      return c("h1", {}, children);
    };

    const tree = c(
      "div",
      {},
      c(Title, {}, "Hello world"),
      c("span", {}, "Text")
    );

    render(tree, root);

    expect(document.body.innerHTML).toBe(
      "<div><div><h1>Hello world</h1><span>Text</span></div></div>"
    );
  });

  it("works with event listeners", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const onClick = jest.fn();

    const Click = () => {
      return c("button", { id: "button", onClick }, "Click");
    };

    const tree = c(Click);

    render(tree, root);

    const button = document.getElementById("button");

    if (button === null) {
      throw new Error("Unexpected null.");
    }

    button.click();

    expect(onClick).toHaveBeenCalled();
  });

  it("works with updates", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const Counter = () => {
      const [value, setValue] = useState(0);

      const onClick = () => {
        setValue(value + 1);
      };

      return c(
        "div",
        {},
        c("span", { id: "value" }, `${value}`),
        c("button", { id: "button", onClick }, "Click")
      );
    };

    const tree = c(Counter);

    render(tree, root);

    const value = document.getElementById("value");
    const button = document.getElementById("button");

    if (value == null || button === null) {
      throw new Error("Unexpected null.");
    }

    expect(value.innerHTML).toBe("0");

    button.click();

    expect(value.innerHTML).toBe("1");
  });

  it("has text nodes updated", () => {
    // TODO
  });

  it("has text nodes removed", () => {
    // TODO
  });
});
