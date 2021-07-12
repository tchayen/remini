import { createElement as c, render, RNode, rootNode, useState } from "./lib";

describe("createElement", () => {
  it("works for simple HTML", () => {
    const tree = c("button", {}, [c("strong", {}, ["Hello world"])]);

    const expected = {
      type: "button",
      props: {
        children: [
          {
            type: "strong",
            props: {
              children: ["Hello world"],
            },
          },
        ],
      },
    };

    expect(tree).toStrictEqual(expected);
  });

  it("works with props", () => {
    const tree = c("a", { href: "https://google.com" }, ["Google"]);

    const expected = {
      type: "a",
      props: {
        href: "https://google.com",
        children: ["Google"],
      },
    };

    expect(tree).toStrictEqual(expected);
  });

  it("works with components", () => {
    const Title = ({ children }: { children: string }) => {
      return c("h1", {}, [children]);
    };

    const tree = c("div", {}, [
      c(Title, {}, ["Hello world"]),
      c("span", {}, ["Text"]),
    ]);

    const expected = {
      type: "div",
      props: {
        children: [
          {
            type: Title,
            props: {
              children: ["Hello world"],
            },
          },
          {
            type: "span",
            props: {
              children: ["Text"],
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
      return c("div", {}, [
        c("span", {}, children),
        c("span", { style: "color: #ff0000" }, "0"),
      ]);
    };

    const tree = c("div", {}, [
      c(Counter, {}, "Counter: "),
      c("h1", {}, "Test"),
    ]);

    render(tree, root);

    expect(rootNode?.descendants).toHaveLength(2);
  });

  it("works with state", () => {
    const getPrintedNumber = () => {
      return rootNode!.descendants[0].descendants[0].descendants[1].props
        .children;
    };

    let update;

    const root = document.createElement("div");
    document.body.appendChild(root);

    const Counter = ({ children }: { children: string }) => {
      const [value, setValue] = useState(0);

      update = () => setValue(value + 1);

      return c("div", {}, [
        c("span", {}, children),
        c("span", { style: "color: #ff0000" }, `${value}`),
      ]);
    };

    const tree = c("div", {}, [
      c(Counter, {}, "Counter: "),
      c("h1", {}, "Test"),
    ]);

    render(tree, root);

    expect(getPrintedNumber()).toBe("0");

    update();

    expect(getPrintedNumber()).toBe("1");
  });

  it("works with node removal", () => {
    let update;

    const root = document.createElement("div");
    document.body.appendChild(root);

    const Alter = () => {
      const [show, setShow] = useState(false);

      update = () => {
        console.log(show);
        setShow(!show);
      };

      return c("div", {}, [
        show ? c("span", {}, "Show") : null,
        c("div", {}, "This is always here"),
      ]);
    };

    const tree = c("div", {}, [c(Alter, {}, [])]);

    render(tree, root);

    expect(rootNode!.descendants[0].descendants[0].descendants[0].type).toBe(
      null
    );

    update();

    expect(rootNode!.descendants[0].descendants[0].descendants[0].type).toBe(
      "span"
    );

    // TODO: chyba state nie wraca?

    update();

    expect(rootNode!.descendants[0].descendants[0].descendants[0].type).toBe(
      null
    );
  });
});

describe("DOM", () => {
  it("works", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const tree = c("div", { id: "root" }, [
      c("a", { href: "https://google.com" }, "Google"),
    ]);

    render(tree, root);

    expect(document.body.innerHTML).toBe(
      '<div><a href="https://google.com" children="Google">Google</a></div>'
    );
  });
});
