// TODO
// Follow preact's approach - replaceComponent(oldType, newType) and then
// rerender nodes similar way as now, but preserving hooks array.

let pendingUpdates = [];
let isPerformingRefresh = false;

function injectIntoGlobalHook() {
  console.log("injectIntoGlobalHook()");

  if (!window.__UPDATE__ || !window.__COMPONENT_TO_NODE__) {
    throw new Error("Cannot use fast refresh. Missing global hooks.");
  }
}

// Also known as $RefreshReg$.
function register(render) {
  console.log("register()");

  if (render === null) {
    return;
  }

  pendingUpdates.push([render.$id$, render]);
}

// Also known as $RefreshSig$.
function createSignatureFunctionForTransform() {
  console.log("createSignatureFunctionForTransform()");

  return function (type, key) {
    if (typeof key === "string") {
      // In the _s("App", "123") call
    } else {
      // In the _s call.
    }
  };
}

function performReactRefresh() {
  console.log("performReactRefresh()");

  if (pendingUpdates.length === 0) {
    return;
  }

  if (isPerformingRefresh) {
    return;
  }

  isPerformingRefresh = true;
  // TODO destructure [id, render]

  pendingUpdates.forEach(([id, render]) => {
    const nodes = __COMPONENT_TO_NODE__.get(id);

    if (!nodes) {
      return;
    }

    console.log({ nodes });

    nodes.forEach((node) => {
      console.log(2, node);
      node.render = render;
      window.__UPDATE__(node, null);
    });
  });
  pendingUpdates = [];
  isPerformingRefresh = false;
}

export default {
  injectIntoGlobalHook,
  register,
  createSignatureFunctionForTransform,
  performReactRefresh,
};
