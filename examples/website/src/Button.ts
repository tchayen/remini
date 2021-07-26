import { createElement as c, RElement } from "../../../lib";

const Button = ({ children, loading, ...props }: any): RElement => {
  return c(
    "button",
    {
      ...props,
      type: "submit",
      ...(loading ? { disabled: "disabled" } : {}),
      class:
        "w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-700",
    },
    children
  );
};

export default Button;
