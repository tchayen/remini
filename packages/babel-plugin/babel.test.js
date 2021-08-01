import { transformSync } from "@babel/core";
import babelPlugin from ".";

const transform = (code) => {
  return transformSync(code, {
    babelrc: false,
    configFile: false,
    parserOpts: {
      sourceType: "module",
      allowAwaitOutsideFunction: true,
      plugins: [],
    },
    plugins: [babelPlugin],
    ast: true,
  });
};

const REACT_FR = `
  // <PLUGIN_HEADER>
  if (import.meta.hot) {
    prevRefreshReg = window.$RefreshReg$;
    prevRefreshSig = window.$RefreshSig$;
    window.$RefreshReg$ = (type, id) => {
        RefreshRuntime.register(type, "/Users/tchayen/lab/hmr/src/App.jsx " + id);
    };
    window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
  }
  // </PLUGIN HEADER>
  const _s = $RefreshSig$(); // Only for stateful.

  function App() {
    _s();
    const [count, setCount] = useState(0);
  }

  _s(App, "s0mEHaSh=");
  const _c = App;
  export default App;
  $RefreshReg$(_c, "App");
  // <PLUGIN_FOOTER>
  if (import.meta.hot) {
    window.$RefreshReg$ = prevRefreshReg;
    window.$RefreshSig$ = prevRefreshSig;
    import.meta.hot.accept();

    if (!window.__vite_plugin_react_timeout) {
      window.__vite_plugin_react_timeout = setTimeout(() => {
        window.__vite_plugin_react_timeout = 0;
        RefreshRuntime.performReactRefresh();
      }, 30);
    }
  }
  // </PLUGIN FOOTER>
`;

const singleDefaultStatefulExport = `
export const Button = () => {}

function Counter() {
  const [count, setCount] = useState(0);
}

export default Counter;
`;

const singleDefaultStatefulExportTransformed = `
var _s = $RefreshSig$();

export const Button = () => {}
_c = Button;

function Counter() {
  _s();

  const [count, setCount] = useState(0);
}
_s(Counter, "TODO#1");
_c2 = Counter;

export default Counter;
var _c, _c2;
$RefreshReg$(_c, "Button");
$RefreshReg$(_c2, "Counter");
`;

const multipleConstExports = `
export const Label = () => {}

export const Input = () => {}
`;

const exportDefaultFunction = `
export default function Button() {}
`;

const exportDefaultConst = `
const Button = () => {}

export default Button;
`;

describe("Babel plugin", () => {
  it("singleDefaultExport", () => {
    console.log("-----singleDefaultExport-----");
    const result = transform(singleDefaultStatefulExport);
    console.log(result.code);
    expect(result.code).toBe(singleDefaultStatefulExportTransformed);
  });

  xit("multipleConstExports", () => {
    console.log("-----multipleConstExports-----");
    const result = transform(multipleConstExports);
    console.log(result.code);
  });

  xit("exportDefaultFunction", () => {
    console.log("-----exportDefaultFunction-----");
    const result = transform(exportDefaultFunction);
  });

  xit("exportDefaultConst", () => {
    console.log("-----exportDefaultConst-----");
    const result = transform(exportDefaultConst);
  });
});
