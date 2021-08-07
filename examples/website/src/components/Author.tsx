import {
  createElement as c,
  RElement,
  useState,
} from "../../../../packages/remini/lib";
import Avatar from "./Avatar";
import { TEXT_PRIMARY, TEXT_SECONDARY } from "../constants";
import { users } from "../data";

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

const Author = ({ author }: { author: number }): RElement => {
  const [show, setShow] = useState(false);

  const onMouseOver = () => {
    setShow(true);
  };

  const onMouseOut = () => {
    setShow(false);
  };

  return (
    <div class="relative">
      {show ? (
        <div class="absolute top-6 bg-white p-4 rounded border border-gray-200 shadow-lg z-10">
          <div>
            <div class="flex justify-between">
              <Avatar author={author} />
              <div class="h-9 px-4 flex justify-center items-center border border-gray-200 rounded-full font-bold text-gray-400 cursor-pointer">
                Follow
              </div>
            </div>
            <div class={`${TEXT_PRIMARY} font-bold`}>
              {users[author].fullName}
            </div>
            <div class={`${TEXT_SECONDARY}`}>@{users[author].login}</div>
            <div class={`${TEXT_SECONDARY} my-2`}>{users[author].bio}</div>
            <div class={`flex space-x-3 ${TEXT_SECONDARY}`}>
              <div class="flex">
                Following:
                <div class={`ml-1 font-bold ${TEXT_PRIMARY}`}>
                  {users[author].following}
                </div>
              </div>
              <div class="flex">
                Followers:
                <div class={`ml-1 font-bold ${TEXT_PRIMARY}`}>
                  {users[author].followers}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <a
        href={`/${author}`}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        class={`font-bold ${TEXT_PRIMARY} hover:underline`}
      >
        {users[author].fullName}
      </a>
    </div>
  );
};

export default Author;
