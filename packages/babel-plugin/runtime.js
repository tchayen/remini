// TODO
// Make sure all steps from https://overreacted.io/my-wishlist-for-hot-reloading/#correctness
// and later paragraphs are covered.
// (for example error recovery is not done for sure).

let pendingUpdates = [];
let isPerformingRefresh = false;

function injectIntoGlobalHook() {
  if (!window.__UPDATE__ || !window.__COMPONENT_TO_NODE__) {
    throw new Error("Cannot use fast refresh. Missing global hooks.");
  }
}

// Also known as $RefreshReg$.
function register(render, id, name, hooks) {
  if (render === null) {
    return;
  }

  render.$id$ = `${id}-${name}`;
  render.$hooks$ = hooks;
  pendingUpdates.push([render.$id$, render, hooks]);
}

function performRefresh() {
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
      if (node.hooks) {
        for (let i = 0; i < node.hooks.length; i++) {
          if (node.hooks[i].type === 0) {
            // 1 means HookType.STATE
            // Reset state.
            if (node.render.$hooks$ !== hooks) {
              node.hooks[i] = undefined;
            }
          } else if (node.hooks[i].type === 1) {
            // 2 means HookType.EFFECT
            const callback = node.hooks[i].cleanup;
            if (typeof callback === "function") {
              callback();
            }
            node.hooks[i] = undefined;
          } else if (node.hooks[i].type === 2) {
            // 3 means HookType.REF
            // createElement(...) structure could be changed. Better regenerate.
            node.hooks[i] = undefined;
          } else if (node.hooks[i].type === 3) {
            // 4 means HookType.CONTEXT
            // Probably no action needed.
          } else if (node.hooks[i].type === 4) {
            // 5 means HookType.MEMO
            // Run memos with deps again.
            node.hooks[i] = undefined;
          }
        }
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
