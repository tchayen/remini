import { createElement, useState, render, RElement } from "./lib";

beforeEach(() => {
  document.body.innerHTML = "";
});

// <button class="button">
//   <b>
//     Hello World!
//   </b>
// </button>
it("renders plain HTML", () => {
  const tree = createElement("button", { class: "button" }, [
    createElement("b", {}, ["Hello World!"]),
  ]);

  const expected = {
    type: "button",
    props: {
      class: "button",
      children: [
        {
          type: "b",
          props: {
            children: ["Hello World!"],
          },
        },
      ],
    },
  };

  expect(tree).toStrictEqual(expected);
});

// ContactForm = (
//   <div>Contact us at contact@example.org</div>
// )

// Messages = (
//   <div>
//     <span>Loading...</span>
//     <ContactForm />
//   </div>
// )

// <div>
//   <span>Moi</span>
//   <Messages prefetch={false} />
// </div>
it("works for component tree", () => {
  const ContactForm = () => {
    return createElement("div", {}, ["Contact us at contact@example.org"]);
  };

  const Messages = () => {
    return createElement("div", {}, [
      createElement("span", {}, ["Loading..."]),
      createElement(ContactForm, {}, []),
    ]);
  };

  const tree = createElement("div", {}, [
    createElement("span", {}, ["Moi"]),
    createElement(Messages, { prefetch: false }, []),
  ]);

  const expected: RElement = {
    type: "div",
    props: {
      children: [
        {
          type: "span",
          props: {
            children: ["Moi"],
          },
        },
        {
          type: Messages,
          props: {
            prefetch: false,
            children: [],
          },
        },
      ],
    },
  };

  expect(tree).toStrictEqual(expected);
});

it("renders HTML", () => {
  const ContactForm = () => {
    return createElement("div", {}, ["Contact us at contact@example.org"]);
  };

  const Messages = () => {
    return createElement("div", {}, [
      createElement("span", {}, ["Loading..."]),
      createElement(ContactForm, {}, []),
    ]);
  };

  const tree = createElement("div", {}, [
    createElement("span", {}, ["Moi"]),
    createElement(Messages, { prefetch: false }, []),
  ]);

  render(tree);

  expect(document.body.innerHTML).toBe(
    "<div><span>Moi</span><div><span>Loading...</span><div>Contact us at contact@example.org</div></div></div>"
  );
});

it("applies props", () => {
  //
});

it("works with state", () => {
  const Counter = () => {
    const [value, setValue] = useState(0);
    return createElement(
      "div",
      {
        onclick: () => {
          console.log("a");
          setValue(value + 1);
        },
        id: "counter",
      },
      [`${value}`]
    );
  };

  const tree = createElement("div", {}, [createElement(Counter, {}, [])]);

  render(tree);

  const button = document.getElementById("counter");
  expect(button).not.toBeNull();

  button.click();

  // console.log(document.body.innerHTML);
});
