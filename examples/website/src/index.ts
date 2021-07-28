import "../style.css";
import { createElement as c, hydrate } from "../../../lib";
import App from "./components/App";

const root = document.getElementById("root");
const tree = c(App);

if (root === null) {
  throw new Error("Root <div> not found");
}

hydrate(tree, root);
