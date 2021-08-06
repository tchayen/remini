import {
  createElement as c,
  RElement,
  useEffect,
  useRef,
} from "../../../../packages/remini/lib";

const AutoScale = (props: any): RElement => {
  const ref = useRef<HTMLTextAreaElement>();

  const resize = () => {
    if (ref.current === null) {
      return;
    }

    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, []);

  return c("textarea", {
    ref,
    style: {
      resize: "none",
      overflowY: "hidden",
    },
    row: 1,
    onInput: resize,
    ...props,
  });
};

export default AutoScale;
