import { Host as DomHost } from "./dom";
import { SSRNode, Host as SSRHost } from "./ssr";

type HostType<T, R> = {
  findClosestComponent: (node: RNode) => ComponentNode | null;
  findClosestHostNode: (node: RNode) => HostNode;
  createHostNode: (element: HostElement) => T;
  updateHostNode: (current: HostNode, expected: HostElement) => void;
  removeHostNode: (hostNode: RNode) => void;
  appendChild: (parent: T, child: T) => void;
  createTextNode: (text: string) => R;
  updateTextNode: (current: TextNode, text: string) => void;
};

type Children = RElement[] | string | null;

type ElementProps = {
  children: RElement[];
  [key: string]: any;
};

type Props = {
  [key: string]: any;
  style?: Record<string, unknown> | string;
};

export type RenderFunction = (props: any) => RElement;

export type ComponentType = RenderFunction | string;

export enum NodeType {
  COMPONENT = 1,
  HOST = 2,
  TEXT = 3,
  PROVIDER = 4,
  NULL = 5,
  FRAGMENT = 6,
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
  native: any;
};

export type TextElement = {
  kind: NodeType.TEXT;
  content: string;
};

export type TextNode = TextElement & {
  parent: RNode | null;
  native: any;
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

export type FragmentElement = {
  kind: NodeType.FRAGMENT;
  props: ElementProps;
};

export type FragmentNode = FragmentElement & {
  parent: RNode | null;
  descendants: RNode[];
};

export type RElement =
  | ComponentElement
  | HostElement
  | TextElement
  | ProviderElement
  | FragmentElement;

export type RNode =
  | ComponentNode
  | HostNode
  | TextNode
  | ProviderNode
  | FragmentNode;

enum HookType {
  STATE = 1,
  EFFECT = 2,
  REF = 3,
  CONTEXT = 4,
  MEMO = 5,
}

type StateHook = {
  type: HookType.STATE;
  state: any;
};

type EffectHook = {
  type: HookType.EFFECT;
  cleanup: (() => void) | undefined;
  dependencies?: any[];
};
type RefHook = {
  type: HookType.REF;
  current: any;
};
type ContextHook = {
  type: HookType.CONTEXT;
  context: any;
};
type MemoHook = {
  type: HookType.MEMO;
  memo: any;
  dependencies?: any[];
};

export type Hook = StateHook | EffectHook | RefHook | ContextHook | MemoHook;

// const Avatar = ({ author }: { author: number }) => {
//   return createElement("div", { class: "123" }, author.toString());
// };

// createElement(Avatar, { author: 1 });

// type FirstArgument<T> = T extends (arg1: infer U) => RElement ? U : any;

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
  component: any,
  props: any,
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
    // Provider has context injected as a param to its function.
    if (component.context) {
      return {
        kind: NodeType.PROVIDER,
        props: { ...p, $$context: component.context },
      };
    }

    return {
      kind: NodeType.COMPONENT,
      render: component,
      props: p,
    };
  } else if (typeof component === "string") {
    if (component === "") {
      return {
        kind: NodeType.FRAGMENT,
        props: p,
      };
    }

    return {
      kind: NodeType.HOST,
      tag: component,
      props: p,
    };
  }

  throw new Error("Something went wrong.");
}

let _currentNode: RNode | null = null;
let _hookIndex = 0;
let _currentHost: HostType<any, any> | null = null;

const contextValues: Map<Context<any>, any> = new Map();

