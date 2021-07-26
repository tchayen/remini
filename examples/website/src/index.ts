import "../style.css";
import { createElement as c, render, useEffect, useState } from "../../../lib";
import { getFriendlyTime } from "./date";
import Author from "./Author";
import Avatar from "./Avatar";
import { LOADING_TIME, TEXT_SECONDARY } from "./constants";
import { posts, PostType, users } from "./data";
import LoginForm from "./LoginForm";
import { SessionContext } from "./SessionContext";
import AutoScale from "./ui/AutoScale";

const root = document.getElementById("root");

const Post = ({ author, content, timestamp }: PostType) => {
  const time = getFriendlyTime(new Date(timestamp * 1000));
  return c(
    "div",
    { class: "p-4" },
    c(
      "div",
      { class: "flex space-x-3" },
      c(Avatar, { author }),
      c(
        "div",
        { class: "flex-1" },
        c(
          "div",
          { class: "flex" },
          c(Author, { author }),
          c(
            "div",
            { class: `ml-1 ${TEXT_SECONDARY}` },
            `@${users[author].login} · ${time}`
          )
        ),
        c("div", {}, c("div", { class: `${TEXT_SECONDARY}` }, content))
      )
    )
  );
};

const PlaceholderPost = () => {
  return c(
    "div",
    { class: "p-4" },
    c(
      "div",
      { class: "flex space-x-3" },
      c("div", { class: "rounded-full bg-gray-200 h-12 w-12" }),
      c(
        "div",
        { class: "flex-1 space-y-3 py-1" },
        c(
          "div",
          { class: "flex space-x-1" },
          c("div", { class: "h-3 bg-gray-200 rounded w-1/5" }),
          c("div", { class: "h-3 bg-gray-200 rounded w-1/6" })
        ),
        c(
          "div",
          { class: "space-y-2" },
          c("div", { class: "h-3 bg-gray-200 rounded w-3/4" })
        )
      )
    )
  );
};

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PostType[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setData(posts);
      setLoading(false);
    }, LOADING_TIME);
  }, []);

  return c(
    "div",
    { class: "mx-auto border-l border-r", style: { width: "600px" } },
    c(
      "div",
      { class: "border-b border-gray-200 p-4 flex" },
      c("div", { class: "rounded-full bg-gray-400 h-12 w-12" }),
      c(AutoScale, {
        class: "flex flex-1 text-xl ml-3 focus:outline-none",
        placeholder: "What's happening?",
      })
    ),
    loading
      ? c(
          "div",
          { class: "divide-y" },
          c(PlaceholderPost),
          c(PlaceholderPost),
          c(PlaceholderPost),
          c(PlaceholderPost)
        )
      : c(
          "div",
          { class: "divide-y" },
          data.map((post) => c(Post, post))
        )
  );
};

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  return c(
    SessionContext.Provider,
    { value: { token, setToken } },
    c(
      "div",
      { class: "w-screen h-screen flex justify-center" },
      token ? c(Page) : c(LoginForm)
    )
  );
};

const tree = c(App);

render(tree, root);
