let pendingUpdates = [];
let isPerformingRefresh = false;

function injectIntoGlobalHook() {
  console.log("injectIntoGlobalHook()");

  if (!window.__UPDATE__ || !window.__COMPONENT_TO_NODE__) {
    throw new Error("Cannot use fast refresh. Missing global hooks.");
  }
}

// Also known as $RefreshReg$.
function register(render, id, name, hooks) {
  console.log("register()");

  if (render === null) {
    return;
  }

  render.$id$ = `${id}-${name}`;
  render.$hooks$ = hooks;
  pendingUpdates.push([render.$id$, render, hooks]);
}

function performRefresh() {
  console.log("performRefresh()");

  if (pendingUpdates.length === 0) {
    return;
  }

  if (isPerformingRefresh) {
    return;
  }

  isPerformingRefresh = true;
  pendingUpdates.forEach(([id, render, hooks]) => {
    const nodes = __COMPONENT_TO_NODE__.get(id);

    if (!nodes) {
      return;
    }

    nodes.forEach((node) => {
      if (node.render.$hooks$ !== hooks) {
        console.log(id, "old: ", node.render.$hooks$, "new: ", hooks);
        // TODO: replace hooks.
      }

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
  performRefresh,
};
