import { ComponentNode, HostNode, NodeType, RNode } from "./types";

export const isEvent = (key: string): boolean =>
  !!key.match(new RegExp("on[A-Z].*"));

export const eventToKeyword = (key: string): string =>
  key.replace("on", "").toLowerCase();

export const keyToAttribute = (key: string): string => {
  if (key === "viewBox") {
    return key;
  } else {
    return camelCaseToKebab(key);
  }
};

const camelCaseToKebab = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

export function styleObjectToString(style: {
  [key: string]: string | number;
}): string {
  const string = Object.keys(style)
    .map((key) => {
      const value = style[key];
      return `${camelCaseToKebab(key)}:${value}`;
    })
    .join(";");
  return string;
}

export function findClosestComponent(node: RNode): ComponentNode | null {
  let current = node;

  while (current.kind !== NodeType.COMPONENT && current.parent) {
    current = current.parent;
  }

  if (current.kind !== NodeType.COMPONENT) {
    return null;
  }

  return current;
}

export function findClosestHostNode(node: RNode): HostNode {
  let current = node;

  while (current.kind !== NodeType.HOST && current.parent) {
    current = current.parent;
  }

  // Only interested in looking for host node as text node wouldn't have
  // children anyway.
  if (current.kind !== NodeType.HOST) {
    throw new Error("Couldn't find node.");
  }

  return current;
}
