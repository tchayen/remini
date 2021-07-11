import { createElement as c, render } from "./lib";

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
  it("works", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const tree = c("a", { href: "https://google.com" }, ["Google"]);

    render(tree, root);

    expect(document.body.innerHTML).toBe(
      '<div><a href="https://google.com" children="Google">Google</a></div>'
    );
  });
});
