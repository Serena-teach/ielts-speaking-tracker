var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl, createStore;
var init_vanilla = __esm({
  "node_modules/zustand/esm/vanilla.mjs"() {
    createStoreImpl = (createState) => {
      let state;
      const listeners = /* @__PURE__ */ new Set();
      const setState = (partial, replace) => {
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
          const previousState = state;
          state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
          listeners.forEach((listener) => listener(state, previousState));
        }
      };
      const getState = () => state;
      const getInitialState = () => initialState;
      const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      };
      const destroy = () => {
        if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production") {
          console.warn(
            "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
          );
        }
        listeners.clear();
      };
      const api = { setState, getState, getInitialState, subscribe, destroy };
      const initialState = state = createState(setState, getState, api);
      return api;
    };
    createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
  }
});

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports) {
    "use strict";
    var l = /* @__PURE__ */ Symbol.for("react.element");
    var n = /* @__PURE__ */ Symbol.for("react.portal");
    var p = /* @__PURE__ */ Symbol.for("react.fragment");
    var q = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var r = /* @__PURE__ */ Symbol.for("react.profiler");
    var t = /* @__PURE__ */ Symbol.for("react.provider");
    var u = /* @__PURE__ */ Symbol.for("react.context");
    var v = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var w = /* @__PURE__ */ Symbol.for("react.suspense");
    var x = /* @__PURE__ */ Symbol.for("react.memo");
    var y = /* @__PURE__ */ Symbol.for("react.lazy");
    var z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a) return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C = Object.assign;
    var D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h = false;
      if (null === a) h = true;
      else switch (k) {
        case "string":
        case "number":
          h = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h = true;
          }
      }
      if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h += R(k, b, e, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status) return a._result.default;
      throw a._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    exports.Component = E;
    exports.Fragment = p;
    exports.Profiler = r;
    exports.PureComponent = G;
    exports.StrictMode = q;
    exports.Suspense = w;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports.act = X;
    exports.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
    };
    exports.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    exports.createElement = M;
    exports.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    exports.isValidElement = O;
    exports.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
    };
    exports.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    exports.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports.unstable_act = X;
    exports.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports.useId = function() {
      return U.current.useId();
    };
    exports.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports.useState = function(a) {
      return U.current.useState(a);
    };
    exports.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports.useTransition = function() {
      return U.current.useTransition();
    };
    exports.version = "18.3.1";
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_production_min();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
var require_use_sync_external_store_shim_production = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js"(exports) {
    "use strict";
    var React = require_react();
    function is(x, y) {
      return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is;
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useLayoutEffect = React.useLayoutEffect;
    var useDebugValue2 = React.useDebugValue;
    function useSyncExternalStore$2(subscribe, getSnapshot) {
      var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
      useLayoutEffect(
        function() {
          inst.value = value;
          inst.getSnapshot = getSnapshot;
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        },
        [subscribe, value, getSnapshot]
      );
      useEffect(
        function() {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          return subscribe(function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          });
        },
        [subscribe]
      );
      useDebugValue2(value);
      return value;
    }
    function checkIfSnapshotChanged(inst) {
      var latestGetSnapshot = inst.getSnapshot;
      inst = inst.value;
      try {
        var nextValue = latestGetSnapshot();
        return !objectIs(inst, nextValue);
      } catch (error) {
        return true;
      }
    }
    function useSyncExternalStore$1(subscribe, getSnapshot) {
      return getSnapshot();
    }
    var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
    exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
  }
});

