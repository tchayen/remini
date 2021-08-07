import {
  createElement as c,
  RElement,
  useContext,
  useState,
} from "../../../../packages/remini/lib";
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

  return (
    <div>
      <form
        onSubmit={onSubmit}
        class={`w-96 relative mt-10 ${loading ? "opacity-60" : ""}`}
      >
        <h1 class={`text-xl font-bold mb-3 ${TEXT_PRIMARY}`}>Sign in</h1>
        <Label for="email">Email</Label>
        <Input
          email={email}
          onInput={onEmail}
          id="email"
          type="email"
          loading={loading}
          placeholder="test@example.org"
        />
        <Label for="password">Password</Label>
        <Input
          email={password}
          onInput={onPassword}
          id="password"
          type="password"
          loading={loading}
          placeholder="********"
        />
        <Button loading={loading}>Sign in</Button>
        <div class={`flex justify-center text-sm mt-4 ${TEXT_SECONDARY}`}>
          Copyright © 2021
          <a href="https://example.org" class="text-blue-500 ml-1">
            example.org
          </a>
        </div>
        {loading ? (
          <div class="w-full h-full flex justify-center items-center absolute inset-0">
            <Spinner />
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default LoginForm;
