import { HostElement, HostNode, NodeType, RNode, TextNode } from "./types";
import {
  isEvent,
  keyToAttribute,
  styleObjectToString,
  findClosestComponent,
  findClosestHostNode,
} from "./utils";

export type SSRNode = {
  tag: string;
  attributes: { [key: string]: string };
  children: (SSRNode | string)[];
};

export function removeHostNode(node: RNode): void {
  if (node.kind === NodeType.HOST || node.kind === NodeType.TEXT) {
    const { children } = node.native.parent;
    children.splice(children.indexOf(node.native), 1);
  } else {
    for (let i = 0; i < node.descendants.length; i++) {
      removeHostNode(node.descendants[i]);
    }
  }
}

// TODO
// Remove code that is repeated in DOM.

export function createHostNode(element: HostElement): SSRNode {
  const html: SSRNode = {
    tag: element.tag,
    children: [],
    attributes: {},
  };

  const props = Object.entries(element.props);
  for (let i = 0; i < props.length; i++) {
    const [key, value] = props[i];

    if (key === "children" || key === "ref") {
      // Skip.
    } else if (key === "style") {
      const style =
        typeof value === "string" ? value : styleObjectToString(value);
      html.attributes[key] = style;
    } else if (isEvent(key)) {
      //
    } else {
      html.attributes[keyToAttribute(key)] = value;
    }
  }

  return html;
}

export function updateHostNode(current: HostNode, expected: HostElement): void {
  const html = current.native as SSRNode;

  const currentKeys = Object.keys(current.props);
  for (let i = 0; i < currentKeys.length; i++) {
    const key = currentKeys[i];
    if (key === "children" || key === "ref") {
      // Skip.
    } else if (isEvent(key)) {
      // html.removeEventListener(eventToKeyword(key), current.props[key]);
    } else {
      // Prop will be removed.
      if (!expected.props[key]) {
        delete html.attributes[key];
      }
    }
  }

  const expectedKeys = Object.keys(expected.props);
  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    if (key === "children" || key === "ref") {
      // Skip.
    } else if (isEvent(key)) {
      // html.addEventListener(eventToKeyword(key), expected.props[key]);
    } else {
      // Prop will be added/updated.
      if (expected.props[key] !== current.props[key]) {
        if (key === "style") {
          const style =
            typeof current.props[key] === "string"
              ? current.props[key]
              : styleObjectToString(current.props[key]);
          html.attributes[key] = style;
        } else {
          html.attributes[keyToAttribute(key)] = expected.props[key] as string;
        }
      }
    }
  }
}

export function appendChild(parent: SSRNode, child: SSRNode): void {
  parent.children.push(child);
}

export function createTextNode(text: string): string {
  return text;
}

export function updateTextNode(node: TextNode, text: string): void {
  node.native = text;
}

export const host = {
  findClosestComponent,
  createHostNode,
  findClosestHostNode,
  removeHostNode,
  updateHostNode,
  appendChild,
  createTextNode,
  updateTextNode,
};