const update = (
  node: RNode,
  element: RElement | null,
  config: UpdateConfig
) => {
  const { Host } = config;
  _currentHost = Host;

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
    (node.kind === NodeType.HOST ||
      node.kind === NodeType.PROVIDER ||
      node.kind === NodeType.FRAGMENT)
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

  if (
    config.isHydrating &&
    node.kind === NodeType.HOST &&
    element &&
    element.kind === NodeType.HOST
  ) {
    Host.updateHostNode(node, element);
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
        (current.kind === NodeType.FRAGMENT &&
          expected.kind === NodeType.FRAGMENT) ||
        (current.kind === NodeType.PROVIDER &&
          expected.kind === NodeType.PROVIDER) ||
        (current.kind === NodeType.TEXT && expected.kind === NodeType.TEXT))
    ) {
      // UPDATE
      if (current.kind === NodeType.HOST && expected.kind === NodeType.HOST) {
        Host.updateHostNode(current, expected);
      } else if (
        // Text value changed.
        current.kind === NodeType.TEXT &&
        expected.kind === NodeType.TEXT &&
        current.content !== expected.content
      ) {
        Host.updateTextNode(current, expected.content);
      }

      // Props can be updated.
      if ("props" in current && "props" in expected) {
        current.props = expected.props;
      }

      update(current, expected, config);
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

        Host.removeHostNode(current);
      } else if (expected.kind === NodeType.HOST) {
        const firstParentWithHostNode = Host.findClosestHostNode(node);

        const nodeConstruction: any = {
          ...expected,
          parent: node,
          descendants: [],
        };

        const native = Host.createHostNode(expected);
        if (current.kind === NodeType.HOST || current.kind === NodeType.TEXT) {
          firstParentWithHostNode.native.replaceChild(native, current.native);
        } else {
          Host.removeHostNode(current);
          Host.appendChild(firstParentWithHostNode.native, native);
        }
        nodeConstruction.native = native;

        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.TEXT) {
        const firstParentWithHostNode = Host.findClosestHostNode(node);
        const nodeConstruction: any = {
          ...expected,
          parent: node,
        };

        const native = Host.createTextNode(expected.content);
        if (current.kind === NodeType.TEXT) {
          throw new Error("Update should have happened on this node.");
        } else if (current.kind === NodeType.HOST) {
          firstParentWithHostNode.native.replaceChild(native, current.native);
          nodeConstruction.native = native;
        } else {
          Host.removeHostNode(current);
          Host.appendChild(firstParentWithHostNode.native, native);
          nodeConstruction.native = native;
        }

        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.PROVIDER) {
        newNode = {
          ...expected,
          context: expected.props.$$context,
          parent: node,
          descendants: [],
        };

        Host.removeHostNode(current);
      } else if (expected.kind === NodeType.FRAGMENT) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
        };

        Host.removeHostNode(current);
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
      update(newNode, expected, config);
    } else if (!current && expected !== undefined) {
      // ADD

      //////////////////////////////////////////////////////////////////////////
      // TODO                                                                 //
      // if hydrating then look for the host node to already exist and throw  //
      // if it doesn't.                                                       //
      //////////////////////////////////////////////////////////////////////////

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
        const firstParentWithHostNode = Host.findClosestHostNode(node);

        if (config.isHydrating) {
          nodeConstruction.native = _node;
          getNextNode();
        } else {
          nodeConstruction.native = Host.createHostNode(expected);
          Host.appendChild(
            firstParentWithHostNode.native,
            nodeConstruction.native
          );
        }

        newNode = nodeConstruction;

        // Handle useRef.
        const closestComponent = Host.findClosestComponent(node);
        if (closestComponent && closestComponent.kind === NodeType.COMPONENT) {
          for (const hook of closestComponent.hooks) {
            if (hook.type === HookType.REF && expected.props.ref === hook) {
              hook.current = (newNode as HostNode).native;
            }
          }
        }
      } else if (expected.kind === NodeType.TEXT) {
        const nodeConstruction: any = {
          ...expected,
          parent: node,
        };

        const firstParentWithNative = Host.findClosestHostNode(node);

        if (config.isHydrating) {
          nodeConstruction.native = _node;
          getNextNode();
        } else {
          const hostNode = Host.createTextNode(expected.content);
          Host.appendChild(firstParentWithNative.native, hostNode);
          nodeConstruction.native = hostNode;
        }

        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.PROVIDER) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
          context: expected.props.$$context,
        };
      } else if (expected.kind === NodeType.FRAGMENT) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
        };
      } else {
        throw new Error("Couldn't resolve node kind.");
      }

      node.descendants.push(newNode);
      update(newNode, expected, config);
    } else if (current !== undefined && !expected) {
      // REMOVE
      const indexOfCurrent = node.descendants.indexOf(current);

      if (current.kind === NodeType.COMPONENT) {
        current.hooks.forEach((hook) => {
          if (hook.type === HookType.EFFECT && hook.cleanup) {
            hook.cleanup();
          }
        });
      } else if (current.kind === NodeType.PROVIDER) {
        contextValues.delete(current.context);
      }

      Host.removeHostNode(current);
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
  _currentHost = null;
};

