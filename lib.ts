import {
  findClosestComponent,
  findClosestDom,
  insertDom,
  removeDom,
  updateDom,
} from "./dom";

type Children = RElement | RElement[] | string | null;

type ElementProps = {
  children: Children;
  [key: string]: any;
};

type Props = {
  [key: string]: any;
  style?: object | string;
};

export type RenderFunction = (props: Props) => RElement;

export enum SPECIAL_TYPES {
  PROVIDER = 1,
}

export type ComponentType = RenderFunction | SPECIAL_TYPES | string;

export type RElement = {
  type: ComponentType;
  props: ElementProps;
};

enum HookType {
  STATE = 1,
  EFFECT = 2,
  REF = 3,
  CONTEXT = 4,
  MEMO = 5,
}

export type Hook =
  | {
      type: HookType.STATE;
      state: any;
    }
  | {
      type: HookType.EFFECT;
      cleanup: (() => void) | undefined;
      dependencies?: any[];
    }
  | {
      type: HookType.REF;
      current: any;
    }
  | {
      type: HookType.CONTEXT;
      context: any;
    }
  | {
      type: HookType.MEMO;
      memo: any;
      dependencies?: any[];
    };

export enum NodeType {
  COMPONENT = 1,
  HOST = 2,
  PROVIDER = 3,
  NULL = 4,
}

export type ComponentNode = {
  kind: NodeType.COMPONENT;
  type: RenderFunction;
  props: ElementProps;
  parent: RNode | null;
  descendants: RNode[];
  hooks: Hook[];
};

export type HostNode = {
  kind: NodeType.HOST;
  type: string;
  props: ElementProps;
  parent: RNode | null;
  descendants: RNode[];
  dom: Node;
};

export type ProviderNode = {
  kind: NodeType.PROVIDER;
  type: SPECIAL_TYPES.PROVIDER;
  props: ElementProps;
  parent: RNode | null;
  context: Context<any>;
  descendants: RNode[];
};

export type NullNode = {
  kind: NodeType.NULL;
  type: null;
  parent: RNode | null;
  descendants: RNode[];
};

export type RNode = ComponentNode | HostNode | ProviderNode | NullNode;

export function createElement(
  component: ComponentType,
  props: Props,
  children: Children
): RElement;

export function createElement(
  component: ComponentType,
  props?: Props,
  ...children: (RElement | string | null)[]
): RElement;

