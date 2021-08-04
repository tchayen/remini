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
- [x] Updater version of `setState`
- [x] `ref`s
- [x] Context API
- [x] `<Fragment />`
- [x] SSR
- [ ] Fast refresh

## Useful reading

- [Blogged Answers: A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)
- [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)
- [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect)
- [How Does setState Know What to Do?](https://overreacted.io/how-does-setstate-know-what-to-do/)
- [The how and why on React’s usage of linked list in Fiber to walk the component’s tree](https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree)
- [Inside Fiber: in-depth overview of the new reconciliation algorithm in React](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)
- [In-depth explanation of state and props update in React](https://indepth.dev/posts/1009/in-depth-explanation-of-state-and-props-update-in-react)
- [Build your own React](https://pomb.us/build-your-own-react/)
- [XSS via a spoofed React element](http://danlec.com/blog/xss-via-a-spoofed-react-element)
- [What are the downsides of preact?](https://github.com/preactjs/preact/issues/2199)
### HMR

- [Dan Abramov's comment describing how to implement HMR](https://github.com/facebook/react/issues/16604#issuecomment-528663101)
- [My Wishlist for Hot Reloading](https://overreacted.io/my-wishlist-for-hot-reloading/)
- [React Native docs about Fast Refresh](https://reactnative.dev/docs/fast-refresh)
- [handleHotUpdate in Vite](https://vitejs.dev/guide/api-plugin.html#handlehotupdate)
- [HMR API docs in Vite](https://vitejs.dev/guide/api-hmr.html)
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)

#### Actual implementations

- [Preact's refresh plugin](https://github.com/preactjs/prefresh)
- [React Refresh package](https://github.com/facebook/react/blob/main/packages/react-refresh)
- [Vite plugin-react-refresh](https://github.com/vitejs/vite/blob/main/packages/plugin-react-refresh)
- [Description how tagging with signatures work](https://github.com/facebook/react/issues/20417#issuecomment-807823533)

### Later

- Read more about [Reconcilliation](https://reactjs.org/docs/reconciliation.html)
- Implement support for [Code-splitting](https://reactjs.org/docs/code-splitting.html)
- [Forwarding refs](https://reactjs.org/docs/forwarding-refs.html)
- [Portals](https://reactjs.org/docs/jsx-in-depth.html)
- [Server components](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md)
