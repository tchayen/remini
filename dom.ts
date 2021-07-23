import {
  ComponentNode,
  HostNode,
  NodeType,
  RElement,
  RNode,
  SPECIAL_TYPES,
} from "./lib";

const isEvent = (key: string) => !!key.match(new RegExp("on[A-Z].*"));
const eventToKeyword = (key: string) => key.replace("on", "").toLowerCase();

const keyToAttribute = (key: string) => {
  if (key === "viewBox") {
    return key;
  } else {
    return camelCaseToKebab(key);
  }
};

const camelCaseToKebab = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const styleObjectToString = (style: { [key: string]: string | number }) => {
  const string = Object.keys(style)
    .map((key) => {
      const value = style[key];
      return `${camelCaseToKebab(key)}:${value}`;
    })
    .join(";");
  return string;
};

const createElement = (type: string) => {
  if (type === "svg" || type === "circle" || type === "path") {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
  } else {
    return document.createElement(type);
  }
};

export const insertDom = (parent: Node, node: RNode, element: RElement) => {
  if (
    node.kind !== NodeType.HOST ||
    element === null ||
    typeof element === "string" ||
    element.type === SPECIAL_TYPES.PROVIDER ||
    typeof element.type === "function"
  ) {
    throw new Error("This is not supposed to happen.");
  }

  const html = createElement(element.type);

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === "children") {
      // Skip.
    } else if (key === "style") {
      const style =
        typeof value === "string" ? value : styleObjectToString(value);
      html.setAttribute(key, style);
    } else if (isEvent(key)) {
      html.addEventListener(eventToKeyword(key), value);
    } else {
      html.setAttribute(keyToAttribute(key), value);
    }
  });

  parent.appendChild(html);

  if (
    element.props.children?.length === 1 &&
    typeof element.props.children[0] === "string"
  ) {
    html.appendChild(document.createTextNode(element.props.children[0]));
  }

  return html;
};

// Update two DOM nodes of the same HTML tag.
export const updateDom = (current: RNode, expected: RElement) => {
  if (
    expected === null ||
    typeof expected == "string" ||
    expected.type === SPECIAL_TYPES.PROVIDER
  ) {
    throw new Error("No!");
  }

  if (current.kind !== NodeType.HOST) {
    throw new Error("Cannot update non-host node.");
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
        if (key === "style") {
          const style =
            typeof expected.props[key] === "string"
              ? expected.props[key]
              : styleObjectToString(expected.props[key]);
          html.setAttribute(key, style);
        } else {
          html.setAttribute(keyToAttribute(key), expected.props[key] as string);
        }
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
        if (key === "style") {
          const style =
            typeof current.props[key] === "string"
              ? current.props[key]
              : styleObjectToString(current.props[key]);
          html.setAttribute(key, style);
        } else {
          html.setAttribute(keyToAttribute(key), expected.props[key] as string);
        }
      }
    }
  });

  // If children was text but is now gone.
  if (
    current.props.children?.length === 1 &&
    typeof current.props.children[0] === "string" &&
    (expected.props.children?.length !== 1 ||
      typeof expected.props.children[0] !== "string")
  ) {
    const clone = current.dom.cloneNode(false);

    if (current.dom.parentNode) {
      current.dom.parentNode.replaceChild(clone, current.dom);
      current.dom = clone;
    }
  }

  // If children is text and it changed.
  if (
    current.props.children?.length === 1 &&
    typeof current.props.children[0] === "string" &&
    expected.props.children?.length === 1 &&
    typeof expected.props.children[0] === "string"
  ) {
    if (current.props.children[0] !== expected.props.children[0]) {
      html.firstChild?.replaceWith(
        document.createTextNode(expected.props.children[0])
      );
    }
  }
};

export const removeDom = (node: RNode) => {
  if (node.kind !== NodeType.HOST) {
    throw new Error("Tried to remove incorrect node.");
  }

  node.dom.parentNode?.removeChild(node.dom);
};

export const findClosestDom = (node: RNode): HostNode => {
  let current = node;

  while (current.kind !== NodeType.HOST && current.parent) {
    current = current.parent;
  }

  if (current.kind !== NodeType.HOST) {
    throw new Error("Couldn't find node.");
  }

  return current;
};

export const findClosestComponent = (node: RNode): ComponentNode | null => {
  let current = node;

  while (current.kind === NodeType.HOST && current.parent) {
    current = current.parent;
  }

  if (current.kind !== NodeType.COMPONENT) {
    return null;
  }

  return current;
};
