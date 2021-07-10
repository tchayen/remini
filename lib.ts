export type RenderFunction = (props: any) => RElement;

export type RElement =
  | {
      type: RenderFunction | string;
      props: {
        children: RElement[];
        [key: string]: any;
      };
    }
  | string;

export type RNode = {
  parent: RNode;
  children: RNode[];
  state: any;
  render: RenderFunction;
};

// Creates element, which is definition of React subtree. Doesn't resolve
// components into their subtrees.
export const createElement = (
  component: RenderFunction | string,
  props: any,
  children: RElement[]
): RElement => {
  return {
    type: component,
    props: { ...props, children },
  };
};

const _render = (element: RElement): Node => {
  if (typeof element === "string") {
    return document.createTextNode(element);
  } else if (typeof element.type === "string") {
    const html = document.createElement(element.type);
    const { children, onClick, ...attributes } = element.props;

    html.addEventListener("click", onClick);

    // Apply attributes.
    Object.entries(attributes).forEach(([key, value]) => {
      html.setAttribute(key, value);
    });

    // Add children.
    children.forEach((child) => {
      html.appendChild(_render(child));
    });

    return html;
  } else {
    return _render(element.type(element.props));
  }
};

export const useState = <T>(initial: T): [T, (value: T) => void] => {
  const state = [];

  state[0] = initial;
  state[1] = (next: T) => {
    state[0] = next;
    console.log(state);
  };

  // @ts-ignore
  return state;
};

// Replaces <body /> with rendered tree.
export const render = (tree: RElement) => {
  const result = _render(tree);
  document.body.innerHTML = "";
  document.body.appendChild(result);
};
