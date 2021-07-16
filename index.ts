import { createElement as c, render, useEffect, useState } from "./lib";

const root = document.getElementById("root");

// const Counter = () => {
//   const [value, setValue] = useState(0);

//   const onClick = () => {
//     setValue(value + 1);
//   };

//   return c("div", { class: "p-10 bg-green-100 h-screen" }, [
//     c("div", { class: "mb-4 text-2xl" }, `${value}`),
//     c(
//       "button",
//       {
//         onClick,
//         class:
//           "bg-green-500 hover:bg-green-600 py-2 px-4 rounded-xl text-white font-medium",
//       },
//       "Counter++"
//     ),
//   ]);
// };

// const tree = c("div", {}, [c(Counter, {}, [])]);

type HNData = number[];
type HNItem = {
  by: string;
  time: number;
  title: string;
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
    return c("div", { class: "p-10 text-3xl" }, "Loading...");
  }

  if (error) {
    return c("span", {}, `Error: ${error.message}`);
  }

  return c(
    "div",
    { class: "p-4" },
    items.map((item) =>
      c("div", { class: "bg-green-100 p-2 rounded mb-4" }, [
        c("div", { class: "flex flex-row" }, [
          c("div", { class: "text-sm mr-2 font-bold" }, item.by),
          c("div", { class: "text-sm" }, new Date(item.time).toLocaleString()),
        ]),
        c("div", {}, item.title),
      ])
    )
  );
};

const tree = c("div", {}, [c(HackerNews, {}, [])]);

render(tree, root!);
