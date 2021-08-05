import { createElement as c, useState } from "../../packages/remini/lib";

const A = () => {
  const [counter, setCounter] = useState(0);
  const onClick = () => setCounter(counter + 1);

  return c("div", {}, c("button", { onClick }, `Clicked ${counter} times!`));
};

export default A;
