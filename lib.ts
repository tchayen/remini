import { findClosestDom, insertDom, removeDom, updateDom } from "./dom";

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
      parent: RNode | null;
      descendants: RNode[];
      dom?: Node;
      hooks?: any[];
      name?: string;
    }
  | {
      type: null;
      parent: RNode | null;
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
      if (typeof current.type === "string") {
        updateDom(current, expected);
      }

      current.props = expected.props;
      update(current, expected);
    } else if (current && expected && current.type !== expected.type) {
      // REPLACE
      let newNode: RNode = {
        props: expected.props,
        type: expected.type,
        name: getName(expected.type),
        parent: node,
        descendants: [],
      };

      if (typeof expected.type === "string") {
        if (current.type !== null && current.dom) {
          removeDom(current.dom);
        }
        insertDom(findClosestDom(node), newNode, expected);
      }

      if (typeof expected.type === "function") {
        newNode.hooks = [];
      }

      node.descendants[node.descendants.indexOf(current)] = newNode;
      update(newNode, expected);
    } else if (!current) {
      // ADD
      let newNode: RNode;
      if (expected === null) {
        newNode = {
          type: null,
          parent: node,
          descendants: [],
        };
      } else {
        newNode = {
          props: expected.props,
          type: expected.type,
          name: getName(expected.type),
          parent: node,
          descendants: [],
        };

        if (typeof expected.type === "string") {
          insertDom(findClosestDom(node), newNode, expected);
        }

        if (typeof expected.type === "function") {
          newNode.hooks = [];
        }
      }

      node.descendants.push(newNode);
      update(newNode, expected);
    } else if (!expected) {
      // REMOVE
      const indexOfCurrent = node.descendants.indexOf(current);

      if (current.type === null) {
        return;
      }

      if (current.dom) {
        removeDom(current.dom);
      }

      if (expected === null) {
        const newNode: RNode = {
          type: null,
          parent: node,
          descendants: [],
        };

        node.descendants[indexOfCurrent] = newNode;
      } else {
        node.descendants.splice(indexOfCurrent, 1);
      }
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

export let rootNode: RNode | null = null;

export const render = (element: RElement, container: HTMLElement) => {
  rootNode = {
    props: {
      children: [element],
    },
    type: container.tagName.toLowerCase(),
    dom: container,
    parent: null,
    descendants: [],
  };

  update(rootNode, element);
};
