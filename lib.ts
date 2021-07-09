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

let rootTree: RElement = null;

let currentNode: RNode = null;

const _render = (element: RElement): Node => {
  if (typeof element === "string") {
    return document.createTextNode(element);
  } else if (typeof element.type === "string") {
    const html = document.createElement(element.type);
    const { children, ...attributes } = element.props;

    Object.entries(attributes).forEach(([key, value]) => {
      html.setAttribute(key, value);
    });

    children.forEach((child) => {
      html.appendChild(_render(child));
    });
    return html;
  } else {
    return _render(element.type(element.props));
  }
};

export const useState = <T>(value: T): [T, (value: T) => void] => {
  return [
    value,
    (value: T) => {
      currentNode.state = value;
      // _render(currentNode)
    },
  ];
};

// Replaces <body> with rendered tree.
export const render = (tree: RElement) => {
  rootTree = tree;

  const result = _render(rootTree);
  document.body.innerHTML = "";
  document.body.appendChild(result);
};
