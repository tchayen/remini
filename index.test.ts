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
    const Title = ({ children }) => {
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
  // it("works", () => {
  //   const root = document.createElement("div");
  //   document.body.appendChild(root);

  //   const tree = c("a", { href: "https://google.com" }, ["Google"]);

  //   render(tree, root);

  //   expect(document.body.innerHTML).toBe(
  //     '<div><a href="https://google.com" children="Google">Google</a></div>'
  //   );
  // });

  it("works", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const Counter = ({ children }) => {
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

    const expected: RNode = {
      props: {
        children: [
          {
            type: "div",
            props: {
              children: [
                {
                  type: Counter,
                  props: {
                    children: "Counter: ",
                  },
                },
                {
                  type: "h1",
                  props: {
                    children: "Test",
                  },
                },
              ],
            },
          },
        ],
      },
      type: "div",
      descendants: [
        {
          type: Counter,
          props: {
            children: "Counter: ",
          },
          name: "Counter",
          descendants: [
            {
              props: {
                children: [
                  {
                    type: "span",
                    props: {
                      children: "Counter: ",
                    },
                  },
                  {
                    type: "span",
                    props: {
                      style: "color: #ff0000",
                      children: "0",
                    },
                  },
                ],
              },
              type: "div",
              name: "div",
              descendants: [
                {
                  props: {
                    children: "Counter: ",
                  },
                  type: "span",
                  name: "span",
                  descendants: [],
                },
                {
                  props: {
                    style: "color: #ff0000",
                    children: "0",
                  },
                  type: "span",
                  name: "span",
                  descendants: [],
                },
              ],
            },
          ],
          hooks: [],
        },
        {
          props: {
            children: "Test",
          },
          type: "h1",
          name: "h1",
          descendants: [],
        },
      ],
    };

    expect(rootNode).toStrictEqual(expected);
  });

  it("works with state", () => {
    const getPrintedNumber = () => {
      return rootNode.descendants[0].descendants[0].descendants[1].props
        .children;
    };

    let update;

    const root = document.createElement("div");
    document.body.appendChild(root);

    const Counter = ({ children }) => {
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
});
