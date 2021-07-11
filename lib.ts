export type RenderFunction = (props: any) => RElement;

export type RElement =
  | {
      type: RenderFunction | string;
      props: {
        children: RElement[];
        [key: string]: any;
      };
    }
  | string;

export const createElement = (
  component: RenderFunction | string,
  props: any,
  children: RElement[]
): RElement => {
  return {
    type: component,
    props: { ...props, children },
  };
};

const isProp = (key: string) => key !== "chidren" && !key.startsWith("on");

export const render = (element: RElement, container: HTMLElement) => {
  let append;
  if (typeof element === "string") {
    append = document.createTextNode(element);
  } else if (typeof element.type === "string") {
    const dom = document.createElement(element.type);

    Object.entries(element.props)
      .filter(([key]) => isProp(key))
      .forEach(([key, value]) => {
        dom.setAttribute(key, value);
      });

    if (typeof element !== "string") {
      element.props.children.forEach((child) => {
        render(child, dom);
      });
    }
    append = dom;
  }

  container.appendChild(append);
};
