import { renderToString, createElement } from "../../../packages/remini/lib";
import App from "./components/App";

export const render = (url) => {
  return renderToString(createElement(App));
};
