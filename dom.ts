import { RElement, RNode, RNodeReal, SPECIAL_TYPES } from "./lib";

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
    node.type === null ||
    element === null ||
    typeof element === "string" ||
    node.type === SPECIAL_TYPES.PROVIDER ||
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
  node.dom = html;

  if (typeof element.props.children === "string") {
    html.appendChild(document.createTextNode(element.props.children));
  }
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

  if (current.type === null || current.type === SPECIAL_TYPES.PROVIDER) {
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
    typeof current.props.children === "string" &&
    typeof expected.props.children !== "string"
  ) {
    const clone = current.dom.cloneNode(false);

    if (current.dom.parentNode) {
      current.dom.parentNode.replaceChild(clone, current.dom);
      current.dom = clone;
    }
  }

  // If children is text and it changed.
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

export const removeDom = (node: RNode) => {
  if (
    node.type === null ||
    node.type === SPECIAL_TYPES.PROVIDER ||
    node.dom === undefined
  ) {
    throw new Error("Tried to remove incorrect node.");
  }

  node.dom.parentNode?.removeChild(node.dom);
};

export const findClosestDom = (node: RNode): RNodeReal => {
  let current = node;

  while (
    current.type !== null &&
    (current.type === SPECIAL_TYPES.PROVIDER || !current.dom) && // TODO CONTEXT: this might be breaking.
    current.parent
  ) {
    current = current.parent;
  }

  if (current.type === null) {
    throw new Error("Parent node was null.");
  }

  if (current.type === SPECIAL_TYPES.PROVIDER) {
    throw new Error("Node is a provider.");
  }

  if (current.dom === undefined) {
    throw new Error("Node is missing DOM.");
  }

  return current;
};
