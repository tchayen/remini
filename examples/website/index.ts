import {
  createContext,
  createElement as c,
  render,
  useContext,
  useEffect,
  useState,
} from "../../lib";

const root = document.getElementById("root");

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
        "p-2 bg-gray-100 appearance-none border-2 border-gray-100 rounded w-full text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500",
    })
  );
};

const Label = ({ children, ...props }: any) => {
  return c(
    "label",
    { ...props, class: "text-sm text-gray-600 font-bold" },
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
        "w-full py-2 px-4 bg-purple-500 hover:bg-purple-700 text-white font-bold rounded focus:outline-none focus:shadow-outline",
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
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = (event: any) => {
    setLogin(event.target.value);
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
    }, 500);
  };

  return c(
    "div",
    {},
    c(
      "form",
      {
        onSubmit,
        class: `p-6 bg-white rounded w-96 relative ${
          loading ? "opacity-60" : ""
        }`,
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
      c(Label, { for: "login" }, "Login"),
      c(Input, {
        login,
        onInput: onLogin,
        id: "login",
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
      c(Button, { loading }, "Sign in")
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
    { class: "border border-gray-200 rounded-md p-4 mb-4" },
    c(
      "div",
      { class: "flex space-x-3" },
      c("div", { class: `rounded-full ${avatarColor} h-12 w-12` }),
      c(
        "div",
        { class: "flex-1 py-1" },
        c("div", { class: "font-bold text-gray-700" }, author),
        c("div", { class: "" }, c("div", { class: "text-gray-500" }, content))
      )
    )
  );
};

const PlaceholderPost = () => {
  return c(
    "div",
    { class: "border border-gray-200 rounded-md p-4 mb-4" },
    c(
      "div",
      { class: "animate-pulse flex space-x-3" },
      c("div", { class: "rounded-full bg-gray-200 h-12 w-12" }),
      c(
        "div",
        { class: "flex-1 space-y-3 py-1" },
        c("div", { class: "h-4 bg-gray-200 rounded w-3/4" }),
        c(
          "div",
          { class: "space-y-2" },
          c("div", { class: "h-4 bg-gray-200 rounded" }),
          c("div", { class: "h-4 bg-gray-200 rounded w-5/6" })
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
          author: "tchayen",
          avatarColor: "bg-blue-400",
          content: "123",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return c(
    "div",
    { class: "max-w-sm w-full mx-auto" },
    loading
      ? c("div", {}, c(PlaceholderPost), c(PlaceholderPost), c(PlaceholderPost))
      : c(
          "div",
          {},
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
      { class: "w-screen h-screen flex justify-center p-10 bg-gray-100" },
      token ? c(Page) : c(LoginForm)
    )
  );
};

const tree = c(App);

render(tree, root!);
