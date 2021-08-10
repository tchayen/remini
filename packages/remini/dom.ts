import { HostElement, HostNode, NodeType, RNode, TextNode } from "./types";
import {
  eventToKeyword,
  isEvent,
  keyToAttribute,
  styleObjectToString,
  findClosestComponent,
  findClosestHostNode,
} from "./utils";

function createElement(type: string): Element {
  if (type === "svg" || type === "circle" || type === "path") {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
  } else {
    return document.createElement(type);
  }
}

export function createDom(element: HostElement): Element {
  const html = createElement(element.tag);

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === "children" || key === "ref") {
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
}

// Update two DOM nodes of the same HTML tag.
export function updateDom(current: HostNode, expected: HostElement): void {
  const html = current.native as HTMLElement;

  Object.keys(current.props).forEach((key) => {
    if (key === "children" || key === "ref") {
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
    if (key === "children" || key === "ref") {
      // Skip.
    } else if (isEvent(key)) {
      html.addEventListener(eventToKeyword(key), expected.props[key]);
    } else {
      // Prop will be added.
      if (!current.props[key]) {
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
}

export function removeDom(node: RNode): void {
  if (node.kind === NodeType.HOST || node.kind === NodeType.TEXT) {
    node.native.parentNode?.removeChild(node.native);
  } else {
    node.descendants.forEach((child) => {
      removeDom(child);
    });
  }
}

export function appendChild(parent: Node, child: Node): void {
  parent.appendChild(child);
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function updateTextNode(current: TextNode, text: string): void {
  current.native.nodeValue = text;
}

export const host = {
  findClosestComponent,
  findClosestHostNode,
  createHostNode: createDom,
  updateHostNode: updateDom,
  removeHostNode: removeDom,
  appendChild,
  createTextNode,
  updateTextNode,
};
