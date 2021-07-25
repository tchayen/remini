import { createElement as c } from "../../../lib";
import { TEXT_PRIMARY } from "./constants";

const Label = ({ children, ...props }: any) => {
  return c(
    "label",
    { ...props, class: `text-sm ${TEXT_PRIMARY} font-bold` },
    children
  );
};

export default Label;
