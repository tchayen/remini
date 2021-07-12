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
  | string
  | null;

export type RNode =
  | {
      type: RenderFunction | string;
      props: Props;
      descendants: RNode[];
      // dom: Node;
      hooks?: any[];
      name?: string;
    }
  | {
      type: null;
      descendants: RNode[];
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

let currentNode: RNode | null = null;
let hookIndex = 0;

const update = (node: RNode, element: RElement) => {
  if (typeof element === "string") {
    // TODO
    // This is when element is a string.
    return;
  }

  let elements: RElement[] = [];
  if (typeof node.type === "function" && node.type !== null) {
    currentNode = node;
    hookIndex = 0;
    // This will be always one element array because this implementation doesn't
    // support returning arrays from render functions.
    elements = [node.type(node.props)];
    hookIndex = 0;
  } else if (element === null) {
    // Empty node?
    console.log("Element is null");
  } else if (typeof element.type === "string") {
    const { children } = element.props;
    if (typeof children !== "string") {
      elements = children;
    } else {
      // TODO
      // This is when children array is a single string.
      return;
    }
  } else {
    throw new Error("What is this?");
  }

  // Reconcile.
  const length = Math.max(node.descendants.length, elements.length);
  const pairs: [left: RNode, right: RElement][] = [];
  for (let i = 0; i < length; i++) {
    pairs.push([node.descendants[i], elements[i]]);
  }

  pairs.forEach(([current, expected]) => {
    if (typeof expected === "string") {
      // TODO ??
      return;
    }

    if (current && expected && current.type === expected.type) {
      // UPDATE
      // console.log("> update");
      current.props = expected.props;
      update(current, expected);
    } else if (current && expected && current.type !== expected.type) {
      // REPLACE
      // console.log("> replace");

      let newNode: RNode = {
        props: expected.props,
        type: expected.type,
        name: getName(expected.type),
        descendants: [],
      };

      if (typeof expected.type === "function") {
        newNode.hooks = [];
      }

      node.descendants[node.descendants.indexOf(current)] = newNode;
      update(newNode, expected);
    } else if (!current) {
      // ADD
      // console.log("> add");

      let newNode: RNode;
      if (expected === null) {
        newNode = {
          type: null,
          descendants: [],
        };
      } else {
        newNode = {
          props: expected.props,
          type: expected.type,
          name: getName(expected.type),
          descendants: [],
        };

        if (typeof expected.type === "function") {
          newNode.hooks = [];
        }
      }

      node.descendants.push(newNode);
      update(newNode, expected);
    } else if (!expected) {
      // console.log("> remove");
      // REMOVE
      // TODO test
      node.descendants.splice(node.descendants.indexOf(current), 1);
    }
  });
};

export const useState = <T>(initial: T): [T, (next: T) => void] => {
  if (!currentNode || currentNode.type === null || !currentNode.hooks) {
    throw new Error("Executing useState for non-function element.");
  }

  if (currentNode.hooks[hookIndex] === undefined) {
    currentNode.hooks[hookIndex] = initial;
  }

  const value = currentNode.hooks[hookIndex];

  const setState = (next: T) => {
    if (!currentNode || currentNode.type === null || !currentNode.hooks) {
      throw new Error("Executing useState for non-function element.");
    }

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

export let rootNode: RNode | null = null;

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