type Job = { node: RNode; element: RElement | null };

type UpdateConfig = {
  Host: HostType<any, any>;
  isHydrating?: boolean;
};

let updating = false;
const tasks: Job[] = [];
const effects: (() => void)[] = [];

const runUpdateLoop = (
  node: RNode,
  element: RElement | null,
  config: UpdateConfig
) => {
  tasks.push({ node, element });

  if (updating) {
    return;
  }

  updating = true;

  let current: Job | undefined;
  // Run all state updates.
  while ((current = tasks.shift())) {
    update(current.node, current.element, config);

    // Run all effects queued for this update.
    let effect: (() => void) | undefined;
    while ((effect = effects.shift())) {
      effect();
    }
  }

  contextValues.clear();
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
      const hook: EffectHook = {
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
  const H = _currentHost;

  if (!c || c.kind !== NodeType.COMPONENT) {
    throw new Error("Executing useState for non-function element.");
  }

  if (!H) {
    throw new Error("Missing host context.");
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

    runUpdateLoop(c, null, { Host: H });
  };

  _hookIndex += 1;

  return [hook.state, setState];
};

export const useRef = <T>(): { current: T | null } => {
  if (!_currentNode || _currentNode.kind !== NodeType.COMPONENT) {
    throw new Error("Can't use useRef on this node.");
  }

  let ref = _currentNode.hooks[_hookIndex];
  if (ref === undefined) {
    ref = { type: HookType.REF, current: null };
    _currentNode.hooks[_hookIndex] = ref;
  }

  if (ref.type !== HookType.REF) {
    throw new Error("Something went wrong.");
  }

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

type ProviderProps<T> = { value: T };

type Context<T> = {
  Provider: ({ value }: ProviderProps<T>) => RElement;
};

export const createContext = <T>(): Context<T> => {
  const context: any = {};

  const Provider = <T>({ value }: ProviderProps<T>): RElement => {
    // Doesn't matter what is being returned here.
    return createElement("a", {});
  };

  Provider.context = context;

  context.Provider = Provider;
  return context;
};

export const useContext = <T>(context: Context<T>): T => {
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
    native: container,
    parent: null,
    descendants: [],
  };

  runUpdateLoop(_rootNode, createElement("div", {}, element), {
    Host: DomHost,
  });
};

const print = (node: SSRNode | string): string => {
  if (typeof node === "string") {
    return node;
  }

  const optionalSpace = Object.keys(node.attributes).length > 0 ? " " : "";

  const attributes = Object.keys(node.attributes)
    .map((key) => `${key}="${node.attributes[key]}"`)
    .join(" ");

  const children = node.children.map((child) => print(child)).join("");

  return `<${node.tag}${optionalSpace}${attributes}>${children}</${node.tag}>`;
};

export const renderToString = (element: RElement): string => {
  _rootNode = {
    kind: NodeType.HOST,
    props: {
      children: [element],
      id: "root",
    },
    tag: "div",
    native: { tag: "div", attributes: { id: "root" }, children: [] },
    parent: null,
    descendants: [],
  };

  runUpdateLoop(_rootNode, createElement("div", {}, element), {
    Host: SSRHost,
  });

  return print(_rootNode.native);
};

export const hydrate = (element: RElement, container: HTMLElement): void => {
  _rootNode = {
    kind: NodeType.HOST,
    props: {
      children: [element],
    },
    tag: container.tagName.toLowerCase(),
    native: container,
    parent: null,
    descendants: [],
  };

  _node = container.firstChild;

  runUpdateLoop(_rootNode, createElement("div", {}, element), {
    Host: DomHost,
    isHydrating: true,
  });
};

let _node: Node = null;
export const getNextNode = () => {
  if (_node.firstChild) {
    _node = _node.firstChild;
  } else if (_node.nextSibling) {
    _node = _node.nextSibling;
  } else {
    while (!_node.nextSibling) {
      _node = _node.parentNode;

      if (_node === null) {
        return;
      }
    }
    _node = _node.nextSibling;
  }
};
