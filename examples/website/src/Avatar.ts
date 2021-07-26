import { createElement as c, RElement } from "../../../lib";
import { users } from "./data";

const Avatar = ({ author }: { author: number }): RElement => {
  return c("div", { class: `rounded-full ${users[author].avatar} h-12 w-12` });
};

export default Avatar;
