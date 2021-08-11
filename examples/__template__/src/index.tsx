import { createElement as c, render } from "../../../packages/remini/lib";

const App = () => {
  return <div>123</div>;
};

const root = document.getElementById("root");

if (!root) {
  throw new Error('<div id="root"></div> element not found in index.html.');
}

render(<App />, root);
