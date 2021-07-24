import {
  createContext,
  createElement as c,
  render,
  useContext,
  useEffect,
  useState,
} from "../../lib";

const root = document.getElementById("root");

const LOADING_TIME = 500;

type Session = {
  token: string | null;
  setToken: (token: string) => void;
};
const SessionContext = createContext<Session>();

const Input = ({ loading, ...props }: any) => {
  return c(
    "div",
    { class: "mt-1 mb-4" },
    c("input", {
      ...props,
      ...(loading ? { disabled: "disabled" } : {}),
      class:
        "p-2 bg-white appearance-none border border-gray-200 rounded w-full text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500",
    })
  );
};

const Label = ({ children, ...props }: any) => {
  return c(
    "label",
    { ...props, class: "text-sm text-gray-700 font-bold" },
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
        "w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
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
      loading
        ? c(
            "div",
            {
              class:
                "w-full h-full flex justify-center items-center absolute inset-0",
            },
            c(Spinner)
          )
        : null,
      c("h1", { class: "text-xl font-bold mb-3 text-gray-700" }, "Sign in"),
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
        { class: "flex justify-center text-sm mt-4 text-gray-400" },
        "Copyright © 2021",
        c(
          "a",
          { href: "https://example.org", class: "text-blue-500 ml-1" },
          "example.org"
        )
      )
    )
  );
};

type PostData = {
  author: string;
  content: string;
  avatarColor: string;
};

const Post = ({ author, content, avatarColor }: PostData) => {
  return c(
    "div",
    { class: "p-4" },
    c(
      "div",
      { class: "flex space-x-3" },
      c("div", { class: `rounded-full ${avatarColor} h-12 w-12` }),
      c(
        "div",
        { class: "flex-1" },
        c("div", { class: "font-bold text-gray-700" }, author),
        c("div", {}, c("div", { class: "text-gray-500" }, content))
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
        c("div", { class: "h-3 bg-gray-200 rounded w-1/4" }),
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
      setData([
        {
          author: "Alice",
          avatarColor: "bg-red-400",
          content: "Setting up my twitter",
        },
        {
          author: "Bob",
          avatarColor: "bg-yellow-500",
          content: "Anyone wants to hang out some time later today?",
        },
        {
          author: "Charlie",
          avatarColor: "bg-yellow-300",
          content: "Twitter profile balloons day it is!",
        },
        {
          author: "Dylan",
          avatarColor: "bg-green-400",
          content:
            "I woke up and had coffee. Can't wait to start eating a breakfast. And then lunch. And then, who knows, maybe I will have a dinner, maybe I will skip eating for the rest of the day, maybe I will prepare food for the morning.",
        },
        {
          author: "Ethan",
          avatarColor: "bg-blue-400",
          content: "Lorem ipsum dolor sit amet",
        },
        {
          author: "Franklin",
          avatarColor: "bg-purple-400",
          content: "I just had a good sandwich",
        },
      ]);
      setLoading(false);
    }, LOADING_TIME * 3);
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
