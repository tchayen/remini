import { host as domHost } from "./dom";
import { SSRNode, host as ssrHost } from "./ssr";
import {
  Child,
  Children,
  ComponentType,
  Context,
  EffectHook,
  HookType,
  HostNode,
  HostType,
  NodeType,
  Props,
  ProviderProps,
  RElement,
  RNode,
} from "./types";

export type { RElement } from "./types";

// const Avatar = ({ author }: { author: number }) => {
//   return createElement("div", { class: "123" }, author.toString());
// };

// createElement(Avatar, { author: 1 });

// type FirstArgument<T> = T extends (arg1: infer U) => RElement ? U : any;

export let _rootNode: HostNode | null = null;

let _currentNode: RNode | null = null;
let _hookIndex = 0;
let _currentHost: HostType<any, any> | null = null;
const _contextValues: Map<Context<any>, any> = new Map();

const _componentToNode = new Map<string, RNode[]>();

type Job = {
  node: RNode;
  element: RElement | null;
};

type UpdateConfig = {
  host: HostType<any, any>;
  isHydrating?: boolean;
};

let _updating = false;
const _tasks: Job[] = [];
const _effects: (() => void)[] = [];

export function createElement(
  component: ComponentType,
  props: Props,
  children: Children
): RElement;

export function createElement(
  component: ComponentType,
  props?: Props,
  ...children: Child[]
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
      .map((child: Child) => {
        if (typeof child === "string") {
          return {
            kind: NodeType.TEXT,
            content: child,
          };
        } else if (typeof child === "number") {
          return {
            kind: NodeType.TEXT,
            content: child.toString(),
          };
        } else {
          // Null and false will be passed here and filtered below.
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

// Null element argument is meant for updating components.
function update(node: RNode, element: RElement | null, config: UpdateConfig) {
  const { host, isHydrating } = config;
  _currentHost = host;

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
    elements = [node.render(node.props)].filter(Boolean) as RElement[];
    _hookIndex = 0;
  } else if (
    element &&
    "props" in element &&
    (node.kind === NodeType.HOST ||
      node.kind === NodeType.PROVIDER ||
      node.kind === NodeType.FRAGMENT)
  ) {
    if (node.kind === NodeType.PROVIDER) {
      const currentValue = _contextValues.get(node.context);

      if (currentValue) {
        replacedContext = {
          context: node.context,
          value: currentValue,
        };
      }

      _contextValues.set(node.context, { value: node.props.value });
    }

    elements = element.props.children;
  }

  if (
    isHydrating &&
    node.kind === NodeType.HOST &&
    element &&
    element.kind === NodeType.HOST
  ) {
    host.updateHostNode(node, element);
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
        host.updateHostNode(current, expected);
      } else if (
        // Text value changed.
        current.kind === NodeType.TEXT &&
        expected.kind === NodeType.TEXT &&
        current.content !== expected.content
      ) {
        current.content = expected.content;
        host.updateTextNode(current, expected.content);
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

        host.removeHostNode(current);
      } else if (expected.kind === NodeType.HOST) {
        const firstParentWithHostNode = host.findClosestHostNode(node);

        const nodeConstruction: any = {
          ...expected,
          parent: node,
          descendants: [],
        };

        const native = host.createHostNode(expected);
        if (current.kind === NodeType.HOST || current.kind === NodeType.TEXT) {
          firstParentWithHostNode.native.replaceChild(native, current.native);
        } else {
          host.removeHostNode(current);
          host.appendChild(firstParentWithHostNode.native, native);
        }
        nodeConstruction.native = native;

        newNode = nodeConstruction;
      } else if (expected.kind === NodeType.TEXT) {
        const firstParentWithHostNode = host.findClosestHostNode(node);
        const nodeConstruction: any = {
          ...expected,
          parent: node,
        };

        const native = host.createTextNode(expected.content);
        if (current.kind === NodeType.TEXT) {
          throw new Error("Update should have happened on this node.");
        } else if (current.kind === NodeType.HOST) {
          firstParentWithHostNode.native.replaceChild(native, current.native);
          nodeConstruction.native = native;
        } else {
          host.removeHostNode(current);
          host.appendChild(firstParentWithHostNode.native, native);
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

        host.removeHostNode(current);
      } else if (expected.kind === NodeType.FRAGMENT) {
        newNode = {
          ...expected,
          parent: node,
          descendants: [],
        };

        host.removeHostNode(current);
      } else {
        throw new Error("Couldn't resolve node kind.");
      }

      if (current.kind === NodeType.COMPONENT) {
        current.hooks.forEach((hook) => {
          if (hook.type === HookType.EFFECT && hook.cleanup) {
            hook.cleanup();
          }
        });

        // Remove node from mapping.
        if (import.meta.env.DEV && current.render.$id$) {
          _componentToNode.set(
            current.render.$id$,
            (_componentToNode.get(current.render.$id$) || []).filter((node) => {
              return node !== current;
            })
          );
        }
      }

      node.descendants[node.descendants.indexOf(current)] = newNode;
      update(newNode, expected, config);
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

        if (expected.kind === NodeType.COMPONENT) {
          if (import.meta.env.DEV && expected.render.$id$) {
            _componentToNode.set(
              expected.render.$id$,
              (_componentToNode.get(expected.render.$id$) || []).concat(newNode)
            );
          }
        }
      } else if (expected.kind === NodeType.HOST) {
        const nodeConstruction: any = {
          ...expected,
          parent: node,
          descendants: [],
        };
        const firstParentWithHostNode = host.findClosestHostNode(node);

        if (isHydrating) {
          nodeConstruction.native = _node;
          getNextNode();
        } else {
          nodeConstruction.native = host.createHostNode(expected);
          host.appendChild(
            firstParentWithHostNode.native,
            nodeConstruction.native
          );
        }

        newNode = nodeConstruction;

        // Handle useRef.
        const closestComponent = host.findClosestComponent(node);
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

        const firstParentWithNative = host.findClosestHostNode(node);

        if (isHydrating) {
          nodeConstruction.native = _node;
          getNextNode();
        } else {
          const hostNode = host.createTextNode(expected.content);
          host.appendChild(firstParentWithNative.native, hostNode);
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

        // Remove node from mapping.
        if (import.meta.env.DEV && current.render.$id$) {
          _componentToNode.set(
            current.render.$id$,
            (_componentToNode.get(current.render.$id$) || []).filter((node) => {
              return node !== current;
            })
          );
        }
      } else if (current.kind === NodeType.PROVIDER) {
        _contextValues.delete(current.context);
      }

      host.removeHostNode(current);
      node.descendants.splice(indexOfCurrent, 1);
    }
  });

  if (node.kind === NodeType.PROVIDER && replacedContext !== null) {
    _contextValues.set(replacedContext.context, {
      value: replacedContext.value,
    });
  }

  _currentNode = previousNode;
  _hookIndex = previousIndex;
  _currentHost = null;
}

function runUpdateLoop(
  node: RNode,
  element: RElement | null,
  config: UpdateConfig
) {
  _tasks.push({ node, element });

  if (_updating) {
    return;
  }

  _updating = true;

  let current: Job | undefined;
  // Run all state updates.
  while ((current = _tasks.shift())) {
    update(current.node, current.element, config);

    // Run all effects queued for this update.
    let effect: (() => void) | undefined;
    while ((effect = _effects.shift())) {
      effect();
    }
  }

  _contextValues.clear();
  _updating = false;
}

export function useEffect(
  callback: () => void | (() => void),
  dependencies?: any[]
): void {
  // Capture the current node.
  const c = _currentNode;
  const i = _hookIndex;

  if (!c || c.kind !== NodeType.COMPONENT) {
    throw new Error("Executing useEffect for non-function element.");
  }

  _effects.push(() => {
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
}

export function useState<T>(
  initial: T
): [T, (next: T | ((current: T) => T)) => void] {
  // Capture the current node.
  const c = _currentNode;
  const i = _hookIndex;
  const h = _currentHost;

  if (!c || c.kind !== NodeType.COMPONENT) {
    throw new Error("Executing useState for non-function element.");
  }

  if (!h) {
    throw new Error("Missing host context.");
  }

  if (c.hooks[i] === undefined) {
    c.hooks[i] = {
      type: HookType.STATE,
      state: initial,
    };
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

    runUpdateLoop(c, null, { host: h });
  };

  _hookIndex += 1;

  return [hook.state, setState];
}

export function useRef<T>(): { current: T | null } {
  if (!_currentNode || _currentNode.kind !== NodeType.COMPONENT) {
    throw new Error("Can't use useRef on this node.");
  }

  let ref = _currentNode.hooks[_hookIndex];
  if (ref === undefined) {
    ref = {
      type: HookType.REF,
      current: null,
    };
    _currentNode.hooks[_hookIndex] = ref;
  }

  if (ref.type !== HookType.REF) {
    throw new Error("Something went wrong.");
  }

  _hookIndex += 1;

  return ref;
}

export function useMemo<T>(callback: () => T, dependencies: any[]): T {
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
}

export function createContext<T>(): Context<T> {
  const context: any = {};

  const providerRender = <T>({ value }: ProviderProps<T>): RElement => {
    // Doesn't matter at all what is being returned here as long as it is of
    // RElement type.
    return createElement("a", {});
  };

  providerRender.context = context;
  context.Provider = providerRender;
  return context;
}

export function useContext<T>(context: Context<T>): T {
  if (!_currentNode || _currentNode.kind !== NodeType.COMPONENT) {
    throw new Error("Can't call useContext on this node.");
  }

  const newValue = _contextValues.get(context);
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
}

export function render(element: RElement, container: HTMLElement): void {
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

  _componentToNode.clear();

  runUpdateLoop(_rootNode, createElement("div", {}, element), {
    host: domHost,
  });
}

const printSSRTree = (node: SSRNode | string): string => {
  if (typeof node === "string") {
    return node;
  }

  const optionalSpace = Object.keys(node.attributes).length > 0 ? " " : "";

  const attributes = Object.keys(node.attributes)
    .map((key) => `${key}="${node.attributes[key]}"`)
    .join(" ");

  const children = node.children.map((child) => printSSRTree(child)).join("");

  return `<${node.tag}${optionalSpace}${attributes}>${children}</${node.tag}>`;
};

export function renderToString(element: RElement): string {
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
    host: ssrHost,
  });

  return printSSRTree(_rootNode.native);
}

export function hydrate(element: RElement, container: HTMLElement): void {
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

  _node = container.firstChild as Node;

  runUpdateLoop(_rootNode, createElement("div", {}, element), {
    host: domHost,
    isHydrating: true,
  });
  _node = null;
}

// TODO
// Move somewhere outside.
let _node: Node | null = null;
function getNextNode() {
  if (_node === null) {
    return;
  } else if (_node.firstChild) {
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
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  window.__UPDATE__ = (node: RNode) =>
    runUpdateLoop(node, null, { host: domHost });
  window.__COMPONENT_TO_NODE__ = _componentToNode;
}
