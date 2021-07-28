export type HostType<T, R> = {
  findClosestComponent: (node: RNode) => ComponentNode | null;
  findClosestHostNode: (node: RNode) => HostNode;
  createHostNode: (element: HostElement) => T;
  updateHostNode: (current: HostNode, expected: HostElement) => void;
  removeHostNode: (hostNode: RNode) => void;
  appendChild: (parent: T, child: T) => void;
  createTextNode: (text: string) => R;
  updateTextNode: (current: TextNode, text: string) => void;
};

export type Children = RElement[] | string | null;

export type ProviderProps<T> = { value: T };

export type Context<T> = {
  Provider: ({ value }: ProviderProps<T>) => RElement;
};

export type ElementProps = {
  children: RElement[];
  [key: string]: any;
};

export type Props = {
  [key: string]: any;
  style?: Record<string, unknown> | string;
};

export type RenderFunction = (props: any) => RElement;

export type ComponentType = RenderFunction | string;

export enum NodeType {
  COMPONENT = 1,
  HOST = 2,
  TEXT = 3,
  PROVIDER = 4,
  NULL = 5,
  FRAGMENT = 6,
}

export type ComponentElement = {
  kind: NodeType.COMPONENT;
  render: RenderFunction;
  props: ElementProps;
};

export type ComponentNode = ComponentElement & {
  parent: RNode | null;
  descendants: RNode[];
  hooks: Hook[];
};

export type HostElement = {
  kind: NodeType.HOST;
  tag: string;
  props: ElementProps;
};

export type HostNode = HostElement & {
  parent: RNode | null;
  descendants: RNode[];
  native: any;
};

export type TextElement = {
  kind: NodeType.TEXT;
  content: string;
};

export type TextNode = TextElement & {
  parent: RNode | null;
  native: any;
};

export type ProviderElement = {
  kind: NodeType.PROVIDER;
  props: ElementProps;
};

export type ProviderNode = ProviderElement & {
  parent: RNode | null;
  context: Context<any>;
  descendants: RNode[];
};

export type FragmentElement = {
  kind: NodeType.FRAGMENT;
  props: ElementProps;
};

export type FragmentNode = FragmentElement & {
  parent: RNode | null;
  descendants: RNode[];
};

export type RElement =
  | ComponentElement
  | HostElement
  | TextElement
  | ProviderElement
  | FragmentElement;

export type RNode =
  | ComponentNode
  | HostNode
  | TextNode
  | ProviderNode
  | FragmentNode;

export enum HookType {
  STATE = 1,
  EFFECT = 2,
  REF = 3,
  CONTEXT = 4,
  MEMO = 5,
}

export type StateHook = {
  type: HookType.STATE;
  state: any;
};

export type EffectHook = {
  type: HookType.EFFECT;
  cleanup: (() => void) | undefined;
  dependencies?: any[];
};

export type RefHook = {
  type: HookType.REF;
  current: any;
};

export type ContextHook = {
  type: HookType.CONTEXT;
  context: any;
};

export type MemoHook = {
  type: HookType.MEMO;
  memo: any;
  dependencies?: any[];
};

export type Hook = StateHook | EffectHook | RefHook | ContextHook | MemoHook;
