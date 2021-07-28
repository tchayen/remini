import { createElement as c, RElement, useState } from "../../../../lib";
import Avatar from "./Avatar";
import { TEXT_PRIMARY, TEXT_SECONDARY } from "../constants";
import { users } from "../data";

const Author = ({ author }: { author: number }): RElement => {
  const [show, setShow] = useState(false);

  const onMouseOver = () => {
    setShow(true);
  };

  const onMouseOut = () => {
    setShow(false);
  };

  return c(
    "div",
    { class: "relative" },
    show
      ? c(
          "div",
          {
            class:
              "absolute top-6 bg-white p-4 rounded border border-gray-200 shadow-lg z-10",
          },
          c(
            "div",
            {},
            c(
              "div",
              { class: "flex justify-between" },
              c(Avatar, { author }),
              c(
                "div",
                {
                  class:
                    "h-9 px-4 flex justify-center items-center border border-gray-200 rounded-full font-bold text-gray-400 cursor-pointer",
                },
                "Follow"
              )
            ),
            c(
              "div",
              { class: `${TEXT_PRIMARY} font-bold` },
              users[author].fullName
            ),
            c("div", { class: `${TEXT_SECONDARY}` }, `@${users[author].login}`),
            c("div", { class: `${TEXT_SECONDARY} my-2` }, users[author].bio),
            c(
              "div",
              { class: `flex space-x-3 ${TEXT_SECONDARY}` },
              c(
                "div",
                { class: "flex" },
                `Following:`,
                c(
                  "div",
                  { class: `ml-1 font-bold ${TEXT_PRIMARY}` },
                  `${users[author].following}`
                )
              ),
              c(
                "div",
                { class: "flex" },
                `Followers:`,
                c(
                  "div",
                  { class: `ml-1 font-bold ${TEXT_PRIMARY}` },
                  `${users[author].followers}`
                )
              )
            )
          )
        )
      : null,
    c(
      "a",
      {
        class: `font-bold ${TEXT_PRIMARY} hover:underline`,
        href: `/${author}`,
        onMouseOver,
        onMouseOut,
      },
      users[author].fullName
    )
  );
};

export default Author;
