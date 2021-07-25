import { ComponentNode, HostElement, HostNode, NodeType, RNode } from "./lib";

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

export const createDom = (
  element: HostElement
): HTMLElement | SVGGraphicsElement => {
  const html = createElement(element.tag);

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

  return html;
};

// Update two DOM nodes of the same HTML tag.
export const updateDom = (current: HostNode, expected: HostElement): void => {
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
};

export const removeDom = (node: RNode): void => {
  if (node.kind === NodeType.HOST || node.kind === NodeType.TEXT) {
    node.dom.parentNode?.removeChild(node.dom);
  } else {
    node.descendants.forEach((child) => {
      removeDom(child);
    });
  }
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

  while (current.kind !== NodeType.COMPONENT && current.parent) {
    current = current.parent;
  }

  if (current.kind !== NodeType.COMPONENT) {
    return null;
  }

  return current;
};
