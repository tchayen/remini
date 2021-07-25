import {
  findClosestComponent,
  findClosestDom,
  createDom,
  updateDom,
  removeDom,
} from "./dom";

type Children = RElement[] | string | null;

type ElementProps = {
  children: RElement[];
  [key: string]: any;
};

type Props = {
  [key: string]: any;
  style?: Record<string, unknown> | string;
};

export type RenderFunction = (props: Props) => RElement;

export enum SPECIAL_TYPES {
  PROVIDER = 1,
}

export type ComponentType = RenderFunction | SPECIAL_TYPES | string;

export enum NodeType {
  COMPONENT = 1,
  HOST = 2,
  TEXT = 3,
  PROVIDER = 4,
  NULL = 5,
}

export type ComponentElement = {
  kind: NodeType.COMPONENT;
  render: RenderFunction;
  props: ElementProps;
};

export type ComponentNode = ComponentElement & {
  parent: RNode | null;
  descendants: RNode[];
  hooks: Hook[];
};

export type HostElement = {
  kind: NodeType.HOST;
  tag: string;
  props: ElementProps;
};

export type HostNode = HostElement & {
  parent: RNode | null;
  descendants: RNode[];
  dom: Node;
};

export type TextElement = {
  kind: NodeType.TEXT;
  content: string;
};

export type TextNode = TextElement & {
  parent: RNode | null;
  dom: Node;
};

export type ProviderElement = {
  kind: NodeType.PROVIDER;
  props: ElementProps;
};

export type ProviderNode = ProviderElement & {
  parent: RNode | null;
  context: Context<any>;
  descendants: RNode[];
};

export type RElement =
  | ComponentElement
  | HostElement
  | TextElement
  | ProviderElement;

export type RNode = ComponentNode | HostNode | TextNode | ProviderNode;

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
  const p = {
    ...(props || {}),
    children: children
      .flat()
      .map((child: RElement | string | null) => {
        if (typeof child === "string") {
          return {
            kind: NodeType.TEXT,
            content: child,
          };
        } else {
          return child;
        }
      })
      .filter(Boolean),
  };

  if (typeof component === "function") {
    return {
      kind: NodeType.COMPONENT,
      render: component,
      props: p,
    };
  } else if (typeof component === "string") {
    return {
      kind: NodeType.HOST,
      tag: component,
      props: p,
    };
  } else if (component === SPECIAL_TYPES.PROVIDER) {
    return {
      kind: NodeType.PROVIDER,
      props: p,
    };
  }

  throw new Error("Something went wrong.");
}

let _currentNode: RNode | null = null;
let _hookIndex = 0;

const contextValues: Map<Context<any>, any> = new Map();

