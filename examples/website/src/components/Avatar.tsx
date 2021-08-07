import { createElement as c, RElement } from "../../../../packages/remini/lib";
import { users } from "../data";

const Avatar = ({ author }: { author: number }): RElement => {
  return (
    <div
      class={`rounded-full ${users[author].avatar} h-12 w-12 text-2xl text-white flex justify-center items-center`}
    >
      {users[author].fullName[0]}
    </div>
  );
};

export default Avatar;
