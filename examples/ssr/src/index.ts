import { createElement as c, renderToString } from "../../../lib";
import App from "../../website/src/components/App";

const PORT = 4000;

import Koa from "koa";
const app = new Koa();

app.use(async (ctx) => {
  const html = renderToString(c(App));
  console.log(html);

  ctx.body = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link
      rel="icon"
      href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      @import url("https://rsms.me/inter/inter.css");
      html {
        font-family: "Inter";
      }
      @supports (font-variation-settings: normal) {
        html {
          font-family: "Inter var";
        }
      }
    </style>
  </head>
  <body>
    ${html}
    <script type="module" src="http://localhost:3000/src/index.ts"></script>
  </body>
</html>
`;
});

app.listen(PORT, () => {
  console.log("app started at port 4000");
});
