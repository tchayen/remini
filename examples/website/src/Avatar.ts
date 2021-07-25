import { createElement as c } from "../../../lib";
import { users } from "./data";

const Avatar = ({ author }: { author: number }) => {
  return c("div", { class: `rounded-full ${users[author].avatar} h-12 w-12` });
};

export default Avatar;