// node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_use_sync_external_store_shim_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js
var require_with_selector_production = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js"(exports) {
    "use strict";
    var React = require_react();
    var shim = require_shim();
    function is(x, y) {
      return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    var objectIs = "function" === typeof Object.is ? Object.is : is;
    var useSyncExternalStore = shim.useSyncExternalStore;
    var useRef = React.useRef;
    var useEffect = React.useEffect;
    var useMemo = React.useMemo;
    var useDebugValue2 = React.useDebugValue;
    exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
      var instRef = useRef(null);
      if (null === instRef.current) {
        var inst = { hasValue: false, value: null };
        instRef.current = inst;
      } else inst = instRef.current;
      instRef = useMemo(
        function() {
          function memoizedSelector(nextSnapshot) {
            if (!hasMemo) {
              hasMemo = true;
              memoizedSnapshot = nextSnapshot;
              nextSnapshot = selector(nextSnapshot);
              if (void 0 !== isEqual && inst.hasValue) {
                var currentSelection = inst.value;
                if (isEqual(currentSelection, nextSnapshot))
                  return memoizedSelection = currentSelection;
              }
              return memoizedSelection = nextSnapshot;
            }
            currentSelection = memoizedSelection;
            if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
            var nextSelection = selector(nextSnapshot);
            if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
              return memoizedSnapshot = nextSnapshot, currentSelection;
            memoizedSnapshot = nextSnapshot;
            return memoizedSelection = nextSelection;
          }
          var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
          return [
            function() {
              return memoizedSelector(getSnapshot());
            },
            null === maybeGetServerSnapshot ? void 0 : function() {
              return memoizedSelector(maybeGetServerSnapshot());
            }
          ];
        },
        [getSnapshot, getServerSnapshot, selector, isEqual]
      );
      var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
      useEffect(
        function() {
          inst.hasValue = true;
          inst.value = value;
        },
        [value]
      );
      useDebugValue2(value);
      return value;
    };
  }
});

// node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = __commonJS({
  "node_modules/use-sync-external-store/shim/with-selector.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_with_selector_production();
    } else {
      module.exports = null;
    }
  }
});

// node_modules/zustand/esm/index.mjs
function useStore(api, selector = identity, equalityFn) {
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
var import_react, import_with_selector, useDebugValue, useSyncExternalStoreWithSelector, didWarnAboutEqualityFn, identity, createImpl, create;
var init_esm = __esm({
  "node_modules/zustand/esm/index.mjs"() {
    init_vanilla();
    init_vanilla();
    import_react = __toESM(require_react(), 1);
    import_with_selector = __toESM(require_with_selector(), 1);
    ({ useDebugValue } = import_react.default);
    ({ useSyncExternalStoreWithSelector } = import_with_selector.default);
    didWarnAboutEqualityFn = false;
    identity = (arg) => arg;
    createImpl = (createState) => {
      if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && typeof createState !== "function") {
        console.warn(
          "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
        );
      }
      const api = typeof createState === "function" ? createStore(createState) : createState;
      const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
      Object.assign(useBoundStore, api);
      return useBoundStore;
    };
    create = (createState) => createState ? createImpl(createState) : createImpl;
  }
});