export function createElement(
  component: ComponentType,
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

let _currentNode: RNode | null = null;
let _hookIndex = 0;

const contextValues: Map<Context<any>, any> = new Map();

const update = (node: RNode, element: RElement | null) => {
  let previousNode = _currentNode;
  let previousIndex = _hookIndex;

  let replacedContext = null;

  if (typeof element === "string") {
    // TODO
    // This is when element is a string.
    return;
  }

  let elements: RElement[] = [];
  if (node.kind === NodeType.COMPONENT) {
    _currentNode = node;
    _hookIndex = 0;
    // This will be always one element array because this implementation doesn't
    // support returning arrays from render functions.
    elements = [node.type(node.props)];
    _hookIndex = 0;
  } else if (element === null) {
    // Empty node?
  } else if (node.kind === NodeType.HOST || node.kind === NodeType.PROVIDER) {
    if (node.kind === NodeType.PROVIDER) {
      const currentValue = contextValues.get(node.context);

      if (currentValue) {
        replacedContext = { context: node.context, value: currentValue };
      }

      contextValues.set(node.context, { value: node.props.value });
    }

    const { children } = element.props;
    if (children === null) {
    } else if (typeof children !== "string") {
      elements = Array.isArray(children) ? children : [children];
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
      let newNode: RNode;
      if (expected.type === SPECIAL_TYPES.PROVIDER) {
        newNode = {
          kind: NodeType.PROVIDER,
          context: expected.props.context,
          props: expected.props,
          type: expected.type,
          parent: node,
          descendants: [],
        };
      } else if (typeof expected.type === "string") {
        const firstParentWithDom = findClosestDom(node);
        if (!firstParentWithDom.dom) {
          throw new Error("Missing DOM.");
        }

        let nodeConstruction: any = {
          kind: NodeType.HOST,
          props: expected.props,
          type: expected.type,
          parent: node,
          descendants: [],
        };
        nodeConstruction.dom = insertDom(
          firstParentWithDom.dom,
          nodeConstruction,
          expected
        );

        newNode = nodeConstruction;
      } else if (typeof expected.type === "function") {
        newNode = {
          kind: NodeType.COMPONENT,
          props: expected.props,
          type: expected.type,
          parent: node,
          descendants: [],
          hooks: [],
        };
      } else {
        throw new Error("Couldn't resolve node kind.");
      }

      if (current.kind === NodeType.COMPONENT) {
        current.hooks.forEach((hook) => {
          if (hook.type === HookType.EFFECT && hook.cleanup) {
            hook.cleanup();
          }
        });

        for (const child of current.descendants) {
          if (child.kind === NodeType.HOST) {
            removeDom(findClosestDom(child));
          }
        }
      }

      node.descendants[node.descendants.indexOf(current)] = newNode;
      update(newNode, expected);
    } else if (!current) {
      // ADD
      let newNode: RNode;
      if (expected === null) {
        newNode = {
          kind: NodeType.NULL,
          type: null,
          parent: node,
          descendants: [],
        };
      } else if (expected.type === SPECIAL_TYPES.PROVIDER) {
        newNode = {
          kind: NodeType.PROVIDER,
          props: expected.props,
          type: expected.type,
          parent: node,
          descendants: [],
          context: expected.props.context,
        };
      } else if (typeof expected.type === "string") {
        let nodeConstruction: any = {
          kind: NodeType.HOST,
          props: expected.props,
          type: expected.type,
          parent: node,
          descendants: [],
        };
        const firstParentWithDom = findClosestDom(node);
        if (!firstParentWithDom.dom) {
          throw new Error("Missing DOM.");
        }

        nodeConstruction.dom = insertDom(
          firstParentWithDom.dom,
          nodeConstruction,
          expected
        );
        newNode = nodeConstruction;

        // Handle useRef.
        const closestComponent = findClosestComponent(node);
        if (closestComponent && closestComponent.kind === NodeType.COMPONENT) {
          for (const hook of closestComponent.hooks) {
            if (hook.type === HookType.REF && expected.props.ref === hook) {
              hook.current = (newNode as HostNode).dom;
            }
          }
        }
      } else if (typeof expected.type === "function") {
        newNode = {
          kind: NodeType.COMPONENT,
          props: expected.props,
          type: expected.type,
          parent: node,
          descendants: [],
          hooks: [],
        };
      } else {
        throw new Error("Couldn't resolve node kind.");
      }

      node.descendants.push(newNode);
      update(newNode, expected);
    } else if (!expected) {
      // REMOVE
      const indexOfCurrent = node.descendants.indexOf(current);

      if (current.type === null) {
        return;
      }

      if (current.kind === NodeType.HOST) {
        removeDom(current);
      }

      if (current.kind === NodeType.COMPONENT) {
        current.hooks.forEach((hook) => {
          if (hook.type === HookType.EFFECT && hook.cleanup) {
            hook.cleanup();
          }
        });

        const child = current.descendants[0];

        if (child && child.kind === NodeType.HOST) {
          removeDom(findClosestDom(child));
        }
      }

      if (expected === null) {
        const newNode: RNode = {
          kind: NodeType.NULL,
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

  if (node.type === SPECIAL_TYPES.PROVIDER && replacedContext !== null) {
    contextValues.set(replacedContext.context, {
      value: replacedContext.value,
    });
  }

  _currentNode = previousNode;
  _hookIndex = previousIndex;
};

type Job = { node: RNode; element: RElement | null };
let updating = false;
let tasks: Job[] = [];
let effects: (() => void)[] = [];

const runUpdateLoop = (node: RNode, element: RElement | null) => {
  tasks.push({ node, element });

  if (updating) {
    return;
  }

  updating = true;

  let current: Job | undefined;
  // Run all state updates.
  while ((current = tasks.shift())) {
    update(current.node, current.element);

    // Run all effects queued for this update.
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

  if (!c || c.kind !== NodeType.COMPONENT) {
    throw new Error("Executing useEffect for non-function element.");
  }

  effects.push(() => {
    if (!c || c.kind !== NodeType.COMPONENT) {
      throw new Error("Executing useEffect for non-function element.");
    }

    if (c.hooks[i] === undefined) {
      // INITIALIZE
      const hook: Hook = {
        type: HookType.EFFECT,
        cleanup: undefined,
        dependencies,
      };
      c.hooks[i] = hook;
      const cleanup = callback();
      hook.cleanup = cleanup ? cleanup : undefined;
    } else if (dependencies) {
      // COMPARE DEPENDENCIES
      const hook = c.hooks[i];
      if (hook.type !== HookType.EFFECT || hook.dependencies === undefined) {
        throw new Error("Something went wrong.");
      }

      let shouldRun = false;
      for (let j = 0; j < dependencies.length; j++) {
        if (dependencies[j] !== hook.dependencies[j]) {
          shouldRun = true;
        }
      }

      if (shouldRun) {
        const cleanup = callback();
        c.hooks[i] = {
          type: HookType.EFFECT,
          cleanup: cleanup ? cleanup : undefined,
          dependencies,
        };
      }
    } else if (!dependencies) {
      // RUN ALWAYS
      const cleanup = callback();
      c.hooks[i] = {
        type: HookType.EFFECT,
        cleanup: cleanup ? cleanup : undefined,
        dependencies,
      };
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

  if (!c || c.kind !== NodeType.COMPONENT) {
    throw new Error("Executing useState for non-function element.");
  }

  if (c.hooks[i] === undefined) {
    c.hooks[i] = { type: HookType.STATE, state: initial };
  }

  const hook = c.hooks[i];

  if (hook.type !== HookType.STATE) {
    throw new Error("Something went wrong.");
  }

  const setState = (next: T | ((current: T) => T)) => {
    if (!c || c.kind !== NodeType.COMPONENT) {
      throw new Error("Executing useState for non-function element.");
    }

    // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-856866935
    // In case of a different iframe, window or realm, next won't be instance
    // of the same Function and will be saved instead of treated as callback.
    if (next instanceof Function) {
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
  if (!_currentNode || _currentNode.kind !== NodeType.COMPONENT) {
    throw new Error("Can't use useRef on this node.");
  }

  const ref: Hook = { type: HookType.REF, current: null };

  if (ref.type !== HookType.REF) {
    throw new Error("Something went wrong.");
  }

  _currentNode.hooks[_hookIndex] = ref;
  _hookIndex += 1;

  return ref;
};

export const useMemo = <T>(callback: () => T, dependencies: any[]): T => {
  if (!_currentNode || _currentNode.kind !== NodeType.COMPONENT) {
    throw new Error("Can't call useMemo on this node.");
  }

  if (_currentNode.hooks[_hookIndex] === undefined) {
    _currentNode.hooks[_hookIndex] = {
      type: HookType.MEMO,
      memo: callback(),
      dependencies,
    };
  } else {
    const hook = _currentNode.hooks[_hookIndex];
    if (hook.type !== HookType.MEMO || !hook.dependencies) {
      throw new Error("Something went wrong.");
    }

    let shouldRun = false;
    for (let j = 0; j < dependencies.length; j++) {
      if (dependencies[j] !== hook.dependencies[j]) {
        shouldRun = true;
      }
    }

    if (shouldRun) {
      const memo = callback();
      _currentNode.hooks[_hookIndex] = {
        type: HookType.MEMO,
        memo,
        dependencies,
      };
    }
  }

  _hookIndex += 1;

  const hook = _currentNode.hooks[_hookIndex - 1];
  if (hook.type !== HookType.MEMO) {
    throw new Error("Something went wrong.");
  }

  return hook.memo;
};

type ProviderProps<T> = { value: T; children: Children };

type Context<T> = {
  Provider: ({ value, children }: ProviderProps<T>) => RElement;
};

export const createContext = <T>(): Context<T> => {
  // @ts-ignore
  const context: Context<T> = {};

  const Provider = <T>({ children, value }: ProviderProps<T>): RElement => {
    return {
      type: SPECIAL_TYPES.PROVIDER,
      props: { value, children, context },
    };
  };

  context.Provider = Provider;
  return context;
};

export const useContext = <T>(context: Context<T>): T => {
  // Return whatever value is. Undefined or null might be intentional and can
  // make a difference.

  if (!_currentNode || _currentNode.kind !== NodeType.COMPONENT) {
    throw new Error("Can't call useContext on this node.");
  }

  const newValue = contextValues.get(context);
  if (_currentNode.hooks[_hookIndex] === undefined || newValue) {
    _currentNode.hooks[_hookIndex] = {
      type: HookType.CONTEXT,
      context: newValue.value,
    };
  }

  const hook = _currentNode.hooks[_hookIndex];

  if (hook.type !== HookType.CONTEXT) {
    throw new Error("Something went wrong.");
  }

  _hookIndex += 1;
  return hook.context;
};

export let _rootNode: RNode | null = null;

export const render = (element: RElement, container: HTMLElement) => {
  _rootNode = {
    kind: NodeType.HOST,
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
