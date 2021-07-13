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

const isEvent = (key: string) => !!key.match(new RegExp("on[A-Z].*"));
const eventToKeyword = (key: string) => key.replace("on", "").toLowerCase();

const insertDom = (parent: Node, node: RNode, element: RElement) => {
  if (
    node.type === null ||
    element === null ||
    typeof element === "string" ||
    typeof element.type === "function"
  ) {
    throw new Error("This is not supposed to happen");
  }

  const html = document.createElement(element.type);

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === "children") {
      // Skip.
    } else if (isEvent(key)) {
      html.addEventListener(eventToKeyword(key), value);
    } else {
      html.setAttribute(key, value as string);
    }
  });

  parent.appendChild(html);
  node.dom = html;

  if (typeof element.props.children === "string") {
    html.appendChild(document.createTextNode(element.props.children));
  }
};

// Update two DOM nodes of the same HTML tag.
const updateDom = (current: RNode, expected: RElement) => {
  if (expected === null || typeof expected == "string") {
    throw new Error("No!");
  }

  if (current.type === null) {
    throw new Error("Cannot update null node.");
  }

  if (!current.dom) {
    throw new Error("Tried updating DOM of a node without DOM representation.");
  }

  const html = current.dom as HTMLElement;

  Object.keys(current.props).forEach((key) => {
    if (key === "children") {
      // Skip.
    } else if (isEvent(key)) {
      html.removeEventListener(eventToKeyword(key), current.props[key]);
    } else {
      // Prop will be removed.
      if (!expected.props[key]) {
        html.removeAttribute(key);
      }

      // Prop will be updated.
      if (expected.props[key]) {
        html.setAttribute(key, expected.props[key] as string);
      }
    }
  });

  Object.keys(expected.props).forEach((key) => {
    if (key === "children") {
      // Skip.
    } else if (isEvent(key)) {
      html.addEventListener(eventToKeyword(key), expected.props[key]);
    } else {
      // Prop will be added.
      if (!current.props[key]) {
        html.setAttribute(key, expected.props[key] as string);
      }
    }
  });

  if (
    typeof current.props.children === "string" &&
    typeof expected.props.children === "string"
  ) {
    if (current.props.children !== expected.props.children) {
      html.firstChild?.replaceWith(
        document.createTextNode(expected.props.children)
      );
    }
  }
};

const removeDom = (node: Node) => {
  node.parentNode?.removeChild(node);
};

const findClosestDom = (node: RNode) => {
  let current = node;

  while (current.type !== null && !current.dom && current.parent) {
    current = current.parent;
  }

  if (current.type === null) {
    throw new Error("Parent node was null.");
  }

  if (current.dom === undefined) {
    throw new Error("Node is missing DOM.");
  }

  return current.dom;
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
      // console.log("> update");

      if (typeof current.type === "string") {
        updateDom(current, expected);
      }

      current.props = expected.props;
      update(current, expected);
    } else if (current && expected && current.type !== expected.type) {
      // REPLACE
      // console.log("> replace");

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
      // console.log("> add");

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
      // console.log("> remove");
      // REMOVE
      // TODO test

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
