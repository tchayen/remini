import {
  createElement as c,
  RElement,
  useContext,
  useState,
} from "../../../../lib";
import Button from "../ui/Button";
import { LOADING_TIME, TEXT_PRIMARY, TEXT_SECONDARY } from "../constants";
import Input from "../ui/Input";
import Label from "../ui/Label";
import { SessionContext } from "./SessionContext";
import Spinner from "../ui/Spinner";

const LoginForm = (): RElement => {
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

export default LoginForm;
