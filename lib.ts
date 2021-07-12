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
  hooks?: any[];
  name?: string;
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

let currentNode: RNode = null;
let hookIndex = 0;

// Update tree.
const update = (node: RNode, element: RElement) => {
  // TODO TODO TODO
  // Find a way to remove `element` from args.

  if (typeof element === "string") {
    // TODO
    // This is when element is a string.
    return;
  }

  let elements: RElement[];
  if (typeof node.type === "function") {
    currentNode = node;
    hookIndex = 0;
    // This will be always one element array because this implementation doesn't
    // support returning arrays from render functions.
    elements = [node.type(node.props)];
    hookIndex = 0;
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
      a.props = b.props;
      update(a, b);
    } else if (!a) {
      // Add
      // console.log("> add");
      const newNode: RNode = {
        props: b.props,
        type: b.type,
        name: getName(b.type),
        descendants: [],
      };

      if (typeof b.type === "function") {
        newNode.hooks = [];
      }

      node.descendants.push(newNode);

      update(newNode, b);
    } else if (!b) {
      // Remove
      console.log("> remove");
    }
  });
};

export const useState = <T>(initial: T): [T, (next: T) => void] => {
  console.log("useState");

  if (currentNode.hooks[hookIndex] === undefined) {
    currentNode.hooks[hookIndex] = initial;
  }

  const value = currentNode.hooks[hookIndex];

  const setState = (next: T) => {
    currentNode.hooks[hookIndex] = next;
    update(currentNode, null);
  };

  hookIndex += 1;

  return [value, setState];
};

// Commit.
const sync = (node: RNode) => {
  // Check if node needs to be added, replaced etc.
};

export let rootNode: RNode = null;

export const render = (element: RElement, container: HTMLElement) => {
  rootNode = {
    props: {
      children: [element],
    },
    type: container.tagName.toLowerCase(),
    // dom: container,
    descendants: [],
  };

  // 1. Update tree.
  update(rootNode, element);

  // 2. Propagate changes to DOM.
  sync(rootNode);

  // console.log(JSON.stringify(rootNode, null, 2));
};