const update = (node: RNode, element: RElement | null) => {
  const previousNode = _currentNode;
  const previousIndex = _hookIndex;

  let replacedContext = null;

  if (
    (element && element.kind === NodeType.TEXT) ||
    node.kind === NodeType.TEXT
  ) {
    return;
  }

  let elements: RElement[] = [];
  if (node.kind === NodeType.COMPONENT) {
    _currentNode = node;
    _hookIndex = 0;
    // This will be always one element array because this implementation doesn't
    // support returning arrays from render functions.
    elements = [node.render(node.props)];
    _hookIndex = 0;
  } else if (
    element &&
    "props" in element &&
    (node.kind === NodeType.HOST || node.kind === NodeType.PROVIDER)
  ) {
    if (node.kind === NodeType.PROVIDER) {
      const currentValue = contextValues.get(node.context);

      if (currentValue) {
        replacedContext = { context: node.context, value: currentValue };
      }

      contextValues.set(node.context, { value: node.props.value });
    }

    elements = element.props.children;
  }

  // Reconcile.
  const length = Math.max(node.descendants.length, elements.length);
  const pairs: [left: RNode | undefined, right: RElement | undefined][] = [];
  for (let i = 0; i < length; i++) {
    pairs.push([node.descendants[i], elements[i]]);
  }

  pairs.forEach(([current, expected]) => {
    if (
      current &&
      expected &&
      ((current.kind === NodeType.COMPONENT &&
        expected.kind === NodeType.COMPONENT &&
        current.render === expected.render) ||
        (current.kind === NodeType.HOST &&
          expected.kind === NodeType.HOST &&
          current.tag === expected.tag) ||
        (current.kind === NodeType.PROVIDER &&
          expected.kind === NodeType.PROVIDER) ||
        (current.kind === NodeType.TEXT && expected.kind === NodeType.TEXT))
    ) {
      // UPDATE
      if (current.kind === NodeType.HOST && expected.kind === NodeType.HOST) {
        updateDom(current, expected);
      } else if (
        // Text value changed.
        current.kind === NodeType.TEXT &&
        expected.kind === NodeType.TEXT &&
        current.content !== expected.content
      ) {
        current.dom.nodeValue = expected.content;
      }

      // Props can be updated.
      if ("props" in current && "props" in expected) {
        current.props = expected.props;
      }

      update(current, expected);
    } else if (current && expected) {
      // REPLACE
      let newNode: RNode;
      if (expected.kind === NodeType.COMPONENT) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
          hooks: [],
        };

        removeDom(current);
      } else if (expected.kind === NodeType.HOST) {
        const firstParentWithDom = findClosestDom(node);

        const nodeConstruction: any = {
          ...expected,
          parent: node,
          descendants: [],
        };

        const newDom = createDom(expected);
        if (current.kind === NodeType.HOST || current.kind === NodeType.TEXT) {
          firstParentWithDom.dom.replaceChild(newDom, current.dom);
        } else {
          removeDom(current);
          firstParentWithDom.dom.appendChild(newDom);
        }
        nodeConstruction.dom = newDom;

        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.TEXT) {
        const firstParentWithDom = findClosestDom(node);
        const nodeConstruction: any = {
          ...expected,
          parent: node,
        };

        const dom = document.createTextNode(expected.content);
        if (current.kind === NodeType.TEXT) {
          nodeConstruction.dom = current.dom;
          nodeConstruction.dom.nodeValue = expected.content;
        } else if (current.kind === NodeType.HOST) {
          firstParentWithDom.dom.replaceChild(dom, current.dom);
          nodeConstruction.dom = dom;
        } else {
          removeDom(current);
          firstParentWithDom.dom.appendChild(dom);
          nodeConstruction.dom = dom;
        }

        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.PROVIDER) {
        newNode = {
          ...expected,
          context: expected.props.context,
          parent: node,
          descendants: [],
        };

        removeDom(current);
      } else {
        throw new Error("Couldn't resolve node kind.");
      }

      if (current.kind === NodeType.COMPONENT) {
        current.hooks.forEach((hook) => {
          if (hook.type === HookType.EFFECT && hook.cleanup) {
            hook.cleanup();
          }
        });
      }

      node.descendants[node.descendants.indexOf(current)] = newNode;
      update(newNode, expected);
    } else if (!current && expected !== undefined) {
      // ADD
      let newNode: RNode;
      if (expected.kind === NodeType.COMPONENT) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
          hooks: [],
        };
      } else if (expected.kind === NodeType.HOST) {
        const nodeConstruction: any = {
          ...expected,
          parent: node,
          descendants: [],
        };
        const firstParentWithDom = findClosestDom(node);
        nodeConstruction.dom = createDom(expected);
        firstParentWithDom.dom.appendChild(nodeConstruction.dom);
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
      } else if (expected.kind === NodeType.TEXT) {
        const nodeConstruction: any = {
          ...expected,
          parent: node,
        };

        const firstParentWithDom = findClosestDom(node);
        const dom = document.createTextNode(expected.content);
        firstParentWithDom.dom.appendChild(dom);
        nodeConstruction.dom = dom;
        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.PROVIDER) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
          context: expected.props.context,
        };
      } else {
        throw new Error("Couldn't resolve node kind.");
      }

      node.descendants.push(newNode);
      update(newNode, expected);
    } else if (current !== undefined && !expected) {
      // REMOVE
      const indexOfCurrent = node.descendants.indexOf(current);

      if (current.kind === NodeType.COMPONENT) {
        current.hooks.forEach((hook) => {
          if (hook.type === HookType.EFFECT && hook.cleanup) {
            hook.cleanup();
          }
        });
      }

      removeDom(current);
      node.descendants.splice(indexOfCurrent, 1);
    }
  });

  if (node.kind === NodeType.PROVIDER && replacedContext !== null) {
    contextValues.set(replacedContext.context, {
      value: replacedContext.value,
    });
  }

  _currentNode = previousNode;
  _hookIndex = previousIndex;
};

type Job = { node: RNode; element: RElement | null };
let updating = false;
const tasks: Job[] = [];
const effects: (() => void)[] = [];

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
): void => {
  // Capture the current node.
  const c = _currentNode;
  const i = _hookIndex;

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
  const c = _currentNode;
  const i = _hookIndex;

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

  const hook = _currentNode.hooks[_hookIndex];
  if (hook.type !== HookType.MEMO) {
    throw new Error("Something went wrong.");
  }

  _hookIndex += 1;
  return hook.memo;
};

type ProviderProps<T> = { value: T; children: Children };

type Context<T> = {
  Provider: ({ value, children }: ProviderProps<T>) => RElement;
};

export const createContext = <T>(): Context<T> => {
  const context: any = {};

  const Provider = <T>({ children, value }: ProviderProps<T>): RElement => {
    return createElement(SPECIAL_TYPES.PROVIDER, { value, context }, children);
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

export let _rootNode: HostNode | null = null;

export const render = (element: RElement, container: HTMLElement): void => {
  _rootNode = {
    kind: NodeType.HOST,
    props: {
      children: [element],
    },
    tag: container.tagName.toLowerCase(),
    dom: container,
    parent: null,
    descendants: [],
  };

  runUpdateLoop(_rootNode, createElement("div", {}, element));
};
