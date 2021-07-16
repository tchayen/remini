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

export type RNodeReal = {
  type: RenderFunction | string;
  props: Props;
  parent: RNode | null;
  descendants: RNode[];
  dom?: Node;
  hooks?: any[];
  name?: string;
};

export type RNode =
  | RNodeReal
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

let _currentNode: RNode | null = null;
let _hookIndex = 0;

const update = (node: RNode, element: RElement) => {
  let previousNode = _currentNode;
  let previousIndex = _hookIndex;

  if (typeof element === "string") {
    // TODO
    // This is when element is a string.
    return;
  }

  let elements: RElement[] = [];
  if (typeof node.type === "function" && node.type !== null) {
    _currentNode = node;
    _hookIndex = 0;
    // This will be always one element array because this implementation doesn't
    // support returning arrays from render functions.
    elements = [node.type(node.props)];
    _hookIndex = 0;
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
      // console.log("UPDATE");
      if (typeof current.type === "string") {
        updateDom(current, expected);
      }

      current.props = expected.props;
      update(current, expected);
    } else if (current && expected && current.type !== expected.type) {
      // REPLACE
      // console.log("REPLACE");
      let newNode: RNode = {
        props: expected.props,
        type: expected.type,
        name: getName(expected.type),
        parent: node,
        descendants: [],
      };

      if (typeof expected.type === "string") {
        if (current.type !== null && current.dom) {
          removeDom(current);
        }

        const firstParentWithDom = findClosestDom(node);
        if (!firstParentWithDom.dom) {
          throw new Error("Missing DOM");
        }

        insertDom(firstParentWithDom.dom, newNode, expected);
      }

      if (typeof expected.type === "function") {
        newNode.hooks = [];
      }

      node.descendants[node.descendants.indexOf(current)] = newNode;
      update(newNode, expected);
    } else if (!current) {
      // ADD
      // console.log("ADD");
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

        // TODO: find out why top level node doesn't get props if it is a tag

        if (typeof expected.type === "string") {
          const firstParentWithDom = findClosestDom(node);
          if (!firstParentWithDom.dom) {
            throw new Error("Missing DOM");
          }

          insertDom(firstParentWithDom.dom, newNode, expected);
        }

        if (typeof expected.type === "function") {
          newNode.hooks = [];
        }
      }

      node.descendants.push(newNode);
      update(newNode, expected);
    } else if (!expected) {
      // REMOVE
      // console.log("REMOVE");
      const indexOfCurrent = node.descendants.indexOf(current);

      if (current.type === null) {
        return;
      }

      if (typeof current.type === "function" && current.hooks) {
        current.hooks.forEach((hook) => {
          if (hook.cleanup) {
            hook.cleanup();
          }
        });

        const child = current.descendants[0];

        if (child && child.type !== null && child.dom) {
          removeDom(findClosestDom(child));
        }

        console.log(current.descendants);
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

  _currentNode = previousNode;
  _hookIndex = previousIndex;
};

export const useEffect = (
  callback: () => void | (() => void),
  dependencies?: any[]
) => {
  // Capture the current node.
  let c = _currentNode;
  let i = _hookIndex;

  // This is needed to escape the render loop. Otherwise useEffects would be
  // called in correct order, but reflected in DOM in reversed one.
  setTimeout(() => {
    if (!c || c.type === null || !c.hooks) {
      throw new Error("Executing useState for non-function element.");
    }

    if (c.hooks[i] === undefined) {
      // INITIALIZE
      c.hooks[i] = { dependencies };
      const cleanup = callback();
      c.hooks[i].cleanup = cleanup;
    } else if (dependencies) {
      // COMPARE DEPENDENCIES
      let shouldRun = false;
      for (let j = 0; j < dependencies.length; j++) {
        if (dependencies[j] !== c.hooks[i].dependencies[j]) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        const cleanup = callback();
        c.hooks[i].cleanup = { cleanup, dependencies };
      }
    } else if (!dependencies) {
      // RUN ALWAYS
      const cleanup = callback();
      c.hooks[i] = { cleanup, dependencies };
    }

    _hookIndex += 1;
  }, 0);
};

export const useState = <T>(initial: T): [T, (next: T) => void] => {
  // Capture the current node.
  let c = _currentNode;
  let i = _hookIndex;

  if (!c || c.type === null || !c.hooks) {
    throw new Error("Executing useState for non-function element.");
  }

  if (c.hooks[i] === undefined) {
    c.hooks[i] = { state: initial };
  }

  const hook = c.hooks[i];

  const setState = (next: T) => {
    setTimeout(() => {
      if (!c || c.type === null || !c.hooks) {
        throw new Error("Executing useState for non-function element.");
      }

      hook.state = next;

      update(c, null);
    }, 0);
  };

  _hookIndex += 1;

  return [hook.state, setState];
};

export let _rootNode: RNode | null = null;

export const render = (element: RElement, container: HTMLElement) => {
  _rootNode = {
    props: {
      children: [element],
    },
    type: container.tagName.toLowerCase(),
    dom: container,
    parent: null,
    descendants: [],
  };

  update(_rootNode, element);
};
