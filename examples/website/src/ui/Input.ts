import { createElement as c, RElement } from "../../../../packages/remini/lib";
import { TEXT_PRIMARY } from "../constants";

const Input = ({ loading, ...props }: any): RElement => {
  return c(
    "div",
    { class: "mt-1 mb-4" },
    c("input", {
      ...props,
      ...(loading ? { disabled: "disabled" } : {}),
      class: `p-2 bg-white appearance-none border border-gray-200 rounded w-full ${TEXT_PRIMARY} leading-tight focus:outline-none focus:ring focus:border-blue-500`,
    })
  );
};

export default Input;
