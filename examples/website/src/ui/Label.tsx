import { createElement as c, RElement } from "../../../../packages/remini/lib";
import { TEXT_PRIMARY } from "../constants";

const Label = ({ children, ...props }: any): RElement => {
  return (
    <label {...props} class={`text-sm ${TEXT_PRIMARY} font-bold`}>
      {children}
    </label>
  );
};

export default Label;
