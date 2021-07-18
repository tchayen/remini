import {
  createElement as c,
  RElement,
  render,
  useEffect,
  useState,
} from "./lib";

const root = document.getElementById("root");

type HNData = number[];

type HNItem = {
  id: number;
  by: string;
  time: number;
  title: string;
  url: string;
};

type HNUser = {
  id: string;
  karma: number;
  created: number;
};

const Modal = ({ username }: { username: string }) => {
  const [user, setUser] = useState<HNUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/user/${username}.json`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return c("div", { class: "text-sm text-gray-400" }, "Loading...");
  } else if (error) {
    return c("span", {}, `Error: ${error.message}`);
  } else if (user) {
    return c(
      "div",
      { class: "text-sm" },
      c("div", { class: "italic" }, user.id),
      c(
        "div",
        { class: "flex flex-row" },
        c("div", { class: "mr-1" }, "Karma:"),
        c("div", { class: "font-bold" }, `${user.karma}`)
      ),
      c(
        "div",
        { class: "flex flex-row" },
        c("div", { class: "mr-1" }, "Since:"),
        c("div", {}, `${new Date(user.created * 1000).toLocaleDateString()}`)
      )
    );
  } else {
    return null;
  }
};

const Author = ({ username }: { username: string }) => {
  const [show, setShow] = useState(false);

  const onMouseOver = () => {
    setShow(true);
  };

  const onMouseOut = () => {
    setShow(false);
  };

  return c(
    "div",
    { class: "mr-2", style: "position: relative" },
    show
      ? c(
          "div",
          {
            class: "bg-white p-2 shadow-xl rounded",
            style: "position: absolute",
          },
          c(Modal, { username })
        )
      : null,
    c("div", { class: "text-sm font-bold", onMouseOver, onMouseOut }, username)
  );
};

const HackerNews = () => {
  const [items, setItems] = useState<HNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
      .then((response) => response.json())
      .then((data) => {
        Promise.all(
          (data as HNData)
            .filter((_, index) => index < 10)
            .map((item) => {
              return fetch(
                `https://hacker-news.firebaseio.com/v0/item/${item}.json`
              ).then((response) => response.json());
            })
        ).then((items) => {
          setItems(items);
          setLoading(false);
        });
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return c(
      "div",
      { class: "p-10 text-xl text-gray-400 italic" },
      "Loading..."
    );
  }

  if (error) {
    return c("span", {}, `Error: ${error.message}`);
  }

  return c(
    "div",
    { class: "p-12" },
    items.map((item) =>
      c(
        "div",
        { class: "bg-green-100 p-3 rounded mb-4 flex flex-col" },
        c(
          "div",
          { class: "flex flex-row" },
          c(Author, { username: item.by }),
          c(
            "div",
            { class: "text-sm" },
            new Date(item.time * 1000).toLocaleString()
          )
        ),
        c("div", {}, item.title),
        c(
          "div",
          { class: "text-sm text-green-700 flex flex-row" },
          c("a", { href: item.url, class: "mr-2" }, "LINK"),
          c(
            "a",
            { href: `https://news.ycombinator.com/item?id=${item.id}` },
            "POST"
          )
        )
      )
    )
  );
};

const tree = c(HackerNews);

render(tree, root!);
