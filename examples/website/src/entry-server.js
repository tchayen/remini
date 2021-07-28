import { renderToString, createElement } from "../../../lib";
import App from "./components/App";

export const render = (url) => {
  const html = renderToString(createElement(App));
  console.log({ html });
  return html;
};
