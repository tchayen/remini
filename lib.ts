export type RenderFunction = (props: any) => RElement;

type Props = {
  children: RElement[] | string;
  [key: string]: any;
};

export type RElement =
  | {
      type: RenderFunction | string;
      props: Props;
    }
  | string;

export type RNode = {
  type: RenderFunction | string;
  props: Props;
  descendants: RNode[];
  // dom: Node;
  name?: string;

  // // Tree structure.
  // parent: RNode;
  // descendants: RNode[];
  // // HTML DOM element.
  // dom: Node;
  // // Props and state.
  // props: Props;
  // state: any;
  // // Component | HTML tag | text node content.
  // type: RenderFunction | string;
  // // Previous node in this place in tree.
  // oldNode: RNode;
};

export const createElement = (
  component: RenderFunction | string,
  props: any,
  children: RElement[] | string
): RElement => {
  return {
    type: component,
    props: { ...props, children },
  };
};

const isProp = (key: string) => key !== "chidren" && !key.startsWith("on");

// const createDom = (node: RNode) => {
//   // // TODO: update same elements etc
//   let dom;
//   if (node.type === "text") {
//     dom = document.createTextNode(node.props.children);
//   } else if (typeof node.type === "string") {
//     dom = document.createElement(node.type);

//     Object.entries(node.props)
//       .filter(([key]) => isProp(key))
//       .forEach(([key, value]) => {
//         dom.setAttribute(key, value as string);
//       });
//   }
//   return dom;
// };

const getName = (type: RenderFunction | string) => {
  if (typeof type === "string") {
    return type;
  } else {
    return type.name;
  }
};

// Update tree.
const update = (node: RNode, element: RElement) => {
  if (typeof element === "string") {
    // TODO
    // This is when element is a string.
    return;
  }

  let elements: RElement[];
  if (typeof element.type === "function") {
    // This will be always one element array because this implementation doesn't
    // support returning arrays from render functions.
    elements = [element.type(element.props)];
  } else if (typeof element.type === "string") {
    const { children } = element.props;
    if (typeof children !== "string") {
      elements = children;
    } else {
      // TODO
      // This is when children array is a single string.
      return;
    }
  }

  // Reconcile.
  const length = Math.max(node.descendants.length, elements.length);
  const pairs: [left: RNode, right: RElement][] = [];
  for (let i = 0; i < length; i++) {
    pairs.push([node.descendants[i], elements[i]]);
  }

  pairs.forEach(([a, b]) => {
    if (typeof b === "string") {
      // TODO ??
      return;
    }

    if (a && b && a.type === b.type) {
      // Update
      console.log("> update");
      update(a, b);
    } else if (!a) {
      // Add
      console.log("> add");
      const newNode: RNode = {
        props: b.props,
        type: b.type,
        name: getName(b.type),
        descendants: [],
      };

      node.descendants.push(newNode);

      update(newNode, b);
    } else if (!b) {
      // Remove
      console.log("> remove");
    }
  });
};

// Commit.
const sync = (node: RNode) => {
  // Check if node needs to be added, replaced etc.
};

export let rootNode: RNode = null;

export const render = (element: RElement, container: HTMLElement) => {
  rootNode = {
    props: null,
    type: container.tagName.toLowerCase(),
    // dom: container,
    descendants: [],
  };

  // 1. Update tree.
  update(rootNode, element);

  // 2. Propagate changes to DOM.
  sync(rootNode);

  console.log(JSON.stringify(rootNode, null, 2));
};
