import { RElement, RNode } from "./lib";

const isEvent = (key: string) => !!key.match(new RegExp("on[A-Z].*"));
const eventToKeyword = (key: string) => key.replace("on", "").toLowerCase();

export const insertDom = (parent: Node, node: RNode, element: RElement) => {
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
export const updateDom = (current: RNode, expected: RElement) => {
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

export const removeDom = (node: Node) => {
  node.parentNode?.removeChild(node);
};

export const findClosestDom = (node: RNode) => {
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