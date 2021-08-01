import { createElement as c, render } from "../../packages/remini/lib";
import App from "./App";

const root = document.getElementById("root");
const tree = c(App);

render(tree, root);
