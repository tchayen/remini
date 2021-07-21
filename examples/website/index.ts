import { createContext, createElement as c, render, useState } from "../../lib";

const root = document.getElementById("root");

type Session = { token: string } | null;
const SessionContext = createContext(null);

// <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
// <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
// <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>

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
      class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
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
    console.log("halo", login, password);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  console.log(loading);

  return c(
    "form",
    { onSubmit, class: "p-6 bg-black rounded w-96" },
    c(Spinner),
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
  );
};

const App = () => {
  const [session, setSession] = useState<Session>(null);

  return c(
    SessionContext.Provider,
    { value: session },
    c(
      "div",
      { class: "w-screen h-screen flex justify-center p-10 bg-gray-100" },
      c("div", {}, c(LoginForm))
    )
  );
};

const tree = c(App);

render(tree, root!);
