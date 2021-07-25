import {
  createContext,
  createElement as c,
  render,
  useContext,
  useEffect,
  useState,
} from "../../lib";
import { getFriendlyTime } from "./date";

const root = document.getElementById("root");

const LOADING_TIME = 300;

type Session = {
  token: string | null;
  setToken: (token: string) => void;
};

const SessionContext = createContext<Session>();

type User = {
  fullName: string;
  login: string;
  avatar: string;
  following: number;
  followers: number;
  bio: string;
};

type Post = {
  author: number;
  content: string;
  timestamp: number;
};

const TEXT_PRIMARY = "text-gray-700";
const TEXT_SECONDARY = "text-gray-500";

const users: User[] = [
  {
    fullName: "Alice",
    login: "alice",
    avatar: "bg-red-400",
    following: 10,
    followers: 456,
    bio: "React Native developer at some company. I like trains.",
  },
  {
    fullName: "Bob",
    login: "bob",
    avatar: "bg-yellow-500",
    following: 10,
    followers: 456,
    bio: "React Native developer at some company. I like trains.",
  },
  {
    fullName: "Charlie",
    login: "charlie",
    avatar: "bg-yellow-300",
    following: 10,
    followers: 456,
    bio: "React Native developer at some company. I like trains.",
  },
  {
    fullName: "Dylan",
    login: "dylan",
    avatar: "bg-green-400",
    following: 10,
    followers: 456,
    bio: "React Native developer at some company. I like trains.",
  },
  {
    fullName: "Ethan",
    login: "ethan",
    avatar: "bg-blue-400",
    following: 10,
    followers: 456,
    bio: "React Native developer at some company. I like trains.",
  },
  {
    fullName: "Franklin",
    login: "franklin",
    avatar: "bg-purple-400",
    following: 10,
    followers: 456,
    bio: "React Native developer at some company. I like trains.",
  },
];

const posts: Post[] = [
  {
    author: 0,
    content: "Setting up my twitter",
    timestamp: 1627207002,
  },
  {
    author: 1,
    content: "Anyone wants to hang out some time later today?",
    timestamp: 1627210082,
  },
  {
    author: 2,
    content: "Twitter profile balloons day it is!",
    timestamp: 1627202300,
  },
  {
    author: 3,
    content:
      "I woke up and had coffee. Can't wait to start eating a breakfast. And then lunch. And then, who knows, maybe I will have a dinner, maybe I will skip eating for the rest of the day, maybe I will prepare food for the morning.",
    timestamp: 1627201733,
  },
  {
    author: 4,
    content: "Lorem ipsum dolor sit amet",
    timestamp: 1627202798,
  },
  {
    author: 5,
    content: "I just had a good sandwich",
    timestamp: 1627214404,
  },
];

const Avatar = ({ author }: { author: number }) => {
  return c("div", { class: `rounded-full ${users[author].avatar} h-12 w-12` });
};

const Input = ({ loading, ...props }: any) => {
  return c(
    "div",
    { class: "mt-1 mb-4" },
    c("input", {
      ...props,
      ...(loading ? { disabled: "disabled" } : {}),
      class: `p-2 bg-white appearance-none border border-gray-200 rounded w-full ${TEXT_PRIMARY} leading-tight focus:outline-none focus:ring focus:border-blue-500`,
    })
  );
};

const Label = ({ children, ...props }: any) => {
  return c(
    "label",
    { ...props, class: `text-sm ${TEXT_PRIMARY} font-bold` },
    children
  );
};

const Button = ({ children, loading, ...props }: any) => {
  return c(
    "button",
    {
      ...props,
      type: "submit",
      ...(loading ? { disabled: "disabled" } : {}),
      class:
        "w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-blue-700",
    },
    children
  );
};

const Spinner = () => {
  return c(
    "svg",
    {
      class: "animate-spin -ml-1 h-6 w-6 text-black",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
    },
    c("circle", {
      class: "opacity-25",
      cx: "12",
      cy: "12",
      r: "10",
      stroke: "currentColor",
      strokeWidth: "4",
    }),
    c("path", {
      class: "opacity-75",
      fill: "currentColor",
      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
    })
  );
};

const LoginForm = () => {
  const session = useContext(SessionContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onEmail = (event: any) => {
    setEmail(event.target.value);
  };

  const onPassword = (event: any) => {
    setPassword(event.target.value);
  };

  const onSubmit = (event: any) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      session.setToken("1234");
    }, LOADING_TIME);
  };

  return c(
    "div",
    {},
    c(
      "form",
      {
        onSubmit,
        class: `w-96 relative mt-10 ${loading ? "opacity-60" : ""}`,
      },
      c("h1", { class: `text-xl font-bold mb-3 ${TEXT_PRIMARY}` }, "Sign in"),
      c(Label, { for: "email" }, "Email"),
      c(Input, {
        email,
        onInput: onEmail,
        id: "email",
        type: "email",
        loading,
        placeholder: "test@example.org",
      }),
      c(Label, { for: "password" }, "Password"),
      c(Input, {
        password,
        onInput: onPassword,
        id: "password",
        type: "password",
        loading,
        placeholder: "********",
      }),
      c(Button, { loading }, "Sign in"),
      c(
        "div",
        { class: `flex justify-center text-sm mt-4 ${TEXT_SECONDARY}` },
        "Copyright © 2021",
        c(
          "a",
          { href: "https://example.org", class: "text-blue-500 ml-1" },
          "example.org"
        )
      ),
      loading
        ? c(
            "div",
            {
              class:
                "w-full h-full flex justify-center items-center absolute inset-0",
            },
            c(Spinner)
          )
        : null
    )
  );
};

const Author = ({ author }: { author: number }) => {
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

type PostData = {
  author: number;
  content: string;
  timestamp: number;
};

const Post = ({ author, content, timestamp }: PostData) => {
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
  const [data, setData] = useState<PostData[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setData(posts);
      setLoading(false);
    }, LOADING_TIME);
  }, []);

  return c(
    "div",
    { class: "mx-auto border-l border-r", style: { width: "600px" } },
    loading
      ? c(
          "div",
          { class: "divide-y" },
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

render(tree, root!);
