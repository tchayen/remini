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

export const removeHostNode = (node: RNode): void => {
  if (node.kind === NodeType.HOST || node.kind === NodeType.TEXT) {
    const { children } = node.native.parent;
    children.splice(children.indexOf(node.native), 1);
  } else {
    node.descendants.forEach((child) => {
      removeHostNode(child);
    });
  }
};

// TODO
// Remove code that is repeated in DOM.

export const createHostNode = (element: HostElement): SSRNode => {
  const html: SSRNode = {
    tag: element.tag,
    children: [],
    attributes: {},
  };

  Object.entries(element.props).forEach(([key, value]) => {
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
  });

  return html;
};

export const updateHostNode = (
  current: HostNode,
  expected: HostElement
): void => {
  const html = current.native as SSRNode;

  Object.keys(current.props).forEach((key) => {
    if (key === "children" || key === "ref") {
      // Skip.
    } else if (isEvent(key)) {
      // html.removeEventListener(eventToKeyword(key), current.props[key]);
    } else {
      // Prop will be removed.
      if (!expected.props[key]) {
        delete html.attributes[key];
      }

      // Prop will be updated.
      if (expected.props[key]) {
        if (key === "style") {
          const style =
            typeof expected.props[key] === "string"
              ? expected.props[key]
              : styleObjectToString(expected.props[key]);
          html.attributes[key] = style;
        } else {
          html.attributes[keyToAttribute(key)] = expected.props[key] as string;
        }
      }
    }
  });

  Object.keys(expected.props).forEach((key) => {
    if (key === "children" || key === "ref") {
      // Skip.
    } else if (isEvent(key)) {
      // html.addEventListener(eventToKeyword(key), expected.props[key]);
    } else {
      // Prop will be added.
      if (!current.props[key]) {
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
  });
};

export const appendChild = (parent: SSRNode, child: SSRNode): void => {
  parent.children.push(child);
};

export const createTextNode = (text: string): string => text;

export const updateTextNode = (node: TextNode, text: string): void => {
  node.native = text;
};

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
