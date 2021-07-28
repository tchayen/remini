import { renderToString, createElement } from "../../../lib";
import App from "./components/App";

export const render = (url) => {
  return renderToString(createElement(App));
};
