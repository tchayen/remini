# remini

Mini React implementation made for fun and practice. Please do not use in production.

## Example

```js
import { useState, createElement as c, render } from "./lib";

const Counter = () => {
  const [count, setCount] = useState(0);

  return c(
    "div",
    {},
    c("div", {}, `Value: ${count}`),
    c("button", { onClick: () => setCount(count + 1) })
  );
};

render(c(Counter), document.getElementById("root"));
```

## How to play with it?

`yarn start` to start the dev server at `localhost:1234`.

`yarn test` to see the tests passing.

## Might come later
- [x] Accepting `style` object as alternative to string prop
- [ ] Updater version of `setState`
- [ ] `ref`s
- [ ] Context API
- [ ] `<Fragment />`

## Useful reading

[Blogged Answers: A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)

[React as a UI Runtime
](https://overreacted.io/react-as-a-ui-runtime/)

[How Does setState Know What to Do?
](https://overreacted.io/how-does-setstate-know-what-to-do/)

[The how and why on React’s usage of linked list in Fiber to walk the component’s tree](https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree)

[Inside Fiber: in-depth overview of the new reconciliation algorithm in React](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)

[In-depth explanation of state and props update in React
](https://indepth.dev/posts/1009/in-depth-explanation-of-state-and-props-update-in-react)

[Build your own React](https://pomb.us/build-your-own-react/)

[XSS via a spoofed React element](http://danlec.com/blog/xss-via-a-spoofed-react-element)