// src/lib/storage.ts
function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] \u8BFB\u53D6 ${key} \u5931\u8D25\uFF0C\u5DF2\u5FFD\u7565`, error);
    return null;
  }
}
function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] \u5199\u5165 ${key} \u5931\u8D25`, error);
  }
}
function readRecords() {
  return readJson(STORAGE_KEYS.records) ?? {};
}
function writeRecords(records) {
  writeJson(STORAGE_KEYS.records, records);
}
function readCustomQuestions() {
  const value = readJson(STORAGE_KEYS.custom);
  return Array.isArray(value) ? value : [];
}
function writeCustomQuestions(questions) {
  writeJson(STORAGE_KEYS.custom, questions);
}
function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[storage] \u5220\u9664 ${key} \u5931\u8D25`, error);
    }
  });
}
function storageUsageBytes() {
  return Object.values(STORAGE_KEYS).reduce((total, key) => {
    const raw = window.localStorage.getItem(key) ?? "";
    return total + raw.length * 2;
  }, 0);
}
var STORAGE_KEYS;
var init_storage = __esm({
  "src/lib/storage.ts"() {
    STORAGE_KEYS = {
      records: "ielts-speaking-tracker:records:v1",
      custom: "ielts-speaking-tracker:custom-questions:v1"
    };
  }
});

// src/store/useQuestionStore.ts
var useQuestionStore_exports = {};
__export(useQuestionStore_exports, {
  useQuestionStore: () => useQuestionStore
});
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function asString(value) {
  return typeof value === "string" ? value : "";
}
function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string").map((item) => item);
}
function normalizeQuestion(raw, index) {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title).trim();
  const titleZh = asString(raw.titleZh).trim();
  if (!title && !titleZh) return null;
  const rawId = asString(raw.id).trim();
  const id = rawId || `imported-${index + 1}`;
  const region = REGIONS.includes(raw.region) ? raw.region : "mainland";
  const category = CATEGORIES.includes(raw.category) ? raw.category : "new";
  const part = asString(raw.part).toLowerCase().includes("1") ? "Part 1" : "Part 2&3";
  const status = STATUSES.includes(raw.status) ? raw.status : "not-practiced";
  const practiceCount = typeof raw.practiceCount === "number" && Number.isFinite(raw.practiceCount) && raw.practiceCount > 0 ? Math.floor(raw.practiceCount) : 0;
  const lastPracticeDate = asString(raw.lastPracticeDate).trim();
  return {
    id,
    region,
    category,
    part,
    title: title || titleZh,
    titleZh: titleZh || void 0,
    questions: asStringArray(raw.questions),
    ninePointAnswer: asString(raw.ninePointAnswer),
    advancedWords: asStringArray(raw.advancedWords),
    improvementIssues: asString(raw.improvementIssues),
    myThoughts: asString(raw.myThoughts),
    status,
    practiceCount,
    lastPracticeDate: lastPracticeDate || void 0
  };
}
function questionKey(question) {
  const title = (question.title || question.titleZh || "").trim().toLowerCase().replace(/\s+/g, " ");
  const part = question.part.replace(/\s+/g, "").toLowerCase();
  return [question.region, question.category, part, title].join("|");
}
function extractQuestionList(raw) {
  if (Array.isArray(raw)) return raw;
  if (isRecord(raw) && Array.isArray(raw.questions)) return raw.questions;
  return [];
}
function extractRecordMap(raw) {
  if (isRecord(raw) && isRecord(raw.records)) {
    return raw.records;
  }
  return null;
}
function recordFromQuestion(question, updatedAt) {
  return {
    title: question.title,
    titleZh: question.titleZh,
    questions: question.questions,
    ninePointAnswer: question.ninePointAnswer,
    advancedWords: question.advancedWords,
    improvementIssues: question.improvementIssues,
    myThoughts: question.myThoughts,
    status: question.status,
    practiceCount: question.practiceCount,
    lastPracticeDate: question.lastPracticeDate,
    updatedAt
  };
}
function recordFromImport(question, updatedAt) {
  const record = recordFromQuestion(question, updatedAt);
  Object.keys(record).forEach((field) => {
    const value = record[field];
    const isEmpty = value === "" || Array.isArray(value) && value.length === 0 || field === "practiceCount" && value === 0 || field === "status" && value === "not-practiced";
    if (isEmpty) delete record[field];
  });
  return record;
}
function recordToPatch(record) {
  const patch = {};
  RECORD_FIELDS.forEach((field) => {
    const value = record[field];
    if (value !== void 0) patch[field] = value;
  });
  return patch;
}
function mergeQuestions(base, custom, records) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (question) => {
    if (seen.has(question.id)) return;
    seen.add(question.id);
    const record = records[question.id];
    merged.push(record ? { ...question, ...recordToPatch(record) } : question);
  };
  base.forEach(push);
  custom.forEach(push);
  return merged;
}
var REGIONS, CATEGORIES, STATUSES, RECORD_FIELDS, useQuestionStore;
var init_useQuestionStore = __esm({
  "src/store/useQuestionStore.ts"() {
    init_esm();
    init_storage();
    REGIONS = ["mainland", "non-mainland"];
    CATEGORIES = ["new", "retained", "classic"];
    STATUSES = ["not-practiced", "practiced", "familiar"];
    RECORD_FIELDS = [
      "title",
      "titleZh",
      "questions",
      "ninePointAnswer",
      "advancedWords",
      "improvementIssues",
      "myThoughts",
      "status",
      "practiceCount",
      "lastPracticeDate"
    ];
    useQuestionStore = create((set, get) => {
      const commit = (state, id, patch) => {
        const record = {
          ...state.records[id] ?? {},
          ...patch,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const records = { ...state.records, [id]: record };
        writeRecords(records);
        return {
          records,
          questions: mergeQuestions(state.baseQuestions, state.customQuestions, records)
        };
      };
      return {
        baseQuestions: [],
        customQuestions: [],
        records: readRecords(),
        questions: [],
        loading: false,
        loaded: false,
        error: null,
        lastSyncedAt: null,
        load: async () => {
          set({ loading: true, error: null });
          try {
            const response = await fetch(`${"/"}questions.json`, {
              cache: "no-cache"
            });
            if (!response.ok) {
              throw new Error(`\u8BFB\u53D6\u9898\u5E93\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`);
            }
            const raw = await response.json();
            const baseQuestions = extractQuestionList(raw).map((item, index) => normalizeQuestion(item, index)).filter((item) => item !== null);
            const records = readRecords();
            const customQuestions = readCustomQuestions().filter(
              (question) => !baseQuestions.some((base) => base.id === question.id)
            );
            set({
              baseQuestions,
              customQuestions,
              records,
              questions: mergeQuestions(baseQuestions, customQuestions, records),
              loading: false,
              loaded: true,
              error: null
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
            set({
              loading: false,
              loaded: true,
              error: `${message}\u3002\u8BF7\u786E\u8BA4 public/questions.json \u5B58\u5728\uFF08\u53EF\u5728\u9879\u76EE\u6839\u76EE\u5F55\u8FD0\u884C npm run dev\uFF09\u3002`
            });
          }
        },
        updateQuestion: (id, patch) => {
          set((state) => commit(state, id, patch));
        },
        incrementPractice: (id) => {
          set((state) => {
            const question = state.questions.find((item) => item.id === id);
            if (!question) return {};
            const nextCount = (question.practiceCount ?? 0) + 1;
            const patch = {
              practiceCount: nextCount,
              lastPracticeDate: (/* @__PURE__ */ new Date()).toISOString()
            };
            if (question.status === "not-practiced") patch.status = "practiced";
            return commit(state, id, patch);
          });
        },
        setStatus: (id, status) => {
          set((state) => commit(state, id, { status }));
        },
        clearAll: () => {
          clearAllStorage();
          set((state) => ({
            records: {},
            customQuestions: [],
            questions: mergeQuestions(state.baseQuestions, [], {})
          }));
        },
        buildExportPayload: () => {
          const questions = get().questions;
          return {
            app: "ielts-speaking-tracker",
            version: 1,
            exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
            stats: {
              total: questions.length,
              practiced: questions.filter((item) => item.status !== "not-practiced").length,
              familiar: questions.filter((item) => item.status === "familiar").length,
              notPracticed: questions.filter((item) => item.status === "not-practiced").length
            },
            questions
          };
        },
        importPayload: (raw) => {
          const state = get();
          const list = extractQuestionList(raw);
          const recordMap = extractRecordMap(raw);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const records = { ...state.records };
          const custom = [...state.customQuestions];
          const baseIds = new Set(state.baseQuestions.map((question) => question.id));
          const customIndex = new Map(custom.map((question, index) => [question.id, index]));
          const idByKey = /* @__PURE__ */ new Map();
          state.questions.forEach((question) => {
            const key = questionKey(question);
            if (!idByKey.has(key)) idByKey.set(key, question.id);
          });
          let added = 0;
          let updated = 0;
          let skipped = 0;
          list.forEach((entry, index) => {
            const question = normalizeQuestion(entry, index);
            if (!question) {
              skipped += 1;
              return;
            }
            const matchedId = baseIds.has(question.id) ? question.id : idByKey.get(questionKey(question));
            if (matchedId && baseIds.has(matchedId)) {
              records[matchedId] = {
                ...records[matchedId] ?? {},
                ...recordFromImport(question, now)
              };
              updated += 1;
              return;
            }
            if (matchedId) {
              const existingIndex = customIndex.get(matchedId);
              if (existingIndex !== void 0) {
                custom[existingIndex] = { ...custom[existingIndex], ...question, id: matchedId };
                delete records[matchedId];
                updated += 1;
                return;
              }
            }
            custom.push(question);
            customIndex.set(question.id, custom.length - 1);
            idByKey.set(questionKey(question), question.id);
            added += 1;
          });
          if (recordMap) {
            Object.entries(recordMap).forEach(([id, record]) => {
              if (!isRecord(record)) {
                skipped += 1;
                return;
              }
              records[id] = { ...records[id] ?? {}, ...record };
              updated += 1;
            });
          }
          writeRecords(records);
          writeCustomQuestions(custom);
          set({
            records,
            customQuestions: custom,
            questions: mergeQuestions(state.baseQuestions, custom, records)
          });
          return { added, updated, skipped };
        },
        syncFromStorage: () => {
          set((state) => {
            const records = readRecords();
            const customQuestions = readCustomQuestions().filter(
              (question) => !state.baseQuestions.some((base) => base.id === question.id)
            );
            return {
              records,
              customQuestions,
              questions: mergeQuestions(state.baseQuestions, customQuestions, records),
              lastSyncedAt: Date.now()
            };
          });
        },
        storageBytes: () => storageUsageBytes()
      };
    });
  }
});

// .verify/logic.ts
import fs from "node:fs";
import path from "node:path";
var passed = 0;
var failures = [];
function check(label, condition, extra) {
  if (condition) {
    passed += 1;
    console.log(`  ok  ${label}`);
  } else {
    failures.push(label);
    console.log(`FAIL  ${label}`, extra === void 0 ? "" : JSON.stringify(extra));
  }
}
var memory = /* @__PURE__ */ new Map();
var fakeWindow = {
  localStorage: {
    getItem: (key) => memory.has(key) ? memory.get(key) : null,
    setItem: (key, value) => void memory.set(key, String(value)),
    removeItem: (key) => void memory.delete(key)
  }
};
globalThis.window = fakeWindow;
var root = process.cwd();
var sample = JSON.parse(fs.readFileSync(path.join(root, "public", "questions.json"), "utf8"));
var full = JSON.parse(fs.readFileSync(path.join(root, "public", "questions-full.json"), "utf8"));
var requested = [];
globalThis.fetch = async (url) => {
  requested.push(url);
  return { ok: true, status: 200, json: async () => sample };
};
var RECORDS_KEY = "ielts-speaking-tracker:records:v1";
var CUSTOM_KEY = "ielts-speaking-tracker:custom-questions:v1";
var { useQuestionStore: useQuestionStore2 } = await Promise.resolve().then(() => (init_useQuestionStore(), useQuestionStore_exports));
var store = useQuestionStore2;
await store.getState().load();
var loaded = store.getState();
check("\u52A0\u8F7D questions.json", loaded.questions.length === 5, loaded.questions.length);
check("\u8BF7\u6C42\u8DEF\u5F84\u5E26\u4E0A BASE_URL", requested[0] === "/questions.json", requested[0]);
check("\u52A0\u8F7D\u540E\u65E0\u9519\u8BEF", loaded.error === null, loaded.error);
check(
  "\u793A\u4F8B\u9898\u8986\u76D6 5 \u4E2A\u5206\u533A",
  new Set(loaded.questions.map((q) => `${q.region}-${q.category}-${q.part}`)).size === 5
);
check(
  "\u793A\u4F8B\u6570\u636E\u91CC\u7684\u7EC3\u4E60\u72B6\u6001\u88AB\u4FDD\u7559",
  loaded.questions.find((q) => q.id === "p1-music")?.practiceCount === 3
);
store.getState().updateQuestion("p1-travelling", { ninePointAnswer: "I usually take the metro." });
var afterEdit = store.getState().questions.find((q) => q.id === "p1-travelling");
check("\u7F16\u8F91\u540E\u5185\u5B58\u91CC\u7684\u9898\u76EE\u5DF2\u66F4\u65B0", afterEdit?.ninePointAnswer === "I usually take the metro.");
var recordsRaw = JSON.parse(memory.get(RECORDS_KEY) ?? "{}");
check("\u7F16\u8F91\u540E\u5199\u5165 localStorage", recordsRaw["p1-travelling"]?.ninePointAnswer === "I usually take the metro.");
check("\u8BB0\u5F55\u91CC\u5E26 updatedAt", typeof recordsRaw["p1-travelling"]?.updatedAt === "string");
store.getState().incrementPractice("p1-travelling");
var afterPlus = store.getState().questions.find((q) => q.id === "p1-travelling");
check("\u7EC3\u4E60\u6B21\u6570 +1", afterPlus?.practiceCount === 1, afterPlus?.practiceCount);
check("\u6700\u540E\u7EC3\u4E60\u65E5\u671F\u81EA\u52A8\u8BB0\u5F55", typeof afterPlus?.lastPracticeDate === "string" && afterPlus.lastPracticeDate.length > 10);
check("\u9996\u6B21\u7EC3\u4E60\u81EA\u52A8\u5347\u7EA7\u4E3A\u300C\u7EC3\u8FC7\u300D", afterPlus?.status === "practiced", afterPlus?.status);
store.getState().incrementPractice("p1-travelling");
check(
  "\u518D\u6B21 +1 \u65F6\u72B6\u6001\u4E0D\u4F1A\u88AB\u6539\u52A8",
  store.getState().questions.find((q) => q.id === "p1-travelling")?.practiceCount === 2
);
store.getState().setStatus("p1-travelling", "familiar");
check("\u624B\u52A8\u5207\u6362\u72B6\u6001", store.getState().questions.find((q) => q.id === "p1-travelling")?.status === "familiar");
var first = store.getState().importPayload(full);
check("\u5BFC\u5165\u5B8C\u6574\u9898\u5E93\uFF1A\u4E0E 5 \u9053\u793A\u4F8B\u9898\u5408\u5E76\uFF0C\u65B0\u589E 94 \u9053", first.added === 94 && first.updated === 5 && first.skipped === 0, first);
check("\u5BFC\u5165\u540E\u9898\u76EE\u603B\u6570 99\uFF08\u793A\u4F8B\u9898\u4E0E\u9898\u5E93\u5408\u5E76\uFF0C\u65E0\u91CD\u590D\uFF09", store.getState().questions.length === 99, store.getState().questions.length);
check(
  "\u5DF2\u5BFC\u5165\u7684\u9898\u76EE\u88AB\u8BB0\u5F55\u5230 localStorage",
  JSON.parse(memory.get(CUSTOM_KEY) ?? "[]").length === 94
);
check(
  "\u5BFC\u5165\u4E0D\u4F1A\u8986\u76D6\u5DF2\u6709\u7EC3\u4E60\u8BB0\u5F55",
  store.getState().questions.find((q) => q.id === "p1-travelling")?.ninePointAnswer === "I usually take the metro."
);
check(
  "\u5BFC\u5165\u9898\u5E93\u540E\u4E0D\u4F1A\u51FA\u73B0\u91CD\u590D\u9898\u76EE\uFF08\u540C\u5206\u533A + \u540C\u6807\u9898\u53EA\u4FDD\u7559\u4E00\u6761\uFF09",
  store.getState().questions.filter(
    (q) => q.region === "mainland" && q.category === "new" && q.part === "Part 1" && q.title === "Travelling"
  ).length === 1
);
check(
  "\u5408\u5E76\u65F6\u6CBF\u7528\u793A\u4F8B\u9898\u539F\u6709\u7684 id",
  Boolean(store.getState().questions.find((q) => q.id === "p1-travelling"))
);
var second = store.getState().importPayload(full);
check("\u91CD\u590D\u5BFC\u5165\u662F\u5E42\u7B49\u7684\uFF08\u4E0D\u91CD\u590D\u65B0\u589E\uFF09", second.added === 0 && second.updated === 99, second);
check("\u91CD\u590D\u5BFC\u5165\u540E\u603B\u6570\u4ECD\u662F 99", store.getState().questions.length === 99);
var backup = store.getState().buildExportPayload();
check("\u5BFC\u51FA\u5305\u542B\u5168\u90E8\u9898\u76EE", backup.questions.length === 99);
check("\u5BFC\u51FA\u7EDF\u8BA1\u91CC\u7684\u5DF2\u7EC3\u6570", backup.stats.practiced === 2, backup.stats);
store.getState().clearAll();
check("\u6E05\u7A7A\u540E\u56DE\u5230\u9898\u5E93\u539F\u59CB\u72B6\u6001", store.getState().questions.length === 5, store.getState().questions.length);
check("\u6E05\u7A7A\u540E\u8BB0\u5F55\u4E3A\u7A7A", JSON.parse(memory.get(RECORDS_KEY) ?? "{}") !== null && Object.keys(JSON.parse(memory.get(RECORDS_KEY) ?? "{}")).length === 0);
var restored = store.getState().importPayload(backup);
check("\u5BFC\u5165\u81EA\u5DF1\u7684\u5907\u4EFD\u6587\u4EF6\u53EF\u6062\u590D", restored.added === 94 && restored.updated === 5, restored);
check(
  "\u6062\u590D\u540E\u7EC3\u4E60\u8BB0\u5F55\u56DE\u6765\u4E86",
  store.getState().questions.find((q) => q.id === "p1-travelling")?.practiceCount === 2 && store.getState().questions.find((q) => q.id === "p1-travelling")?.status === "familiar"
);
var dirty = store.getState().importPayload([
  { title: "No id topic", questions: ["Do you like it?"] },
  { id: "weird", title: "Weird", part: "Part 2", practiceCount: -3, status: "unknown" },
  null,
  "not an object"
]);
check("\u7F3A id \u7684\u9898\u76EE\u7528\u81EA\u52A8\u751F\u6210\u7684 id \u5BFC\u5165", dirty.added === 2, dirty);
check("\u975E\u6CD5\u6761\u76EE\u88AB\u8DF3\u8FC7", dirty.skipped === 2, dirty);
var weird = store.getState().questions.find((q) => q.id === "weird");
check("part 'Part 2' \u5F52\u4E00\u5316\u4E3A 'Part 2&3'", weird?.part === "Part 2&3", weird?.part);
check("\u8D1F\u6570\u7EC3\u4E60\u6B21\u6570\u5F52\u96F6", weird?.practiceCount === 0);
check("\u975E\u6CD5\u72B6\u6001\u5F52\u4E00\u5316\u4E3A\u672A\u7EC3", weird?.status === "not-practiced");
check(
  "region/category \u7F3A\u5931\u65F6\u7ED9\u9ED8\u8BA4\u503C",
  weird?.region === "mainland" && weird?.category === "new"
);
var noResult = store.getState().importPayload({ hello: "world" });
check("\u65E0\u6CD5\u8BC6\u522B\u7684\u5185\u5BB9\u4E0D\u4F1A\u65B0\u589E\u9898\u76EE", noResult.added === 0 && noResult.updated === 0);
console.log(`
\u901A\u8FC7 ${passed} \u9879\uFF0C\u5931\u8D25 ${failures.length} \u9879`);
if (failures.length > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim.production.js:
  (**
   * @license React
   * use-sync-external-store-shim.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
