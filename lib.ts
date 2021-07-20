import { findClosestDom, insertDom, removeDom, updateDom } from "./dom";

type ElementProps = {
  children: RElement[] | string;
  [key: string]: any;
};

type Props = {
  [key: string]: any;
  style?: object | string;
};

export type RenderFunction = (props: Props) => RElement;

export type RElement =
  | {
      type: RenderFunction | string;
      props: ElementProps;
    }
  | string
  | null;

export type RNodeReal = {
  type: RenderFunction | string;
  props: ElementProps;
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

export function createElement(
  component: RenderFunction | string,
  props: Props,
  children: RElement[]
): RElement;

export function createElement(
  component: RenderFunction | string,
  props?: Props,
  ...children: RElement[]
): RElement;

export function createElement(
  component: RenderFunction | string,
  props?: Props,
  children?: string
): RElement;

export function createElement(
  component: RenderFunction | string,
  props: Props,
  ...children: any
): RElement {
  let normalizedChildren;
  if (children.length === 1 && typeof children[0] === "string") {
    normalizedChildren = children[0];
  } else if (children.length === 0) {
    normalizedChildren = null;
  } else {
    normalizedChildren = children.flat();
  }

  return {
    type: component,
    props: { ...(props || {}), children: normalizedChildren },
  };
}

const getName = (type: RenderFunction | string) => {
  if (typeof type === "string") {
    return type;
  } else {
    return type.name;
  }
};

let _currentNode: RNode | null = null;
let _hookIndex = 0;
let _lookingForRef: { current: any } | null = null;

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
          removeDom(current);
        }

        const firstParentWithDom = findClosestDom(node);
        if (!firstParentWithDom.dom) {
          throw new Error("Missing DOM.");
        }

        insertDom(firstParentWithDom.dom, newNode, expected);
      }

      if (typeof expected.type === "function") {
        newNode.hooks = [];
      }

      if (
        typeof current.type === "function" &&
        current.type !== null &&
        current.hooks
      ) {
        current.hooks.forEach((hook) => {
          if (hook.cleanup) {
            hook.cleanup();
          }
        });

        const child = current.descendants[0];

        if (child && child.type !== null && child.dom) {
          removeDom(findClosestDom(child));
        }
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
          const firstParentWithDom = findClosestDom(node);
          if (!firstParentWithDom.dom) {
            throw new Error("Missing DOM.");
          }

          insertDom(firstParentWithDom.dom, newNode, expected);

          if (
            expected.props.ref === _lookingForRef &&
            _lookingForRef !== null
          ) {
            _lookingForRef.current = newNode.dom;
            _lookingForRef = null;
          }
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

      if (typeof current.type === "string" && current.dom) {
        removeDom(current);
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

type Job = { node: RNode; element: RElement };
let updating = false;
let tasks: Job[] = [];
let effects: (() => void)[] = [];

const runUpdateLoop = (node: RNode, element: RElement) => {
  tasks.push({ node, element });

  if (updating) {
    return;
  }

  updating = true;

  let current: Job | undefined;
  while ((current = tasks.shift())) {
    update(current.node, current.element);

    let effect: (() => void) | undefined;
    while ((effect = effects.shift())) {
      effect();
    }
  }

  updating = false;
};

export const useEffect = (
  callback: () => void | (() => void),
  dependencies?: any[]
) => {
  // Capture the current node.
  let c = _currentNode;
  let i = _hookIndex;

  effects.push(() => {
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
  });

  _hookIndex += 1;
};

export const useState = <T>(
  initial: T
): [T, (next: T | ((current: T) => T)) => void] => {
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

  const setState = (next: T | ((current: T) => T)) => {
    if (!c || c.type === null || !c.hooks) {
      throw new Error("Executing useState for non-function element.");
    }

    if (typeof next === "function") {
      // TODO: fix type.
      hook.state = next(hook.state);
    } else {
      hook.state = next;
    }

    runUpdateLoop(c, null);
  };

  _hookIndex += 1;

  return [hook.state, setState];
};

export const useRef = <T>(): { current: T | null } => {
  if (!_currentNode || _currentNode.type === null) {
    throw new Error("Can't use useRef on this node.");
  }

  const ref = { current: null };
  _lookingForRef = ref;

  return ref;
};

export const useMemo = <T>(callback: () => T, dependencies: any[]): T => {
  if (!_currentNode || _currentNode.type === null || !_currentNode.hooks) {
    throw new Error("Can't call useMemo on this node.");
  }

  if (_currentNode.hooks[_hookIndex] === undefined) {
    _currentNode.hooks[_hookIndex] = { memo: callback(), dependencies };
  } else {
    let shouldRun = false;
    for (let j = 0; j < dependencies.length; j++) {
      if (dependencies[j] !== _currentNode.hooks[_hookIndex].dependencies[j]) {
        shouldRun = true;
      }
    }

    if (shouldRun) {
      const memo = callback();
      _currentNode.hooks[_hookIndex] = { memo, dependencies };
    }
  }

  _hookIndex += 1;

  return _currentNode.hooks[_hookIndex - 1].memo;
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

  runUpdateLoop(_rootNode, createElement("div", {}, element));
};
