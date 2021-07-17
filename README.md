# remini

Mini React implementation.

## Bugs
- Top level node doesn't receive props if it's a tag
- Top level component can't be component

## TODO
- nicer API more like [`hyperscript`](https://github.com/hyperhype/hyperscript)
- user inputs (seems to be working?)
- `style` object
- `ref`s
- context
- fragments
- `useMemo`?

```ts
export function createElement(
  component: RenderFunction | string,
  props: any,
  ...children: RElement[]
): RElement;

export function createElement(
  component: RenderFunction | string,
  props: any,
  children: string
): RElement;

export function createElement(
  component: RenderFunction | string,
  props: any,
  children: any
): RElement {
  return {
    type: component,
    props: { ...props, children },
  };
}
```

https://pomb.us/build-your-own-react/

https://indepth.dev/posts/1007/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-to-walk-the-components-tree

https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react

https://indepth.dev/posts/1009/in-depth-explanation-of-state-and-props-update-in-react

https://overreacted.io/react-as-a-ui-runtime/

https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7

https://overreacted.io/how-does-setstate-know-what-to-do/

http://danlec.com/blog/xss-via-a-spoofed-react-element

https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/#component-metadata-and-fibers

