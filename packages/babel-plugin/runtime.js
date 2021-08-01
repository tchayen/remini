console.log("Runtime");

export default {
  injectIntoGlobalHook() {
    console.log("injectIntoGlobalHook");
  },
  register(type, id) {
    console.log("register");
  },
  createSignatureFunctionForTransform() {
    console.log("createSignatureFunctionForTransform");
  },
  performReactRefresh() {
    console.log("performReactRefresh");
  },
};
