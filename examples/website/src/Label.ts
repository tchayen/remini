import { createElement as c, RElement } from "../../../lib";
import { TEXT_PRIMARY } from "./constants";

const Label = ({ children, ...props }: any): RElement => {
  return c(
    "label",
    { ...props, class: `text-sm ${TEXT_PRIMARY} font-bold` },
    children
  );
};

export default Label;
