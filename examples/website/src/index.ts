import "../style.css";
import { createElement as c, render } from "../../../lib";
import App from "./App";

const root = document.getElementById("root");
const tree = c(App);
render(tree, root);
