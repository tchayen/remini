import { createElement as c, RElement, useEffect, useRef } from "../../../lib";

const AutoScale = (props: any): RElement => {
  const ref = useRef();

  const resize = () => {
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  };

  const delayedResize = () => {
    setTimeout(resize, 0);
  };

  useEffect(() => {
    resize();
  }, []);

  return c("textarea", {
    ref,
    style: {
      resize: "none",
      overflow: "hidden",
    },
    row: 1,
    onChange: resize,
    onCut: delayedResize,
    onPaste: delayedResize,
    onDrop: delayedResize,
    onKeyDown: delayedResize,
    ...props,
  });
};

export default AutoScale;
