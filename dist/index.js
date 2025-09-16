import Se, { createContext as we, useReducer as Ke, useMemo as Oe, useContext as Ce, useRef as zt, useCallback as X, useEffect as se, useState as Gt, useLayoutEffect as Ve, forwardRef as _e, createElement as ve } from "react";
var pe = { exports: {} }, le = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ne;
function Xe() {
  if (Ne) return le;
  Ne = 1;
  var t = Se, e = Symbol.for("react.element"), r = Symbol.for("react.fragment"), l = Object.prototype.hasOwnProperty, s = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, d = { key: !0, ref: !0, __self: !0, __source: !0 };
  function m(v, u, N) {
    var g, L = {}, W = null, p = null;
    N !== void 0 && (W = "" + N), u.key !== void 0 && (W = "" + u.key), u.ref !== void 0 && (p = u.ref);
    for (g in u) l.call(u, g) && !d.hasOwnProperty(g) && (L[g] = u[g]);
    if (v && v.defaultProps) for (g in u = v.defaultProps, u) L[g] === void 0 && (L[g] = u[g]);
    return { $$typeof: e, type: v, key: W, ref: p, props: L, _owner: s.current };
  }
  return le.Fragment = r, le.jsx = m, le.jsxs = m, le;
}
var ce = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Re;
function qe() {
  return Re || (Re = 1, process.env.NODE_ENV !== "production" && (function() {
    var t = Se, e = Symbol.for("react.element"), r = Symbol.for("react.portal"), l = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), m = Symbol.for("react.provider"), v = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), N = Symbol.for("react.suspense"), g = Symbol.for("react.suspense_list"), L = Symbol.for("react.memo"), W = Symbol.for("react.lazy"), p = Symbol.for("react.offscreen"), Z = Symbol.iterator, C = "@@iterator";
    function j(n) {
      if (n === null || typeof n != "object")
        return null;
      var T = Z && n[Z] || n[C];
      return typeof T == "function" ? T : null;
    }
    var D = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function c(n) {
      {
        for (var T = arguments.length, M = new Array(T > 1 ? T - 1 : 0), V = 1; V < T; V++)
          M[V - 1] = arguments[V];
        B("error", n, M);
      }
    }
    function B(n, T, M) {
      {
        var V = D.ReactDebugCurrentFrame, ft = V.getStackAddendum();
        ft !== "" && (T += "%s", M = M.concat([ft]));
        var gt = M.map(function(lt) {
          return String(lt);
        });
        gt.unshift("Warning: " + T), Function.prototype.apply.call(console[n], console, gt);
      }
    }
    var F = !1, q = !1, h = !1, w = !1, $ = !1, x;
    x = Symbol.for("react.module.reference");
    function tt(n) {
      return !!(typeof n == "string" || typeof n == "function" || n === l || n === d || $ || n === s || n === N || n === g || w || n === p || F || q || h || typeof n == "object" && n !== null && (n.$$typeof === W || n.$$typeof === L || n.$$typeof === m || n.$$typeof === v || n.$$typeof === u || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      n.$$typeof === x || n.getModuleId !== void 0));
    }
    function rt(n, T, M) {
      var V = n.displayName;
      if (V)
        return V;
      var ft = T.displayName || T.name || "";
      return ft !== "" ? M + "(" + ft + ")" : M;
    }
    function pt(n) {
      return n.displayName || "Context";
    }
    function mt(n) {
      if (n == null)
        return null;
      if (typeof n.tag == "number" && c("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof n == "function")
        return n.displayName || n.name || null;
      if (typeof n == "string")
        return n;
      switch (n) {
        case l:
          return "Fragment";
        case r:
          return "Portal";
        case d:
          return "Profiler";
        case s:
          return "StrictMode";
        case N:
          return "Suspense";
        case g:
          return "SuspenseList";
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case v:
            var T = n;
            return pt(T) + ".Consumer";
          case m:
            var M = n;
            return pt(M._context) + ".Provider";
          case u:
            return rt(n, n.render, "ForwardRef");
          case L:
            var V = n.displayName || null;
            return V !== null ? V : mt(n.type) || "Memo";
          case W: {
            var ft = n, gt = ft._payload, lt = ft._init;
            try {
              return mt(lt(gt));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var Tt = Object.assign, bt = 0, Wt, ne, ie, a, i, _, O;
    function I() {
    }
    I.__reactDisabledLog = !0;
    function E() {
      {
        if (bt === 0) {
          Wt = console.log, ne = console.info, ie = console.warn, a = console.error, i = console.group, _ = console.groupCollapsed, O = console.groupEnd;
          var n = {
            configurable: !0,
            enumerable: !0,
            value: I,
            writable: !0
          };
          Object.defineProperties(console, {
            info: n,
            log: n,
            warn: n,
            error: n,
            group: n,
            groupCollapsed: n,
            groupEnd: n
          });
        }
        bt++;
      }
    }
    function b() {
      {
        if (bt--, bt === 0) {
          var n = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: Tt({}, n, {
              value: Wt
            }),
            info: Tt({}, n, {
              value: ne
            }),
            warn: Tt({}, n, {
              value: ie
            }),
            error: Tt({}, n, {
              value: a
            }),
            group: Tt({}, n, {
              value: i
            }),
            groupCollapsed: Tt({}, n, {
              value: _
            }),
            groupEnd: Tt({}, n, {
              value: O
            })
          });
        }
        bt < 0 && c("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var G = D.ReactCurrentDispatcher, H;
    function S(n, T, M) {
      {
        if (H === void 0)
          try {
            throw Error();
          } catch (ft) {
            var V = ft.stack.trim().match(/\n( *(at )?)/);
            H = V && V[1] || "";
          }
        return `
` + H + n;
      }
    }
    var J = !1, A;
    {
      var Y = typeof WeakMap == "function" ? WeakMap : Map;
      A = new Y();
    }
    function et(n, T) {
      if (!n || J)
        return "";
      {
        var M = A.get(n);
        if (M !== void 0)
          return M;
      }
      var V;
      J = !0;
      var ft = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var gt;
      gt = G.current, G.current = null, E();
      try {
        if (T) {
          var lt = function() {
            throw Error();
          };
          if (Object.defineProperty(lt.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(lt, []);
            } catch (kt) {
              V = kt;
            }
            Reflect.construct(n, [], lt);
          } else {
            try {
              lt.call();
            } catch (kt) {
              V = kt;
            }
            n.call(lt.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (kt) {
            V = kt;
          }
          n();
        }
      } catch (kt) {
        if (kt && V && typeof kt.stack == "string") {
          for (var at = kt.stack.split(`
`), _t = V.stack.split(`
`), Et = at.length - 1, Nt = _t.length - 1; Et >= 1 && Nt >= 0 && at[Et] !== _t[Nt]; )
            Nt--;
          for (; Et >= 1 && Nt >= 0; Et--, Nt--)
            if (at[Et] !== _t[Nt]) {
              if (Et !== 1 || Nt !== 1)
                do
                  if (Et--, Nt--, Nt < 0 || at[Et] !== _t[Nt]) {
                    var Pt = `
` + at[Et].replace(" at new ", " at ");
                    return n.displayName && Pt.includes("<anonymous>") && (Pt = Pt.replace("<anonymous>", n.displayName)), typeof n == "function" && A.set(n, Pt), Pt;
                  }
                while (Et >= 1 && Nt >= 0);
              break;
            }
        }
      } finally {
        J = !1, G.current = gt, b(), Error.prepareStackTrace = ft;
      }
      var oe = n ? n.displayName || n.name : "", Jt = oe ? S(oe) : "";
      return typeof n == "function" && A.set(n, Jt), Jt;
    }
    function dt(n, T, M) {
      return et(n, !1);
    }
    function Dt(n) {
      var T = n.prototype;
      return !!(T && T.isReactComponent);
    }
    function jt(n, T, M) {
      if (n == null)
        return "";
      if (typeof n == "function")
        return et(n, Dt(n));
      if (typeof n == "string")
        return S(n);
      switch (n) {
        case N:
          return S("Suspense");
        case g:
          return S("SuspenseList");
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case u:
            return dt(n.render);
          case L:
            return jt(n.type, T, M);
          case W: {
            var V = n, ft = V._payload, gt = V._init;
            try {
              return jt(gt(ft), T, M);
            } catch {
            }
          }
        }
      return "";
    }
    var Lt = Object.prototype.hasOwnProperty, ue = {}, At = D.ReactDebugCurrentFrame;
    function xt(n) {
      if (n) {
        var T = n._owner, M = jt(n.type, n._source, T ? T.type : null);
        At.setExtraStackFrame(M);
      } else
        At.setExtraStackFrame(null);
    }
    function Ot(n, T, M, V, ft) {
      {
        var gt = Function.call.bind(Lt);
        for (var lt in n)
          if (gt(n, lt)) {
            var at = void 0;
            try {
              if (typeof n[lt] != "function") {
                var _t = Error((V || "React class") + ": " + M + " type `" + lt + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof n[lt] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw _t.name = "Invariant Violation", _t;
              }
              at = n[lt](T, lt, V, M, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (Et) {
              at = Et;
            }
            at && !(at instanceof Error) && (xt(ft), c("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", V || "React class", M, lt, typeof at), xt(null)), at instanceof Error && !(at.message in ue) && (ue[at.message] = !0, xt(ft), c("Failed %s type: %s", M, at.message), xt(null));
          }
      }
    }
    var Bt = Array.isArray;
    function ht(n) {
      return Bt(n);
    }
    function Rt(n) {
      {
        var T = typeof Symbol == "function" && Symbol.toStringTag, M = T && n[Symbol.toStringTag] || n.constructor.name || "Object";
        return M;
      }
    }
    function Ft(n) {
      try {
        return wt(n), !1;
      } catch {
        return !0;
      }
    }
    function wt(n) {
      return "" + n;
    }
    function st(n) {
      if (Ft(n))
        return c("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Rt(n)), wt(n);
    }
    var y = D.ReactCurrentOwner, z = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, R, U;
    function P(n) {
      if (Lt.call(n, "ref")) {
        var T = Object.getOwnPropertyDescriptor(n, "ref").get;
        if (T && T.isReactWarning)
          return !1;
      }
      return n.ref !== void 0;
    }
    function nt(n) {
      if (Lt.call(n, "key")) {
        var T = Object.getOwnPropertyDescriptor(n, "key").get;
        if (T && T.isReactWarning)
          return !1;
      }
      return n.key !== void 0;
    }
    function it(n, T) {
      typeof n.ref == "string" && y.current;
    }
    function k(n, T) {
      {
        var M = function() {
          R || (R = !0, c("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", T));
        };
        M.isReactWarning = !0, Object.defineProperty(n, "key", {
          get: M,
          configurable: !0
        });
      }
    }
    function ot(n, T) {
      {
        var M = function() {
          U || (U = !0, c("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", T));
        };
        M.isReactWarning = !0, Object.defineProperty(n, "ref", {
          get: M,
          configurable: !0
        });
      }
    }
    var It = function(n, T, M, V, ft, gt, lt) {
      var at = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: e,
        // Built-in properties that belong on the element
        type: n,
        key: T,
        ref: M,
        props: lt,
        // Record the component responsible for creating this element.
        _owner: gt
      };
      return at._store = {}, Object.defineProperty(at._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(at, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: V
      }), Object.defineProperty(at, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: ft
      }), Object.freeze && (Object.freeze(at.props), Object.freeze(at)), at;
    };
    function ct(n, T, M, V, ft) {
      {
        var gt, lt = {}, at = null, _t = null;
        M !== void 0 && (st(M), at = "" + M), nt(T) && (st(T.key), at = "" + T.key), P(T) && (_t = T.ref, it(T, ft));
        for (gt in T)
          Lt.call(T, gt) && !z.hasOwnProperty(gt) && (lt[gt] = T[gt]);
        if (n && n.defaultProps) {
          var Et = n.defaultProps;
          for (gt in Et)
            lt[gt] === void 0 && (lt[gt] = Et[gt]);
        }
        if (at || _t) {
          var Nt = typeof n == "function" ? n.displayName || n.name || "Unknown" : n;
          at && k(lt, Nt), _t && ot(lt, Nt);
        }
        return It(n, at, _t, ft, V, y.current, lt);
      }
    }
    var ut = D.ReactCurrentOwner, Q = D.ReactDebugCurrentFrame;
    function K(n) {
      if (n) {
        var T = n._owner, M = jt(n.type, n._source, T ? T.type : null);
        Q.setExtraStackFrame(M);
      } else
        Q.setExtraStackFrame(null);
    }
    var yt;
    yt = !1;
    function vt(n) {
      return typeof n == "object" && n !== null && n.$$typeof === e;
    }
    function St() {
      {
        if (ut.current) {
          var n = mt(ut.current.type);
          if (n)
            return `

Check the render method of \`` + n + "`.";
        }
        return "";
      }
    }
    function Ct(n) {
      return "";
    }
    var Mt = {};
    function re(n) {
      {
        var T = St();
        if (!T) {
          var M = typeof n == "string" ? n : n.displayName || n.name;
          M && (T = `

Check the top-level render call using <` + M + ">.");
        }
        return T;
      }
    }
    function Yt(n, T) {
      {
        if (!n._store || n._store.validated || n.key != null)
          return;
        n._store.validated = !0;
        var M = re(T);
        if (Mt[M])
          return;
        Mt[M] = !0;
        var V = "";
        n && n._owner && n._owner !== ut.current && (V = " It was passed a child from " + mt(n._owner.type) + "."), K(n), c('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', M, V), K(null);
      }
    }
    function fe(n, T) {
      {
        if (typeof n != "object")
          return;
        if (ht(n))
          for (var M = 0; M < n.length; M++) {
            var V = n[M];
            vt(V) && Yt(V, T);
          }
        else if (vt(n))
          n._store && (n._store.validated = !0);
        else if (n) {
          var ft = j(n);
          if (typeof ft == "function" && ft !== n.entries)
            for (var gt = ft.call(n), lt; !(lt = gt.next()).done; )
              vt(lt.value) && Yt(lt.value, T);
        }
      }
    }
    function Kt(n) {
      {
        var T = n.type;
        if (T == null || typeof T == "string")
          return;
        var M;
        if (typeof T == "function")
          M = T.propTypes;
        else if (typeof T == "object" && (T.$$typeof === u || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        T.$$typeof === L))
          M = T.propTypes;
        else
          return;
        if (M) {
          var V = mt(T);
          Ot(M, n.props, "prop", V, n);
        } else if (T.PropTypes !== void 0 && !yt) {
          yt = !0;
          var ft = mt(T);
          c("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", ft || "Unknown");
        }
        typeof T.getDefaultProps == "function" && !T.getDefaultProps.isReactClassApproved && c("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ae(n) {
      {
        for (var T = Object.keys(n.props), M = 0; M < T.length; M++) {
          var V = T[M];
          if (V !== "children" && V !== "key") {
            K(n), c("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", V), K(null);
            break;
          }
        }
        n.ref !== null && (K(n), c("Invalid attribute `ref` supplied to `React.Fragment`."), K(null));
      }
    }
    var Vt = {};
    function Xt(n, T, M, V, ft, gt) {
      {
        var lt = tt(n);
        if (!lt) {
          var at = "";
          (n === void 0 || typeof n == "object" && n !== null && Object.keys(n).length === 0) && (at += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var _t = Ct();
          _t ? at += _t : at += St();
          var Et;
          n === null ? Et = "null" : ht(n) ? Et = "array" : n !== void 0 && n.$$typeof === e ? (Et = "<" + (mt(n.type) || "Unknown") + " />", at = " Did you accidentally export a JSX literal instead of a component?") : Et = typeof n, c("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", Et, at);
        }
        var Nt = ct(n, T, M, ft, gt);
        if (Nt == null)
          return Nt;
        if (lt) {
          var Pt = T.children;
          if (Pt !== void 0)
            if (V)
              if (ht(Pt)) {
                for (var oe = 0; oe < Pt.length; oe++)
                  fe(Pt[oe], n);
                Object.freeze && Object.freeze(Pt);
              } else
                c("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              fe(Pt, n);
        }
        if (Lt.call(T, "key")) {
          var Jt = mt(n), kt = Object.keys(T).filter(function(Ye) {
            return Ye !== "key";
          }), he = kt.length > 0 ? "{key: someKey, " + kt.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!Vt[Jt + he]) {
            var We = kt.length > 0 ? "{" + kt.join(": ..., ") + ": ...}" : "{}";
            c(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, he, Jt, We, Jt), Vt[Jt + he] = !0;
          }
        }
        return n === l ? ae(Nt) : Kt(Nt), Nt;
      }
    }
    function Te(n, T, M) {
      return Xt(n, T, M, !0);
    }
    function ge(n, T, M) {
      return Xt(n, T, M, !1);
    }
    var de = ge, $t = Te;
    ce.Fragment = l, ce.jsx = de, ce.jsxs = $t;
  })()), ce;
}
var be;
function Ze() {
  return be || (be = 1, process.env.NODE_ENV === "production" ? pe.exports = Xe() : pe.exports = qe()), pe.exports;
}
var f = Ze(), o = /* @__PURE__ */ ((t) => (t.CLIP = "clip", t.SOUND = "sound", t.TEXT = "text", t.IMAGE = "image", t.CAPTION = "caption", t.TRANSITION_IN = "transition-in", t.TRANSITION_OUT = "transition-out", t.TRANSITION_MERGED = "transition-merged", t))(o || {});
const Je = [
  // Video clip on track 0 - positioned AFTER its 1-frame transition-in
  // Pattern: transition-in (0 -> 1 frame) -> video content starts at 1 frame
  // Original length: 15s, Speed: 1.0x, Effective length: 15s
  // Example trims: trimmedIn and trimmedOut are authoritative
  {
    id: "clip-1",
    type: o.CLIP,
    startTime: 0.5,
    // Starts after 1 frame transition-in (~0.04167s at 24fps)
    duration: 8,
    row: 0,
    src: "/demo/video1.mp4",
    volume: 1,
    muted: !1,
    selected: !1,
    label: "Video 1 (Trimmed)",
    length: 15,
    // Original video length in seconds
    speed: 1,
    // Normal playback speed
    trimmedIn: 2,
    // initial trim-in (seconds on timeline)
    trimmedOut: 4,
    // initial trim-out (seconds on timeline)
    transitionInId: "clip-1-transition-in",
    transitionOutId: "clip-1-transition-out"
  },
  // Transition in for clip-1 - exactly 1 frame duration
  {
    id: "clip-1-transition-in",
    type: o.TRANSITION_IN,
    startTime: 0,
    // Starts at timeline beginning
    duration: 0.5,
    // Exactly 1 frame duration (~0.04167s at 24fps)
    row: 0,
    selected: !1,
    parentClipId: "clip-1",
    transitionType: "fade"
  },
  // Transition out for clip-1
  {
    id: "clip-1-transition-out",
    type: o.TRANSITION_OUT,
    startTime: 0.5 + 8,
    // starts when main clip ends (~8.04167s)
    duration: 0.5,
    row: 0,
    selected: !1,
    parentClipId: "clip-1",
    transitionType: "fade"
  },
  // Second video clip on track 0 - separated from clip-1 with gap
  // Original length: 12s, Speed: 2.0x, Effective length: 6s
  // Example trims: trimmedIn/trimmedOut are set explicitly
  {
    id: "clip-2",
    type: o.CLIP,
    startTime: 10.5,
    // starts with gap after clip-1 (clip-1 ends at ~8.54167s, gap until 10.5s)
    duration: 4,
    row: 0,
    src: "/demo/video2.mp4",
    volume: 0.8,
    muted: !1,
    selected: !1,
    label: "Video 2 (2x Speed)",
    length: 12,
    // Original video length in seconds
    speed: 2,
    // Double speed
    trimmedIn: 0.5,
    // initial trim-in (timeline seconds)
    trimmedOut: 0.5,
    // initial trim-out (timeline seconds)
    transitionInId: "clip-2-transition-in",
    transitionOutId: "clip-2-transition-out"
  },
  // Transition in for clip-2
  {
    id: "clip-2-transition-in",
    type: o.TRANSITION_IN,
    startTime: 10,
    // clip start - duration (10.5 - 0.5 = 10.0)
    duration: 0.5,
    row: 0,
    selected: !1,
    parentClipId: "clip-2",
    transitionType: "slide"
  },
  // Transition out for clip-2
  {
    id: "clip-2-transition-out",
    type: o.TRANSITION_OUT,
    startTime: 14.5,
    // clip end (10.5 + 4 = 14.5)
    duration: 0.5,
    row: 0,
    selected: !1,
    parentClipId: "clip-2",
    transitionType: "slide"
  },
  // Text overlay on track 2
  {
    id: "text-1",
    type: o.TEXT,
    startTime: 2,
    duration: 4,
    row: 2,
    text: "Welcome to the Timeline!",
    fontSize: 24,
    fontFamily: "Arial",
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.5)",
    x: 100,
    y: 50,
    width: 300,
    height: 60,
    selected: !1
  },
  // Another text overlay
  {
    id: "text-2",
    type: o.TEXT,
    startTime: 12,
    duration: 3,
    row: 2,
    text: "End Credits",
    fontSize: 18,
    fontFamily: "Arial",
    color: "#ffff00",
    x: 200,
    y: 400,
    width: 200,
    height: 40,
    selected: !1
  },
  // Image overlay on track 3
  {
    id: "image-1",
    type: o.IMAGE,
    startTime: 5,
    duration: 3,
    row: 3,
    src: "/demo/logo.png",
    label: "Logo",
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    opacity: 0.8,
    selected: !1
  },
  // Waveform audio track on track 1
  {
    id: "audio-1",
    type: o.SOUND,
    startTime: 0,
    duration: 40,
    row: 1,
    src: "/demo/sample-audio.mp3",
    // Replace with your audio file URL
    volume: 0.6,
    muted: !1,
    selected: !1,
    label: "audio",
    waveformData: void 0
    // Will be generated dynamically
  }
], Qe = [
  // Example: createWaveformTrack('audio-2', 'https://example.com/audio.mp3', 5, 8, 1, { label: 'Sound Effect', volume: 0.8 })
  // To add a waveform track from any audio URL, uncomment and modify:
  // createWaveformTrack(
  //   'my-audio-track',                              // Unique ID
  //   'https://your-audio-url.com/audio.mp3',       // Audio file URL
  //   0,                                             // Start time (seconds)
  //   15,                                            // Duration (seconds)  
  //   1,                                             // Track row
  //   { 
  //     label: 'My Audio Track',                     // Display label
  //     volume: 0.7,                                 // Volume (0.0 to 1.0)
  //     muted: false                                 // Whether to start muted
  //   }
  // )
], De = [...Je, ...Qe], tn = {
  overlays: De,
  currentTime: 0,
  duration: Math.max(30, ...De.map((t) => t.startTime + t.duration)),
  // Calculate from overlays
  isPlaying: !1,
  zoom: 1,
  selectedOverlayIds: []
}, en = {
  pixelsPerSecond: 50,
  trackHeight: 80,
  snapToGrid: !0,
  gridSize: 0.1,
  // 100ms
  fps: 24
  // Frames per second for timecode display
}, nn = {
  history: {
    past: [],
    present: tn,
    future: [],
    maxHistorySize: 50
  },
  settings: en,
  dragInfo: null,
  dragStartState: null
};
function ee(t) {
  return {
    ...t,
    overlays: t.overlays.map((e) => ({ ...e }))
  };
}
function Qt(t, e) {
  const r = [...t.past, ee(t.present)];
  return r.length > t.maxHistorySize && r.shift(), {
    ...t,
    past: r,
    present: ee(e),
    future: []
    // Clear future when a new action is performed
  };
}
function ke(t) {
  return t.past.length > 0;
}
function Pe(t) {
  return t.future.length > 0;
}
function rn(t) {
  if (!ke(t)) return t;
  const e = t.past[t.past.length - 1], r = t.past.slice(0, -1);
  return {
    ...t,
    past: r,
    present: ee(e),
    future: [ee(t.present), ...t.future]
  };
}
function on(t) {
  if (!Pe(t)) return t;
  const e = t.future[0], r = t.future.slice(1);
  return {
    ...t,
    past: [...t.past, ee(t.present)],
    present: ee(e),
    future: r
  };
}
function sn(t, e) {
  switch (e.type) {
    case "PLAY":
      return {
        ...t,
        history: {
          ...t.history,
          present: { ...t.history.present, isPlaying: !0 }
        }
      };
    case "PAUSE":
      return {
        ...t,
        history: {
          ...t.history,
          present: { ...t.history.present, isPlaying: !1 }
        }
      };
    case "SEEK":
    case "SET_CURRENT_TIME":
      return {
        ...t,
        history: {
          ...t.history,
          present: { ...t.history.present, currentTime: e.payload }
        }
      };
    case "SET_DURATION":
      return {
        ...t,
        history: {
          ...t.history,
          present: { ...t.history.present, duration: e.payload }
        }
      };
    case "ADD_OVERLAY": {
      const r = {
        ...t.history.present,
        overlays: [...t.history.present.overlays, e.payload]
      };
      return {
        ...t,
        history: Qt(t.history, r)
      };
    }
    case "UPDATE_OVERLAY": {
      const r = [...t.history.present.overlays], l = r.findIndex((d) => d.id === e.payload.id);
      if (l !== -1) {
        const d = { ...r[l] };
        Object.assign(d, e.payload.updates), r[l] = d;
      }
      const s = {
        ...t.history.present,
        overlays: r
      };
      return {
        ...t,
        history: Qt(t.history, s)
      };
    }
    case "UPDATE_OVERLAY_BATCH": {
      const r = [...t.history.present.overlays], l = r.findIndex((s) => s.id === e.payload.id);
      if (l !== -1) {
        const s = { ...r[l] };
        Object.assign(s, e.payload.updates), r[l] = s;
      }
      return {
        ...t,
        history: {
          ...t.history,
          present: {
            ...t.history.present,
            overlays: r
          }
        }
      };
    }
    case "DELETE_OVERLAY": {
      const r = t.history.present.overlays.find((d) => d.id === e.payload);
      let l = t.history.present.overlays.filter((d) => d.id !== e.payload);
      if (r?.type === o.CLIP) {
        const d = t.history.present.overlays.find(
          (m) => m.type === o.TRANSITION_MERGED && (m.fromClipId === r.id || m.toClipId === r.id)
        );
        if (d) {
          const m = d.fromClipId === r.id ? d.toClipId : d.fromClipId, v = t.history.present.overlays.find((u) => u.id === m);
          if (v) {
            const u = d.fromClipId === r.id, N = u ? o.TRANSITION_IN : o.TRANSITION_OUT, g = `${m}-transition-${u ? "in" : "out"}`, L = t.history.present.overlays.find((p) => p.id === g), W = l.find((p) => p.id === g);
            if (L && !W) {
              console.log("Restoring existing transition during single deletion:", g), l.push(L), l = l.filter((Z) => Z.id !== d.id);
              const p = l.findIndex((Z) => Z.id === m);
              if (p !== -1) {
                const Z = { ...l[p] };
                u ? Z.transitionInId = g : Z.transitionOutId = g, l[p] = Z;
              }
            } else if (W)
              console.log("WARNING: Transition with ID already exists during single deletion:", g, "skipping creation"), l = l.filter((p) => p.id !== d.id);
            else {
              console.log("Creating new transition for single clip deletion:", g);
              const p = {
                id: g,
                type: N,
                startTime: u ? d.startTime - d.duration : v.startTime + v.duration,
                duration: d.duration,
                row: d.row,
                selected: !1,
                parentClipId: m,
                transitionType: d.transitionType
              };
              l = l.filter((C) => C.id !== d.id), l.push(p);
              const Z = l.findIndex((C) => C.id === m);
              if (Z !== -1) {
                const C = { ...l[Z] };
                u ? C.transitionInId = g : C.transitionOutId = g, l[Z] = C;
              }
            }
          } else
            l = l.filter((u) => u.id !== d.id);
        }
      }
      const s = {
        ...t.history.present,
        overlays: l,
        selectedOverlayIds: t.history.present.selectedOverlayIds.filter((d) => d !== e.payload)
      };
      return {
        ...t,
        history: Qt(t.history, s)
      };
    }
    case "DELETE_OVERLAYS": {
      const r = new Set(e.payload), l = t.history.present.overlays.filter(
        (m) => r.has(m.id) && m.type === o.CLIP
      );
      let s = t.history.present.overlays.filter((m) => !r.has(m.id));
      l.forEach((m) => {
        const v = t.history.present.overlays.find(
          (u) => u.type === o.TRANSITION_MERGED && (u.fromClipId === m.id || u.toClipId === m.id)
        );
        if (v) {
          const u = v.fromClipId === m.id ? v.toClipId : v.fromClipId;
          if (r.has(u)) {
            s = s.filter((g) => g.id !== v.id);
            return;
          }
          const N = t.history.present.overlays.find((g) => g.id === u);
          if (N) {
            const g = v.fromClipId === m.id, L = g ? o.TRANSITION_IN : o.TRANSITION_OUT, W = `${u}-transition-${g ? "in" : "out"}`, p = t.history.present.overlays.find((C) => C.id === W), Z = s.find((C) => C.id === W);
            if (p && !Z) {
              console.log("Restoring existing transition during batch deletion:", W), s.push(p), s = s.filter((j) => j.id !== v.id);
              const C = s.findIndex((j) => j.id === u);
              if (C !== -1) {
                const j = { ...s[C] };
                g ? j.transitionInId = W : j.transitionOutId = W, s[C] = j;
              }
            } else if (Z)
              console.log("WARNING: Transition with ID already exists during batch deletion:", W, "skipping creation"), s = s.filter((C) => C.id !== v.id);
            else {
              console.log("Creating new transition for batch clip deletion:", W);
              const C = {
                id: W,
                type: L,
                startTime: g ? v.startTime - v.duration : N.startTime + N.duration,
                duration: v.duration,
                row: v.row,
                selected: !1,
                parentClipId: u,
                transitionType: v.transitionType
              };
              s = s.filter((D) => D.id !== v.id), s.push(C);
              const j = s.findIndex((D) => D.id === u);
              if (j !== -1) {
                const D = { ...s[j] };
                g ? D.transitionInId = W : D.transitionOutId = W, s[j] = D;
              }
            }
          } else
            s = s.filter((g) => g.id !== v.id);
        }
      });
      const d = {
        ...t.history.present,
        overlays: s,
        selectedOverlayIds: t.history.present.selectedOverlayIds.filter((m) => !r.has(m))
      };
      return {
        ...t,
        history: Qt(t.history, d)
      };
    }
    case "SELECT_OVERLAY": {
      const { id: r, multiSelect: l } = e.payload;
      let s;
      l ? s = t.history.present.selectedOverlayIds.includes(r) ? t.history.present.selectedOverlayIds.filter((m) => m !== r) : [...t.history.present.selectedOverlayIds, r] : s = [r];
      const d = [...t.history.present.overlays];
      for (let m = 0; m < d.length; m++)
        d[m].selected = s.includes(d[m].id);
      return {
        ...t,
        history: {
          ...t.history,
          present: {
            ...t.history.present,
            selectedOverlayIds: s,
            overlays: d
          }
        }
      };
    }
    case "CLEAR_SELECTION": {
      const r = [...t.history.present.overlays];
      for (let l = 0; l < r.length; l++)
        r[l].selected = !1;
      return {
        ...t,
        history: {
          ...t.history,
          present: {
            ...t.history.present,
            selectedOverlayIds: [],
            overlays: r
          }
        }
      };
    }
    case "START_DRAG":
      return {
        ...t,
        dragInfo: e.payload,
        dragStartState: ee(t.history.present)
        // Save state before drag
      };
    case "UPDATE_DRAG":
      return {
        ...t,
        dragInfo: t.dragInfo ? { ...t.dragInfo, ...e.payload } : null
      };
    case "END_DRAG":
      return {
        ...t,
        dragInfo: null
        // Don't clear dragStartState yet - wait for COMMIT_DRAG_HISTORY
      };
    case "COMMIT_DRAG_HISTORY":
      return t.dragStartState ? {
        ...t,
        history: Qt({
          ...t.history,
          present: t.dragStartState
        }, t.history.present),
        dragStartState: null
      } : t;
    case "SET_ZOOM":
      return {
        ...t,
        history: {
          ...t.history,
          present: { ...t.history.present, zoom: e.payload }
        }
      };
    case "UPDATE_SETTINGS":
      return {
        ...t,
        settings: { ...t.settings, ...e.payload }
      };
    case "UNDO":
      return {
        ...t,
        history: rn(t.history)
      };
    case "REDO":
      return {
        ...t,
        history: on(t.history)
      };
    case "MERGE_TRANSITIONS": {
      const { transitionOutId: r, transitionInId: l } = e.payload, s = t.history.present.overlays.find((x) => x.id === r), d = t.history.present.overlays.find((x) => x.id === l);
      if (!s || !d || s.type !== o.TRANSITION_OUT && s.type !== o.TRANSITION_IN || d.type !== o.TRANSITION_OUT && d.type !== o.TRANSITION_IN) return t;
      const m = s.parentClipId, v = d.parentClipId, u = t.history.present.overlays.find((x) => x.id === m && x.type === o.CLIP), N = t.history.present.overlays.find((x) => x.id === v && x.type === o.CLIP);
      if (!u || !N) return t;
      const g = u.startTime <= N.startTime ? u : N, L = g.id === u.id ? N : u, W = s.type === o.TRANSITION_OUT ? s.duration : d.duration, p = d.type === o.TRANSITION_IN ? d.duration : s.duration, Z = Math.min(W || 0, p || 0), C = 2 / t.settings.fps, j = L.startTime, D = Math.max(C, Z), c = j - D, B = Math.max(C, c - g.startTime), F = {
        id: `merged-${r}-${l}`,
        type: o.TRANSITION_MERGED,
        startTime: c,
        duration: D,
        row: s.row,
        selected: !1,
        fromClipId: g.id,
        toClipId: L.id,
        transitionType: s.transitionType || d.transitionType || "fade"
      };
      let q = t.history.present.overlays.filter((x) => x.id !== r && x.id !== l).map((x) => x.id === g.id ? { ...x, duration: B } : x).concat(F);
      const h = q.findIndex((x) => x.id === g.id), w = q.findIndex((x) => x.id === L.id);
      if (h !== -1) {
        const x = q[h], rt = t.history.present.overlays.find((Tt) => Tt.id === g.transitionOutId)?.duration || 0, mt = D - rt;
        q[h] = {
          ...x,
          trimmedOut: Math.max(0, (x.trimmedOut || 0) - mt)
        };
      }
      if (w !== -1) {
        const x = q[w], rt = t.history.present.overlays.find((Tt) => Tt.id === L.transitionInId)?.duration || 0, mt = D - rt;
        q[w] = {
          ...x,
          trimmedIn: Math.max(0, (x.trimmedIn || 0) - mt)
        };
      }
      const $ = {
        ...t.history.present,
        overlays: q
      };
      return {
        ...t,
        history: Qt(t.history, $)
      };
    }
    case "SPLIT_MERGED_TRANSITION": {
      const r = e.payload, l = t.history.present.overlays.find((N) => N.id === r);
      if (!l || l.type !== o.TRANSITION_MERGED) return t;
      const s = l.startTime + l.duration / 2, d = {
        id: `${l.fromClipId}-transition-out`,
        type: o.TRANSITION_OUT,
        startTime: l.startTime,
        duration: s - l.startTime,
        row: l.row,
        selected: !1,
        parentClipId: l.fromClipId,
        transitionType: l.transitionType
      }, m = {
        id: `${l.toClipId}-transition-in`,
        type: o.TRANSITION_IN,
        startTime: s,
        duration: l.startTime + l.duration - s,
        row: l.row,
        selected: !1,
        parentClipId: l.toClipId,
        transitionType: l.transitionType
      }, v = t.history.present.overlays.filter((N) => N.id !== r).concat(d, m), u = {
        ...t.history.present,
        overlays: v
      };
      return {
        ...t,
        history: Qt(t.history, u)
      };
    }
    default:
      return t;
  }
}
const je = we(null);
function an({ children: t }) {
  const [e, r] = Ke(sn, nn), l = Oe(() => ({
    play: () => r({ type: "PLAY" }),
    pause: () => r({ type: "PAUSE" }),
    seek: (d) => r({ type: "SEEK", payload: d }),
    setCurrentTime: (d) => r({ type: "SET_CURRENT_TIME", payload: d }),
    setDuration: (d) => r({ type: "SET_DURATION", payload: d }),
    addOverlay: (d) => r({ type: "ADD_OVERLAY", payload: d }),
    updateOverlay: (d, m) => r({ type: "UPDATE_OVERLAY", payload: { id: d, updates: m } }),
    updateOverlayBatch: (d, m) => r({ type: "UPDATE_OVERLAY_BATCH", payload: { id: d, updates: m } }),
    deleteOverlay: (d) => r({ type: "DELETE_OVERLAY", payload: d }),
    deleteOverlays: (d) => r({ type: "DELETE_OVERLAYS", payload: d }),
    selectOverlay: (d, m) => r({ type: "SELECT_OVERLAY", payload: { id: d, multiSelect: m } }),
    clearSelection: () => r({ type: "CLEAR_SELECTION" }),
    startDrag: (d) => r({ type: "START_DRAG", payload: d }),
    updateDrag: (d) => r({ type: "UPDATE_DRAG", payload: d }),
    endDrag: () => r({ type: "END_DRAG" }),
    commitDragHistory: () => r({ type: "COMMIT_DRAG_HISTORY" }),
    setZoom: (d) => r({ type: "SET_ZOOM", payload: d }),
    updateSettings: (d) => r({ type: "UPDATE_SETTINGS", payload: d }),
    undo: () => r({ type: "UNDO" }),
    redo: () => r({ type: "REDO" }),
    canUndo: () => ke(e.history),
    canRedo: () => Pe(e.history),
    mergeTransitions: (d, m) => r({ type: "MERGE_TRANSITIONS", payload: { transitionOutId: d, transitionInId: m } }),
    splitMergedTransition: (d) => r({ type: "SPLIT_MERGED_TRANSITION", payload: d })
  }), [r]), s = {
    state: e.history.present,
    settings: e.settings,
    dragInfo: e.dragInfo,
    dragStartState: e.dragStartState,
    actions: l
  };
  return /* @__PURE__ */ f.jsx(je.Provider, { value: s, children: t });
}
function Ut() {
  const t = Ce(je);
  if (!t)
    throw new Error("useTimeline must be used within a TimelineProvider");
  return t;
}
function me(t, e = {}) {
  const { fps: r = 24, showFrames: l = !0, showHours: s = !0 } = e, d = Math.max(0, t), m = Math.floor(d), v = Math.floor((d - m) * r), u = Math.floor(m / 3600), N = Math.floor(m % 3600 / 60), g = m % 60;
  return s ? l ? `${u.toString().padStart(2, "0")}:${N.toString().padStart(2, "0")}:${g.toString().padStart(2, "0")}:${v.toString().padStart(2, "0")}` : `${u.toString().padStart(2, "0")}:${N.toString().padStart(2, "0")}:${g.toString().padStart(2, "0")}` : l ? `${N.toString().padStart(2, "0")}:${g.toString().padStart(2, "0")}:${v.toString().padStart(2, "0")}` : `${N.toString().padStart(2, "0")}:${g.toString().padStart(2, "0")}`;
}
function dn(t, e = {}) {
  const { fps: r = 24 } = e, l = Math.floor(t);
  return Math.floor(l / 3600) > 0 ? me(t, { fps: r, showFrames: !1, showHours: !0 }) : me(t, { fps: r, showFrames: !0, showHours: !1 });
}
function ln(t = 24) {
  return 1 / t;
}
function cn(t = 24, e = 50, r = 8) {
  const s = 1 / t * e, d = r / s;
  return Math.ceil(d * 10) / 10;
}
function un() {
  const { state: t, actions: e, settings: r } = Ut(), l = zt(), s = zt(0), d = X(() => {
    if (t.isPlaying) {
      const p = performance.now(), Z = (p - s.current) / 1e3;
      if (s.current > 0) {
        const C = Math.min(t.currentTime + Z, t.duration);
        if (e.setCurrentTime(C), C >= t.duration) {
          e.pause();
          return;
        }
      }
      s.current = p, l.current = requestAnimationFrame(d);
    }
  }, [t.isPlaying, t.currentTime, t.duration, e]);
  se(() => (t.isPlaying ? (s.current = performance.now(), l.current = requestAnimationFrame(d)) : (l.current && cancelAnimationFrame(l.current), s.current = 0), () => {
    l.current && cancelAnimationFrame(l.current);
  }), [t.isPlaying, d]);
  const m = X(() => {
    e.play();
  }, [e]), v = X(() => {
    e.pause();
  }, [e]), u = X(() => {
    t.isPlaying ? v() : m();
  }, [t.isPlaying, m, v]), N = X((p) => {
    const Z = Math.max(0, Math.min(p, t.duration));
    e.seek(Z);
  }, [t.duration, e]), g = X(() => {
    N(0);
  }, [N]), L = X(() => {
    N(t.duration);
  }, [N, t.duration]), W = X((p) => me(p, { fps: r.fps, showFrames: !0, showHours: !0 }), [r.fps]);
  return {
    // State
    currentTime: t.currentTime,
    duration: t.duration,
    isPlaying: t.isPlaying,
    // Actions
    play: m,
    pause: v,
    togglePlayPause: u,
    seek: N,
    skipToStart: g,
    skipToEnd: L,
    // Utilities
    formatTime: W
  };
}
function xe() {
  return xe = Object.assign ? Object.assign.bind() : function(t) {
    for (var e = 1; e < arguments.length; e++) {
      var r = arguments[e];
      for (var l in r) ({}).hasOwnProperty.call(r, l) && (t[l] = r[l]);
    }
    return t;
  }, xe.apply(null, arguments);
}
var Le = ["shift", "alt", "meta", "mod", "ctrl"], fn = {
  esc: "escape",
  return: "enter",
  ".": "period",
  ",": "comma",
  "-": "slash",
  " ": "space",
  "`": "backquote",
  "#": "backslash",
  "+": "bracketright",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  AltLeft: "alt",
  AltRight: "alt",
  MetaLeft: "meta",
  MetaRight: "meta",
  OSLeft: "meta",
  OSRight: "meta",
  ControlLeft: "ctrl",
  ControlRight: "ctrl"
};
function qt(t) {
  return (t && fn[t] || t || "").trim().toLowerCase().replace(/key|digit|numpad|arrow/, "");
}
function pn(t) {
  return Le.includes(t);
}
function Ie(t, e) {
  return e === void 0 && (e = ","), t.split(e);
}
function ye(t, e, r) {
  e === void 0 && (e = "+");
  var l = t.toLocaleLowerCase().split(e).map(function(m) {
    return qt(m);
  }), s = {
    alt: l.includes("alt"),
    ctrl: l.includes("ctrl") || l.includes("control"),
    shift: l.includes("shift"),
    meta: l.includes("meta"),
    mod: l.includes("mod")
  }, d = l.filter(function(m) {
    return !Le.includes(m);
  });
  return xe({}, s, {
    keys: d,
    description: r,
    hotkey: t
  });
}
(function() {
  typeof document < "u" && (document.addEventListener("keydown", function(t) {
    t.key !== void 0 && Fe([qt(t.key), qt(t.code)]);
  }), document.addEventListener("keyup", function(t) {
    t.key !== void 0 && ze([qt(t.key), qt(t.code)]);
  })), typeof window < "u" && window.addEventListener("blur", function() {
    Zt.clear();
  });
})();
var Zt = /* @__PURE__ */ new Set();
function Ee(t) {
  return Array.isArray(t);
}
function mn(t, e) {
  e === void 0 && (e = ",");
  var r = Ee(t) ? t : t.split(e);
  return r.every(function(l) {
    return Zt.has(l.trim().toLowerCase());
  });
}
function Fe(t) {
  var e = Array.isArray(t) ? t : [t];
  Zt.has("meta") && Zt.forEach(function(r) {
    return !pn(r) && Zt.delete(r.toLowerCase());
  }), e.forEach(function(r) {
    return Zt.add(r.toLowerCase());
  });
}
function ze(t) {
  var e = Array.isArray(t) ? t : [t];
  t === "meta" ? Zt.clear() : e.forEach(function(r) {
    return Zt.delete(r.toLowerCase());
  });
}
function Tn(t, e, r) {
  (typeof r == "function" && r(t, e) || r === !0) && t.preventDefault();
}
function gn(t, e, r) {
  return typeof r == "function" ? r(t, e) : r === !0 || r === void 0;
}
function hn(t) {
  return Ue(t, ["input", "textarea", "select"]);
}
function Ue(t, e) {
  e === void 0 && (e = !1);
  var r = t.target, l = t.composed, s = null;
  return In(r) && l ? s = t.composedPath()[0] && t.composedPath()[0].tagName : s = r && r.tagName, Ee(e) ? !!(s && e && e.some(function(d) {
    var m;
    return d.toLowerCase() === ((m = s) == null ? void 0 : m.toLowerCase());
  })) : !!(s && e && e);
}
function In(t) {
  return !!t.tagName && !t.tagName.startsWith("-") && t.tagName.includes("-");
}
function yn(t, e) {
  return t.length === 0 && e ? (console.warn('A hotkey has the "scopes" option set, however no active scopes were found. If you want to use the global scopes feature, you need to wrap your app in a <HotkeysProvider>'), !0) : e ? t.some(function(r) {
    return e.includes(r);
  }) || t.includes("*") : !0;
}
var On = function(e, r, l) {
  l === void 0 && (l = !1);
  var s = r.alt, d = r.meta, m = r.mod, v = r.shift, u = r.ctrl, N = r.keys, g = e.key, L = e.code, W = e.ctrlKey, p = e.metaKey, Z = e.shiftKey, C = e.altKey, j = qt(L), D = g.toLowerCase();
  if (!(N != null && N.includes(j)) && !(N != null && N.includes(D)) && !["ctrl", "control", "unknown", "meta", "alt", "shift", "os"].includes(j))
    return !1;
  if (!l) {
    if (s === !C && D !== "alt" || v === !Z && D !== "shift")
      return !1;
    if (m) {
      if (!p && !W)
        return !1;
    } else if (d === !p && D !== "meta" && D !== "os" || u === !W && D !== "ctrl" && D !== "control")
      return !1;
  }
  return N && N.length === 1 && (N.includes(D) || N.includes(j)) ? !0 : N ? mn(N) : !N;
}, vn = /* @__PURE__ */ we(void 0), xn = function() {
  return Ce(vn);
};
function Be(t, e) {
  return t && e && typeof t == "object" && typeof e == "object" ? Object.keys(t).length === Object.keys(e).length && //@ts-ignore
  Object.keys(t).reduce(function(r, l) {
    return r && Be(t[l], e[l]);
  }, !0) : t === e;
}
var Sn = /* @__PURE__ */ we({
  hotkeys: [],
  enabledScopes: [],
  toggleScope: function() {
  },
  enableScope: function() {
  },
  disableScope: function() {
  }
}), wn = function() {
  return Ce(Sn);
};
function Cn(t) {
  var e = zt(void 0);
  return Be(e.current, t) || (e.current = t), e.current;
}
var Me = function(e) {
  e.stopPropagation(), e.preventDefault(), e.stopImmediatePropagation();
}, En = typeof window < "u" ? Ve : se;
function te(t, e, r, l) {
  var s = Gt(null), d = s[0], m = s[1], v = zt(!1), u = r instanceof Array ? l instanceof Array ? void 0 : l : r, N = Ee(t) ? t.join(u?.splitKey) : t, g = r instanceof Array ? r : l instanceof Array ? l : void 0, L = X(e, g ?? []), W = zt(L);
  g ? W.current = L : W.current = e;
  var p = Cn(u), Z = wn(), C = Z.enabledScopes, j = xn();
  return En(function() {
    if (!(p?.enabled === !1 || !yn(C, p?.scopes))) {
      var D = function(h, w) {
        var $;
        if (w === void 0 && (w = !1), !(hn(h) && !Ue(h, p?.enableOnFormTags))) {
          if (d !== null) {
            var x = d.getRootNode();
            if ((x instanceof Document || x instanceof ShadowRoot) && x.activeElement !== d && !d.contains(x.activeElement)) {
              Me(h);
              return;
            }
          }
          ($ = h.target) != null && $.isContentEditable && !(p != null && p.enableOnContentEditable) || Ie(N, p?.splitKey).forEach(function(tt) {
            var rt, pt = ye(tt, p?.combinationKey);
            if (On(h, pt, p?.ignoreModifiers) || (rt = pt.keys) != null && rt.includes("*")) {
              if (p != null && p.ignoreEventWhen != null && p.ignoreEventWhen(h) || w && v.current)
                return;
              if (Tn(h, pt, p?.preventDefault), !gn(h, pt, p?.enabled)) {
                Me(h);
                return;
              }
              W.current(h, pt), w || (v.current = !0);
            }
          });
        }
      }, c = function(h) {
        h.key !== void 0 && (Fe(qt(h.code)), (p?.keydown === void 0 && p?.keyup !== !0 || p != null && p.keydown) && D(h));
      }, B = function(h) {
        h.key !== void 0 && (ze(qt(h.code)), v.current = !1, p != null && p.keyup && D(h, !0));
      }, F = d || u?.document || document;
      return F.addEventListener("keyup", B, u?.eventListenerOptions), F.addEventListener("keydown", c, u?.eventListenerOptions), j && Ie(N, p?.splitKey).forEach(function(q) {
        return j.addHotkey(ye(q, p?.combinationKey, p?.description));
      }), function() {
        F.removeEventListener("keyup", B, u?.eventListenerOptions), F.removeEventListener("keydown", c, u?.eventListenerOptions), j && Ie(N, p?.splitKey).forEach(function(q) {
          return j.removeHotkey(ye(q, p?.combinationKey, p?.description));
        });
      };
    }
  }, [d, N, p, C]), m;
}
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nn = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), $e = (...t) => t.filter((e, r, l) => !!e && l.indexOf(e) === r).join(" ");
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Rn = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bn = _e(
  ({
    color: t = "currentColor",
    size: e = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: l,
    className: s = "",
    children: d,
    iconNode: m,
    ...v
  }, u) => ve(
    "svg",
    {
      ref: u,
      ...Rn,
      width: e,
      height: e,
      stroke: t,
      strokeWidth: l ? Number(r) * 24 / Number(e) : r,
      className: $e("lucide", s),
      ...v
    },
    [
      ...m.map(([N, g]) => ve(N, g)),
      ...Array.isArray(d) ? d : [d]
    ]
  )
);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ht = (t, e) => {
  const r = _e(
    ({ className: l, ...s }, d) => ve(bn, {
      ref: d,
      iconNode: e,
      className: $e(`lucide-${Nn(t)}`, l),
      ...s
    })
  );
  return r.displayName = `${t}`, r;
};
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Dn = Ht("Pause", [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mn = Ht("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const An = Ht("Redo2", [
  ["path", { d: "m15 14 5-5-5-5", key: "12vg1m" }],
  ["path", { d: "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13", key: "6uklza" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _n = Ht("SkipBack", [
  ["polygon", { points: "19 20 9 12 19 4 19 20", key: "o2sva" }],
  ["line", { x1: "5", x2: "5", y1: "19", y2: "5", key: "1ocqjk" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kn = Ht("SkipForward", [
  ["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }],
  ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pn = Ht("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jn = Ht("Undo2", [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ln = Ht("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
/**
 * @license lucide-react v0.438.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fn = Ht("ZoomIn", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
]), zn = () => {
  const { currentTime: t, duration: e, isPlaying: r, togglePlayPause: l, skipToStart: s, skipToEnd: d, formatTime: m } = un(), { state: v, actions: u, settings: N } = Ut(), g = u.canUndo(), L = u.canRedo(), W = (C) => {
    const j = parseFloat(C.target.value);
    u.setZoom(j);
  }, p = () => {
    const C = cn(N.fps, N.pixelsPerSecond);
    u.setZoom(C);
  };
  te("alt+space", (C) => {
    C.preventDefault(), l();
  }, { enableOnFormTags: !0 }, [l]), te("alt+=, alt+plus", (C) => {
    C.preventDefault(), u.setZoom(Math.min(v.zoom + 0.1, 20));
  }, {}, [v.zoom, u]), te("alt+-, alt+minus", (C) => {
    C.preventDefault(), u.setZoom(Math.max(v.zoom - 0.1, 0.1));
  }, {}, [v.zoom, u]), te("alt+f", (C) => {
    C.preventDefault(), p();
  }, {}, [p]), te("ctrl+z", (C) => {
    C.preventDefault(), g && u.undo();
  }, { enableOnFormTags: !0 }, [g, u]), te("ctrl+shift+z", (C) => {
    C.preventDefault(), L && u.redo();
  }, { enableOnFormTags: !0 }, [L, u]), te("delete", (C) => {
    C.preventDefault(), Z();
  }, { enableOnFormTags: !0 }, [v.selectedOverlayIds, u]);
  const Z = () => {
    if (v.selectedOverlayIds.length === 0) return;
    const C = /* @__PURE__ */ new Set();
    v.selectedOverlayIds.forEach((j) => {
      const D = v.overlays.find((c) => c.id === j);
      D && (C.add(j), (D.type === o.CLIP || D.type === o.SOUND || D.type === o.TEXT || D.type === o.IMAGE || D.type === o.CAPTION) && (D.transitionInId && C.add(D.transitionInId), D.transitionOutId && C.add(D.transitionOutId)));
    }), u.deleteOverlays(Array.from(C)), u.clearSelection();
  };
  return /* @__PURE__ */ f.jsxs("div", { className: "timeline-header", children: [
    /* @__PURE__ */ f.jsxs("div", { className: "timeline-controls", children: [
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: s,
          title: "Skip to start",
          children: /* @__PURE__ */ f.jsx(_n, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: l,
          title: r ? "Pause" : "Play",
          children: r ? /* @__PURE__ */ f.jsx(Dn, { size: 16 }) : /* @__PURE__ */ f.jsx(Mn, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: d,
          title: "Skip to end",
          children: /* @__PURE__ */ f.jsx(kn, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx("div", { className: "timeline-divider" }),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: u.undo,
          disabled: !g,
          title: "Undo (Ctrl+Z)",
          children: /* @__PURE__ */ f.jsx(jn, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: u.redo,
          disabled: !L,
          title: "Redo (Ctrl+Shift+Z)",
          children: /* @__PURE__ */ f.jsx(An, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx("div", { className: "timeline-divider" }),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: Z,
          disabled: v.selectedOverlayIds.length === 0,
          title: "Delete selected (Delete)",
          children: /* @__PURE__ */ f.jsx(Pn, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsxs("div", { className: "time-display", children: [
        m(t),
        " / ",
        m(e)
      ] })
    ] }),
    /* @__PURE__ */ f.jsxs("div", { className: "timeline-settings", children: [
      /* @__PURE__ */ f.jsxs("label", { htmlFor: "zoom-slider", children: [
        "Zoom: ",
        v.zoom.toFixed(1),
        "x"
      ] }),
      /* @__PURE__ */ f.jsx(
        "input",
        {
          id: "zoom-slider",
          type: "range",
          min: "0.1",
          max: "20",
          step: "0.1",
          value: v.zoom,
          onChange: W,
          style: { marginLeft: "8px", width: "100px" }
        }
      ),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: p,
          title: "Zoom to show individual frames",
          style: { marginLeft: "8px" },
          children: /* @__PURE__ */ f.jsx(Fn, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "control-button",
          onClick: () => u.clearSelection(),
          title: "Clear selection",
          children: /* @__PURE__ */ f.jsx(Ln, { size: 16 })
        }
      ),
      /* @__PURE__ */ f.jsx("div", { className: "selected-count", children: v.selectedOverlayIds.length > 0 && /* @__PURE__ */ f.jsxs("span", { children: [
        v.selectedOverlayIds.length,
        " selected"
      ] }) })
    ] })
  ] });
};
function Ge(t = {}) {
  const { state: e, settings: r, dragInfo: l, actions: s } = Ut(), [d, m] = Gt(!1), [v, u] = Gt(!1), N = 5, g = zt(null), L = zt(e);
  L.current = e;
  const W = (a, i = 0) => {
    i > 1 || setTimeout(() => {
      const _ = L.current, O = _.overlays.find((b) => b.id === a);
      if (!O)
        return;
      let I = !1;
      if (O.type === o.CLIP) {
        const b = pt(O, _);
        if (b !== O.startTime) {
          const G = c(b - O.startTime), H = C(O);
          H.forEach((S) => {
            if (S.type === o.CLIP) {
              const J = c(S.startTime + G);
              s.updateOverlay(S.id, { startTime: J });
            }
          }), setTimeout(() => {
            const S = L.current;
            console.log("processAfterMove: updating transition positions after snap"), H.forEach((J) => {
              if (J.type === o.TRANSITION_IN || J.type === o.TRANSITION_OUT) {
                const A = J.parentClipId, Y = S.overlays.find((et) => et.id === A);
                if (Y) {
                  let et;
                  J.type === o.TRANSITION_IN ? et = Y.startTime - J.duration : et = Y.startTime + Y.duration, console.log("processAfterMove: updating transition", J.id, "from", J.startTime, "to", c(et)), s.updateOverlay(J.id, { startTime: c(et), row: Y.row });
                }
              } else if (J.type === o.TRANSITION_MERGED) {
                const A = J, Y = S.overlays.find((et) => et.id === A.fromClipId);
                if (Y) {
                  const et = c(Y.startTime + Y.duration);
                  console.log("processAfterMove: updating merged transition position", A.id, "to", et), s.updateOverlay(A.id, { startTime: et, row: Y.row });
                }
              }
            });
          }, 0), I = !0;
        }
      }
      setTimeout(() => {
        const b = L.current, G = b.overlays.find((J) => J.id === a) || O;
        console.log("processAfterMove: transition checks for overlay", a, "after snap:", I);
        const H = p(G, b);
        H && (console.log("processAfterMove: transition overlap -> merging", H), s.mergeTransitions(H.transitionOutId, H.transitionInId));
        const S = Z(G, b);
        S && (console.log("processAfterMove: adjacent transition merge -> merging", S), s.mergeTransitions(S.transitionOutId, S.transitionInId)), I && W(a, i + 1);
      }, I ? 20 : 0);
    }, 0);
  }, p = X((a, i) => {
    if (a.type !== o.TRANSITION_IN && a.type !== o.TRANSITION_OUT && a.type !== o.TRANSITION_MERGED)
      return null;
    const _ = a.startTime + a.duration, O = i.overlays.filter((I) => {
      if (I.id === a.id || I.row !== a.row || I.type !== o.TRANSITION_IN && I.type !== o.TRANSITION_OUT && I.type !== o.TRANSITION_MERGED) return !1;
      const E = I.startTime + I.duration;
      return !(_ <= I.startTime || a.startTime >= E);
    });
    if (O.length > 0) {
      const I = O[0];
      if (a.type === o.TRANSITION_OUT && I.type === o.TRANSITION_IN)
        return { transitionOutId: a.id, transitionInId: I.id };
      if (a.type === o.TRANSITION_IN && I.type === o.TRANSITION_OUT)
        return { transitionOutId: I.id, transitionInId: a.id };
    }
    return null;
  }, []), Z = X((a, i) => {
    console.log("checkForTransitionMerge: Checking overlay", a.id, "type:", a.type);
    const O = ((A) => {
      if (A.type === o.CLIP)
        return A;
      if (A.type === o.TRANSITION_IN || A.type === o.TRANSITION_OUT) {
        const Y = A.parentClipId;
        return i.overlays.find((et) => et.id === Y && et.type === o.CLIP);
      }
      return A.type === o.TRANSITION_MERGED, null;
    })(a);
    if (console.log("checkForTransitionMerge: Base clip found:", O?.id || "none"), !O)
      return null;
    const I = i.overlays.filter((A) => A.type === o.CLIP && A.row === O.row).sort((A, Y) => A.startTime - Y.startTime), E = I.findIndex((A) => A.id === O.id);
    if (E === -1)
      return null;
    const b = (A) => i.overlays.find((Y) => Y.id === i.overlays.find((et) => et.id === A)?.transitionOutId), G = (A) => i.overlays.find((Y) => Y.id === i.overlays.find((et) => et.id === A)?.transitionInId), H = (A, Y) => i.overlays.some((et) => et.type === o.TRANSITION_MERGED && et.fromClipId === A && et.toClipId === Y), S = I[E + 1];
    if (console.log("checkForTransitionMerge: Checking right neighbor:", S?.id || "none"), S && !H(O.id, S.id)) {
      const A = b(O.id), Y = G(S.id);
      if (console.log("checkForTransitionMerge: Found transitions - leftOut:", A?.id || "none", "rightIn:", Y?.id || "none"), I.filter((dt) => dt.startTime > O.startTime && dt.startTime < S.startTime).length === 0 && A && Y) {
        const dt = A.startTime + A.duration, Dt = Y.startTime;
        if (console.log("checkForTransitionMerge: leftOut/rightIn timing ->", dt, Dt, "overlap?", Dt <= dt), console.log("checkForTransitionMerge: leftOut details ->", A.startTime, "+", A.duration, "=", dt), console.log("checkForTransitionMerge: rightIn details ->", Y.startTime), Dt <= dt)
          return console.log("checkForTransitionMerge: MATCH (leftOut-rightIn)"), { transitionOutId: A.id, transitionInId: Y.id };
      }
    }
    const J = I[E - 1];
    if (console.log("checkForTransitionMerge: Checking left neighbor:", J?.id || "none"), J && !H(J.id, O.id)) {
      const A = b(J.id), Y = G(O.id);
      if (console.log("checkForTransitionMerge: Found transitions (left neighbor) - leftOut:", A?.id || "none", "rightIn:", Y?.id || "none"), I.filter((dt) => dt.startTime > J.startTime && dt.startTime < O.startTime).length === 0 && A && Y) {
        const dt = A.startTime + A.duration, Dt = Y.startTime;
        if (console.log("checkForTransitionMerge: leftOut/rightIn timing ->", dt, Dt, "overlap?", Dt <= dt), console.log("checkForTransitionMerge: leftOut details ->", A.startTime, "+", A.duration, "=", dt), console.log("checkForTransitionMerge: rightIn details ->", Y.startTime), Dt <= dt)
          return console.log("checkForTransitionMerge: MATCH (leftOut-rightIn) [left neighbor]"), { transitionOutId: A.id, transitionInId: Y.id };
      }
    }
    return null;
  }, []), C = X((a) => {
    const i = [a];
    if (a.type === o.TRANSITION_IN || a.type === o.TRANSITION_OUT) {
      const _ = a.parentClipId, O = e.overlays.find((I) => I.id === _);
      if (O) {
        if (i.push(O), a.type === o.TRANSITION_IN && O.transitionOutId) {
          const E = e.overlays.find((b) => b.id === O.transitionOutId);
          E && i.push(E);
        } else if (a.type === o.TRANSITION_OUT && O.transitionInId) {
          const E = e.overlays.find((b) => b.id === O.transitionInId);
          E && i.push(E);
        }
        const I = e.overlays.find((E) => E.type === o.TRANSITION_MERGED && (E.fromClipId === O.id || E.toClipId === O.id));
        if (I) {
          console.log(`${a.type === o.TRANSITION_IN ? "Transition-in" : "Transition-out"} movement: including entire merged transition group`), i.push(I);
          const E = I.fromClipId === O.id ? I.toClipId : I.fromClipId, b = e.overlays.find((G) => G.id === E);
          if (b) {
            if (i.push(b), b.transitionInId) {
              const G = e.overlays.find((H) => H.id === b.transitionInId);
              G && i.push(G);
            }
            if (b.transitionOutId) {
              const G = e.overlays.find((H) => H.id === b.transitionOutId);
              G && i.push(G);
            }
          }
        }
      }
    } else if (a.type === o.TRANSITION_MERGED) {
      const _ = a, O = e.overlays.find((E) => E.id === _.fromClipId), I = e.overlays.find((E) => E.id === _.toClipId);
      if (O) {
        if (i.push(O), O.transitionInId) {
          const E = e.overlays.find((b) => b.id === O.transitionInId);
          E && i.push(E);
        }
        if (O.transitionOutId) {
          const E = e.overlays.find((b) => b.id === O.transitionOutId);
          E && i.push(E);
        }
      }
      if (I) {
        if (i.push(I), I.transitionInId) {
          const E = e.overlays.find((b) => b.id === I.transitionInId);
          E && i.push(E);
        }
        if (I.transitionOutId) {
          const E = e.overlays.find((b) => b.id === I.transitionOutId);
          E && i.push(E);
        }
      }
    } else {
      if (a.transitionInId) {
        const O = e.overlays.find((I) => I.id === a.transitionInId);
        O && i.push(O);
      }
      if (a.transitionOutId) {
        const O = e.overlays.find((I) => I.id === a.transitionOutId);
        O && i.push(O);
      }
      const _ = e.overlays.find((O) => O.type === o.TRANSITION_MERGED && (O.fromClipId === a.id || O.toClipId === a.id));
      if (_) {
        i.push(_);
        const O = _.fromClipId === a.id ? _.toClipId : _.fromClipId, I = e.overlays.find((E) => E.id === O);
        if (I) {
          if (i.push(I), I.transitionInId) {
            const E = e.overlays.find((b) => b.id === I.transitionInId);
            E && i.push(E);
          }
          if (I.transitionOutId) {
            const E = e.overlays.find((b) => b.id === I.transitionOutId);
            E && i.push(E);
          }
        }
      }
    }
    return i;
  }, [e.overlays]), j = X((a) => a / (r.pixelsPerSecond * e.zoom), [r.pixelsPerSecond, e.zoom]), D = X((a) => a * r.pixelsPerSecond * e.zoom, [r.pixelsPerSecond, e.zoom]), c = X((a) => {
    if (!r.snapToGrid)
      return a;
    if (a === 0)
      return 0;
    const i = 1 / r.fps;
    return Math.round(a / i) * i;
  }, [r.snapToGrid, r.fps]), B = X((a) => a.length / a.speed, []), F = X((a) => {
    const i = B(a), _ = e.overlays.find(
      (S) => S.type === o.TRANSITION_MERGED && S.toClipId === a.id
    ), O = e.overlays.find((S) => S.id === a.transitionInId), I = e.overlays.find((S) => S.id === a.transitionOutId), E = _ ? a.trimmedIn : Math.max(0, a.trimmedIn), b = Math.max(0, a.trimmedOut), G = (O?.duration || 0) + a.duration + (I?.duration || 0) + (_ ? _.duration : 0), H = Math.max(0, i - G);
    return { trimIn: E, trimOut: Math.min(b, H + b) };
  }, [B, e.overlays]), q = X((a) => {
    const i = e.overlays.find((I) => I.id === a && I.type === o.CLIP);
    if (!i) return;
    const { trimIn: _, trimOut: O } = F(i);
    (Math.abs(i.trimmedIn - _) > 0.01 || Math.abs(i.trimmedOut - O) > 0.01) && s.updateOverlay(a, {
      trimmedIn: _,
      trimmedOut: O
    });
  }, [e.overlays, F, s]), h = X(() => {
    e.overlays.forEach((a) => {
      a.type === o.CLIP && q(a.id);
    });
  }, [e.overlays, q]);
  se(() => {
    const a = setTimeout(() => {
      h();
    }, 100);
    return () => clearTimeout(a);
  }, []);
  const w = X((a, i, _, O) => {
    const I = B(a), E = a.transitionInId ? e.overlays.find((dt) => dt.id === a.transitionInId) : null, b = a.transitionOutId ? e.overlays.find((dt) => dt.id === a.transitionOutId) : null, G = e.overlays.find(
      (dt) => dt.type === o.TRANSITION_MERGED && (dt.fromClipId === a.id || dt.toClipId === a.id)
    ), H = _ ?? (E?.duration || 0), S = O ?? (b?.duration || 0), J = i ?? a.duration, A = G?.duration || 0, Y = G ? H + J + A + S : H + J + S, et = I;
    return {
      isValid: Y <= et,
      maxAllowedDuration: et,
      currentTotal: Y
    };
  }, [e.overlays, B]), $ = X((a, i) => {
    let _;
    if (a.type === o.CLIP)
      _ = a;
    else if (a.type === o.TRANSITION_IN || a.type === o.TRANSITION_OUT) {
      const E = a.parentClipId;
      _ = e.overlays.find((b) => b.id === E);
    }
    if (!_) return a.duration;
    const { trimIn: O, trimOut: I } = F(_);
    return a.type === o.CLIP ? i === "start" ? a.duration + O : a.duration + I : a.type === o.TRANSITION_IN ? i === "start" ? a.duration + O : Math.min(a.duration + I, _.duration) : a.type === o.TRANSITION_OUT ? i === "start" ? Math.min(a.duration + O, _.duration) : a.duration + I : a.duration;
  }, [e.overlays, B, F]), x = X((a, i) => {
    let _;
    if (a.type === o.CLIP)
      _ = a;
    else if (a.type === o.TRANSITION_IN || a.type === o.TRANSITION_OUT) {
      const A = a.parentClipId;
      _ = e.overlays.find((Y) => Y.id === A);
    }
    if (!_) return a.duration;
    const O = B(_), I = _.transitionInId ? e.overlays.find((A) => A.id === _.transitionInId) : null, E = _.transitionOutId ? e.overlays.find((A) => A.id === _.transitionOutId) : null, b = e.overlays.find(
      (A) => A.type === o.TRANSITION_MERGED && (A.fromClipId === _.id || A.toClipId === _.id)
    ), G = I?.duration || 0, H = E?.duration || 0, S = _.duration, J = b?.duration || 0;
    switch (i) {
      case "clip":
        return O - G - H - J;
      case "transition-in":
        return O - S - H - J;
      case "transition-out":
        return O - S - G - J;
      default:
        return a.duration;
    }
  }, [e.overlays, B]), tt = X((a, i, _) => {
    if (a.type === o.CLIP)
      return !1;
    const O = _ ?? a.duration, I = i + O, E = C(a), b = new Set(E.map((G) => G.id));
    return e.overlays.some((G) => {
      if (b.has(G.id) || G.row !== a.row)
        return !1;
      const H = G.startTime + G.duration;
      return !(I <= G.startTime || i >= H);
    });
  }, [e.overlays, C]), rt = X((a, i) => {
    let _ = i;
    const O = 1 / r.fps, I = 100;
    if (!tt(a, _))
      return c(_);
    for (let E = 1; E <= I; E++) {
      const b = i + O * E, G = i - O * E;
      if (b >= 0 && !tt(a, b))
        return c(b);
      if (G >= 0 && !tt(a, G))
        return c(G);
    }
    return a.startTime;
  }, [tt, c, r.fps]), pt = X((a, i) => {
    if (a.type !== o.CLIP)
      return a.startTime;
    const _ = a.startTime + a.duration, O = C(a), I = new Set(O.map((H) => H.id));
    console.log("Checking overlaps for clip:", a.id, "position:", a.startTime, "to", _, "on row:", a.row), console.log("Related IDs to exclude:", Array.from(I));
    const E = i.overlays.filter((H) => {
      if (I.has(H.id) || H.row !== a.row || H.type !== o.CLIP)
        return !1;
      const S = H.startTime + H.duration, J = !(_ <= H.startTime || a.startTime >= S);
      return console.log("Checking against clip:", H.id, "position:", H.startTime, "to", S, "overlap:", J), J;
    });
    if (console.log("Found overlapping clips:", E.length, E.map((H) => H.id)), E.length === 0)
      return a.startTime;
    let b = a.startTime, G = 1 / 0;
    return E.forEach((H) => {
      const S = H.startTime + H.duration, J = i.overlays.find((Lt) => Lt.id === a.transitionOutId), A = i.overlays.find((Lt) => Lt.id === H.transitionInId);
      let Y = 0;
      J && A && (Y = J.duration + A.duration, console.log("Calculated merged transition space needed:", Y, "for clips", a.id, "and", H.id));
      const et = H.startTime - a.duration - Y, dt = Math.abs(et - a.startTime), Dt = S, jt = Math.abs(Dt - a.startTime);
      console.log("Snap options for", H.id, "- Left:", et, "(distance:", dt, ") Right:", Dt, "(distance:", jt, ")"), et >= 0 && dt < G && (G = dt, b = et, console.log("Best snap updated to left position:", et, "with merged space:", Y)), jt < G && (G = jt, b = Dt, console.log("Best snap updated to right position:", Dt));
    }), c(b);
  }, [C, c]), mt = X((a, i) => {
    a.preventDefault(), a.stopPropagation();
    const _ = document.getElementById(`overlay-${i.id}`);
    if (!_)
      return;
    const O = _.getBoundingClientRect(), I = a.clientX - O.left, E = O.width;
    let b = "move";
    const G = 12, H = 12;
    i.type === o.TRANSITION_IN ? I <= H && (b = "resize-left") : i.type === o.TRANSITION_OUT ? I >= E - H && (b = "resize-right") : (i.type, o.TRANSITION_MERGED, I <= G ? b = "resize-left" : I >= E - G && (b = "resize-right")), console.log("Drag detection:", {
      clickX: I,
      overlayWidth: E,
      resizeHandleWidth: G,
      dragType: b,
      rightThreshold: E - G,
      targetElement: a.currentTarget.className
    }), i.selected || s.selectOverlay(i.id, a.ctrlKey || a.metaKey);
    const S = {
      overlayId: i.id,
      startX: a.clientX,
      startTime: i.startTime,
      originalStartTime: i.startTime,
      originalDuration: i.duration,
      dragType: b
    }, J = { x: a.clientX, y: a.clientY };
    s.startDrag(S), t.onDragStart?.(i);
    let A = !1;
    const Y = (dt) => {
      const Dt = dt.clientX - J.x, jt = dt.clientY - J.y, Lt = Math.sqrt(Dt * Dt + jt * jt);
      if (!A && Lt > N && (A = !0, m(!0)), A) {
        const ue = dt.clientX - S.startX, At = j(ue);
        if (S.dragType === "move") {
          const xt = (() => {
            if (i.type === o.CLIP)
              return i;
            if (i.type === o.TRANSITION_IN || i.type === o.TRANSITION_OUT) {
              const R = i.parentClipId;
              return e.overlays.find((U) => U.id === R) || i;
            }
            if (i.type === o.TRANSITION_MERGED) {
              const R = i.fromClipId;
              return e.overlays.find((U) => U.id === R) || i;
            }
            return i;
          })(), Ot = e.overlays.find((R) => R.id === xt.id) || xt, Bt = Math.max(0, Ot.startTime + At), ht = Math.max(0, e.duration - Ot.duration);
          let Rt = Math.min(Bt, ht);
          const Ft = C(i), wt = Rt - Ot.startTime;
          Ft.forEach((R) => {
            if (R.type === o.TRANSITION_IN) {
              const U = e.overlays.find((P) => P.id === R.parentClipId);
              if (U && U.startTime + wt - R.duration < 0) {
                const it = R.duration;
                U.startTime <= it ? (console.log("Movement blocked: transition-in already at frame 0 limit"), Rt = Ot.startTime) : Ot.startTime + wt < it && (Rt = Ot.startTime - (U.startTime - it), console.log("Movement constrained to prevent transition-in going below frame 0"));
              }
            }
            if (R.type === o.TRANSITION_OUT) {
              const U = e.overlays.find((P) => P.id === R.parentClipId);
              if (U && U.startTime + wt + U.duration + R.duration > e.duration) {
                const k = e.duration - (U.startTime + U.duration + R.duration);
                k <= 0 ? Rt = Ot.startTime : Rt = Math.min(Rt, Ot.startTime + k);
              }
            }
          });
          const st = Ot.type === o.CLIP ? c(Rt) : rt(Ot, Rt), y = c(st - Ot.startTime);
          C(i).forEach((R) => {
            const U = c(R.startTime + y);
            if (R.type === o.TRANSITION_IN) {
              const P = e.overlays.find((nt) => nt.id === R.parentClipId);
              if (P) {
                const it = c(P.startTime + y) - R.duration, k = Math.max(0, it);
                s.updateOverlayBatch(R.id, { startTime: k, row: P.row });
                return;
              }
            }
            if (R.type === o.TRANSITION_OUT) {
              const P = e.overlays.find((nt) => nt.id === R.parentClipId);
              if (P) {
                const it = c(P.startTime + y) + P.duration, k = Math.min(it, e.duration - R.duration), ot = Math.max(0, k);
                s.updateOverlayBatch(R.id, { startTime: ot, row: P.row });
                return;
              }
            }
            s.updateOverlayBatch(R.id, { startTime: U });
          });
        } else if (S.dragType === "resize-left") {
          if (i.type === o.TRANSITION_IN) {
            const st = 2 / r.fps, y = Math.max(st, S.originalDuration - At), z = e.overlays.find((it) => it.id === i.parentClipId);
            let R = y;
            if (z) {
              const it = z.startTime;
              R = Math.min(y, it);
            }
            const U = R > S.originalDuration, P = U ? $(i, "start") : x(i, "transition-in"), nt = Math.max(st, Math.min(R, P));
            if (console.log("Transition-in resize debug:", {
              originalDuration: S.originalDuration,
              deltaTime: At,
              requestedDuration: y,
              isExtending: U,
              maxAllowed: P,
              newDuration: nt,
              snappedDuration: c(nt)
            }), z) {
              const k = e.overlays.find((Ct) => Ct.id === z.transitionInId)?.duration || 0, ot = c(nt), It = Math.max(0, z.trimmedIn);
              let ct = k, ut = 0;
              if (ot > k) {
                const Ct = ot - k, Mt = Math.min(Ct, It);
                ct = k + Mt, ut = -Mt;
              } else if (ot < k) {
                const Ct = k - ot, Mt = Math.min(Ct, It);
                ct = k - Mt, ut = +Mt;
              }
              ct = Math.max(st, ct);
              const Q = z.startTime - ct, K = ct, yt = z.trimmedIn, vt = Math.max(0, yt + ut), St = z.trimmedOut;
              s.updateOverlayBatch(i.id, { startTime: Q, duration: K, row: z.row }), s.updateOverlayBatch(z.id, {
                trimmedIn: vt,
                trimmedOut: St
              });
            } else
              s.updateOverlayBatch(i.id, { duration: c(nt) });
            return;
          } else {
            if (i.type === o.TRANSITION_OUT)
              return;
            if (i.type === o.TRANSITION_MERGED) {
              const st = i, y = e.overlays.find((R) => R.id === st.fromClipId), z = e.overlays.find((R) => R.id === st.toClipId);
              if (y && z && y.type === o.CLIP && z.type === o.CLIP) {
                const R = 2 / r.fps, U = i.startTime, P = i.startTime + i.duration, nt = At;
                if (nt > 0) {
                  const it = Math.max(0, P - R - U), k = Math.max(0, Math.min(nt, it));
                  if (k === 0) return;
                  const ot = Math.max(R, y.duration + k), It = U + k, ct = P - It;
                  s.updateOverlayBatch(y.id, {
                    duration: c(ot),
                    trimmedOut: y.trimmedOut
                  }), s.updateOverlayBatch(i.id, {
                    startTime: c(It),
                    duration: c(ct)
                  });
                  const ut = e.overlays.find((St) => St.id === z.transitionInId), Q = (ut?.duration || 0) + c(i.duration), yt = (ut?.duration || 0) + c(ct) - Q, vt = Math.max(0, z.trimmedIn - yt);
                  if (s.updateOverlayBatch(z.id, {
                    trimmedIn: vt,
                    trimmedOut: z.trimmedOut
                  }), y.transitionOutId && y.transitionOutId !== i.id && e.overlays.find((Ct) => Ct.id === y.transitionOutId)) {
                    const Ct = y.startTime + c(ot);
                    s.updateOverlayBatch(y.transitionOutId, { startTime: Ct, row: y.row });
                  }
                } else if (nt < 0) {
                  const it = -nt, k = e.overlays.find((Vt) => Vt.id === z.transitionInId), ot = 1 / r.fps, It = c(i.duration), ct = Math.max(0, z.trimmedIn + (k?.duration || 0)), ut = Math.max(0, ct), Q = Math.floor(ut / ot) * ot, K = Math.max(0, y.duration - R), yt = Math.min(it, Q, K), vt = Math.floor(yt / ot) * ot;
                  if (vt <= 0) return;
                  const St = Math.max(R, y.duration - vt), Ct = U - vt, Mt = P - Ct;
                  s.updateOverlayBatch(y.id, {
                    duration: c(St),
                    trimmedOut: y.trimmedOut
                  }), s.updateOverlayBatch(i.id, {
                    startTime: c(Ct),
                    duration: c(Mt)
                  });
                  const re = e.overlays.find((Vt) => Vt.id === z.transitionInId), Yt = (re?.duration || 0) + It, Kt = (re?.duration || 0) + c(Mt) - Yt, ae = Math.max(0, z.trimmedIn - Kt);
                  if (s.updateOverlayBatch(z.id, {
                    trimmedIn: ae,
                    trimmedOut: z.trimmedOut
                  }), y.transitionOutId && y.transitionOutId !== i.id && e.overlays.find((Xt) => Xt.id === y.transitionOutId)) {
                    const Xt = y.startTime + c(St);
                    s.updateOverlayBatch(y.transitionOutId, { startTime: Xt, row: y.row });
                  }
                }
              }
              return;
            }
          }
          const xt = 2 / r.fps, Ot = Math.max(0, S.originalStartTime + At), Bt = Math.max(xt, S.originalDuration - At);
          let ht = Ot, Rt = Bt;
          if (Bt <= xt) {
            const st = S.originalStartTime + S.originalDuration;
            ht = Math.max(0, st - xt), Rt = xt;
          }
          ht = Math.max(0, ht);
          const Ft = e.duration;
          ht + Rt > Ft && (Rt = Math.max(xt, Ft - ht), Rt < xt && (ht = Math.max(0, Ft - xt), Rt = xt));
          const wt = Math.max(xt, Math.min(Rt, Ft - ht));
          if (i.type === o.CLIP) {
            const st = i;
            if (st.transitionInId) {
              const R = e.overlays.find((U) => U.id === st.transitionInId);
              if (R && ht - R.duration < 0) {
                console.log("Left resize blocked: would push transition-in below frame 0");
                return;
              }
            }
            const y = e.overlays.find((R) => R.type === o.TRANSITION_MERGED && R.toClipId === st.id);
            if (y) {
              const R = 2 / r.fps, U = y.startTime + R;
              if (ht < U) {
                console.log("Left resize blocked: would make merged transition smaller than 2 frames");
                return;
              }
            }
            const z = e.overlays.find((R) => R.type === o.TRANSITION_MERGED && R.fromClipId === st.id);
            if (z) {
              if (ht < S.originalStartTime) {
                const U = S.originalStartTime - ht, P = e.overlays.find((nt) => nt.id === z.toClipId);
                if (P) {
                  const it = P.startTime + U + P.duration, k = e.overlays.find((It) => It.id === P.transitionOutId);
                  if ((k ? it + k.duration : it) > e.duration) {
                    console.log("Left resize blocked: would push elements beyond timeline duration");
                    return;
                  }
                }
              } else if (ht + wt < z.startTime) {
                console.log("Left resize blocked: fromClip would disconnect from merged transition");
                return;
              }
            }
          }
          if (i.type === o.CLIP) {
            const st = i, z = ht < S.originalStartTime ? $(i, "start") : x(i, "clip"), R = Math.min(wt, z), U = Math.max(xt, R);
            let P = ht;
            if (U <= xt) {
              const k = S.originalStartTime + S.originalDuration;
              P = Math.max(ht, k - xt);
            }
            const nt = !!st.transitionInId, it = e.overlays.some((k) => k.type === o.TRANSITION_MERGED && k.toClipId === st.id);
            if (nt || it) {
              const k = S.originalStartTime - st.trimmedIn;
              P < k && (P = k);
            }
            if (console.log("Left resize with constraints:", {
              deltaPixels: dt.clientX - S.startX,
              deltaTime: At,
              originalStartTime: S.originalStartTime,
              originalDuration: S.originalDuration,
              requestedStartTime: Ot,
              requestedDuration: Bt,
              constrainedStartTime: P,
              constrainedDuration: U,
              maxAllowed: z
              // trims unchanged here
            }), tt(i, P, U))
              console.log("Left resize collision detected");
            else {
              console.log("Updating left resize:", {
                startTime: c(P),
                duration: c(U)
              });
              const k = c(P) - S.originalStartTime, ot = nt || it ? Math.max(0, i.trimmedIn + k) : i.trimmedIn, It = i.trimmedOut;
              if (s.updateOverlayBatch(i.id, {
                startTime: c(P),
                duration: c(U),
                trimmedIn: ot,
                trimmedOut: It
              }), i.transitionInId) {
                const Q = e.overlays.find((K) => K.id === i.transitionInId);
                if (Q) {
                  const K = c(P) - Q.duration, yt = Math.max(0, K);
                  s.updateOverlayBatch(i.transitionInId, { startTime: yt, row: i.row });
                }
              }
              if (i.transitionOutId) {
                const Q = e.overlays.find((K) => K.id === i.transitionOutId);
                if (Q) {
                  const K = c(P) + c(U), yt = Math.min(K, e.duration - Q.duration);
                  s.updateOverlayBatch(i.transitionOutId, { startTime: Math.max(0, yt), row: i.row });
                }
              }
              const ct = e.overlays.find((Q) => Q.type === o.TRANSITION_MERGED && Q.fromClipId === i.id), ut = e.overlays.find((Q) => Q.type === o.TRANSITION_MERGED && Q.toClipId === i.id);
              if (ct) {
                const Q = c(P) + c(U), K = e.overlays.find((yt) => yt.id === ct.toClipId);
                if (console.log("Left resize: updating merged transition (as fromClip)", ct.id, "start to", Q), s.updateOverlayBatch(ct.id, { startTime: Q, row: i.row }), K) {
                  const yt = Q + ct.duration;
                  if (console.log("Left resize: moving toClip", K.id, "to stay attached at", yt), s.updateOverlayBatch(K.id, { startTime: yt, row: i.row }), K.transitionInId) {
                    const vt = e.overlays.find((St) => St.id === K.transitionInId);
                    if (vt) {
                      const St = yt - vt.duration;
                      s.updateOverlayBatch(vt.id, { startTime: St, row: i.row });
                    }
                  }
                  if (K.transitionOutId) {
                    const vt = e.overlays.find((St) => St.id === K.transitionOutId);
                    if (vt) {
                      const St = yt + K.duration;
                      s.updateOverlayBatch(vt.id, { startTime: St, row: i.row });
                    }
                  }
                }
              }
              if (ut) {
                const Q = e.overlays.find((K) => K.id === ut.fromClipId);
                if (Q) {
                  const K = c(P) - S.originalStartTime, yt = c(ut.startTime + K), vt = ut.duration;
                  s.updateOverlayBatch(ut.id, {
                    startTime: yt,
                    duration: vt,
                    row: i.row
                  });
                  const St = Q.startTime + K;
                  if (s.updateOverlayBatch(Q.id, { startTime: c(St), row: Q.row }), Q.transitionInId) {
                    const Ct = e.overlays.find((Mt) => Mt.id === Q.transitionInId);
                    Ct && s.updateOverlayBatch(Q.transitionInId, { startTime: c(Ct.startTime + K), row: Q.row });
                  }
                  if (Q.transitionOutId) {
                    const Ct = e.overlays.find((Mt) => Mt.id === Q.transitionOutId);
                    Ct && s.updateOverlayBatch(Q.transitionOutId, { startTime: c(Ct.startTime + K), row: Q.row });
                  }
                }
              }
            }
          }
        } else if (S.dragType === "resize-right") {
          if (i.type === o.TRANSITION_OUT) {
            const wt = 2 / r.fps, st = Math.max(wt, S.originalDuration + At), y = e.overlays.find((nt) => nt.id === i.parentClipId);
            let z = st;
            if (y) {
              const nt = y.startTime + y.duration + st, it = e.duration;
              nt > it && (z = Math.max(wt, it - (y.startTime + y.duration)));
            }
            const R = z > S.originalDuration, U = R ? $(i, "end") : x(i, "transition-out"), P = Math.max(wt, Math.min(z, U));
            if (console.log("Transition-out resize debug:", {
              originalDuration: S.originalDuration,
              deltaTime: At,
              requestedDuration: st,
              isExtending: R,
              maxAllowed: U,
              newDuration: P,
              snappedDuration: c(P)
            }), y) {
              const nt = y.startTime + y.duration, k = e.overlays.find((St) => St.id === y.transitionOutId)?.duration || 0, ot = Math.max(0, y.trimmedOut), It = Math.max(0, c(P) - k), ct = Math.min(It, ot), ut = k + ct, Q = y.trimmedOut, yt = y.trimmedIn, vt = Math.max(0, Q - ct);
              s.updateOverlayBatch(i.id, { startTime: nt, duration: ut, row: y.row }), s.updateOverlayBatch(y.id, {
                trimmedIn: yt,
                trimmedOut: vt
              });
            } else
              s.updateOverlayBatch(i.id, { duration: c(P) });
            return;
          } else {
            if (i.type === o.TRANSITION_IN)
              return;
            if (i.type === o.TRANSITION_MERGED) {
              const wt = i, st = e.overlays.find((z) => z.id === wt.fromClipId), y = e.overlays.find((z) => z.id === wt.toClipId);
              if (st && y && y.type === o.CLIP) {
                const z = At, R = 2 / r.fps, U = y.startTime + y.duration - R, P = st, nt = P.trimmedOut, k = e.overlays.find((Kt) => Kt.id === P.transitionOutId)?.duration || 0, ot = Math.max(0, nt - k), It = i.startTime + ot, ct = Math.max(0, y.startTime + z), ut = Math.min(ct, U, It), Q = ut - y.startTime, K = ut, yt = y.duration - Q, vt = Math.max(R, yt), Ct = K < y.startTime ? $(y, "start") : x(y, "clip"), Mt = Math.min(vt, Ct), re = Math.min(K + Mt, e.duration), Yt = Math.max(R, re - K);
                if (c(K) - i.startTime < R) {
                  console.log("Merged transition right resize blocked: would make transition smaller than 2 frames");
                  return;
                }
                if (!tt(y, K, Yt)) {
                  s.updateOverlayBatch(y.id, {
                    startTime: c(K),
                    duration: c(Yt),
                    trimmedIn: y.trimmedIn,
                    // Preserve existing trimOut for video 2 when resizing merged right edge
                    trimmedOut: y.trimmedOut
                  });
                  const Kt = c(K) - i.startTime;
                  s.updateOverlayBatch(i.id, {
                    duration: c(Kt)
                  });
                  const ae = k + i.duration, Xt = k + Kt - ae, Te = P.trimmedIn, ge = Math.max(0, P.trimmedOut - Xt);
                  if (s.updateOverlayBatch(P.id, {
                    trimmedIn: Te,
                    trimmedOut: ge
                  }), y.transitionInId && y.transitionInId !== i.id) {
                    const de = e.overlays.find(($t) => $t.id === y.transitionInId);
                    if (de) {
                      const $t = c(K) - de.duration;
                      s.updateOverlayBatch(y.transitionInId, { startTime: $t, row: y.row });
                    }
                  }
                  if (y.transitionOutId && e.overlays.find(($t) => $t.id === y.transitionOutId)) {
                    const $t = c(K) + c(Yt);
                    s.updateOverlayBatch(y.transitionOutId, { startTime: $t, row: y.row });
                  }
                }
              }
              return;
            }
          }
          const xt = 2 / r.fps, Ot = Math.max(xt, S.originalDuration + At), Bt = e.duration, ht = S.originalStartTime, Rt = Bt - ht;
          if (i.type === o.CLIP) {
            const wt = i;
            if (wt.transitionOutId) {
              const z = e.overlays.find((R) => R.id === wt.transitionOutId);
              if (z && ht + Ot + z.duration > e.duration) {
                console.log("Right resize blocked: would push transition-out beyond timeline end");
                return;
              }
            }
            const st = e.overlays.find((z) => z.type === o.TRANSITION_MERGED && z.fromClipId === wt.id);
            if (st)
              if (Ot > S.originalDuration) {
                const R = Ot - S.originalDuration, U = e.overlays.find((P) => P.id === st.toClipId);
                if (U) {
                  const nt = U.startTime + R + U.duration, it = e.overlays.find((ot) => ot.id === U.transitionOutId);
                  if ((it ? nt + it.duration : nt) > e.duration) {
                    console.log("Right resize blocked: would push elements beyond timeline duration");
                    return;
                  }
                }
              } else {
                const R = 2 / r.fps, P = st.startTime + st.duration - R;
                if (ht + Ot > P) {
                  console.log("Right resize blocked: would make merged transition smaller than 2 frames");
                  return;
                }
              }
            const y = e.overlays.find((z) => z.type === o.TRANSITION_MERGED && z.toClipId === wt.id);
            if (y) {
              const z = y.startTime + y.duration;
              if (ht + Ot < z) {
                console.log("Right resize blocked: toClip would disconnect from merged transition");
                return;
              }
            }
          }
          const Ft = Math.max(
            xt,
            Math.min(Ot, Rt)
          );
          if (i.type === o.CLIP) {
            const st = Ot > S.originalDuration ? $(i, "end") : x(i, "clip"), y = Math.min(Ft, st);
            if (console.log("Right resize with constraints:", {
              deltaPixels: dt.clientX - S.startX,
              deltaTime: At,
              originalDuration: S.originalDuration,
              requestedDuration: Ot,
              maxAllowed: st,
              finalDuration: y,
              originalStartTime: S.originalStartTime,
              overlayStartTime: i.startTime
            }), tt(i, S.originalStartTime, y))
              console.log("Collision detected, not updating");
            else {
              console.log("Updating duration to:", c(y));
              const z = !!i.transitionOutId, R = e.overlays.some((k) => k.type === o.TRANSITION_MERGED && k.fromClipId === i.id), U = c(y) - S.originalDuration, P = z || R ? Math.max(0, i.trimmedOut - U) : i.trimmedOut, nt = i.trimmedIn;
              if (s.updateOverlayBatch(i.id, {
                duration: c(y),
                trimmedIn: nt,
                trimmedOut: P
              }), i.transitionOutId) {
                const k = e.overlays.find((ot) => ot.id === i.transitionOutId);
                if (k) {
                  const ot = S.originalStartTime + c(y), It = Math.min(ot, e.duration - k.duration);
                  s.updateOverlayBatch(i.transitionOutId, { startTime: Math.max(0, It), row: i.row });
                }
              }
              const it = e.overlays.find((k) => k.type === o.TRANSITION_MERGED && k.fromClipId === i.id);
              if (e.overlays.find((k) => k.type === o.TRANSITION_MERGED && k.toClipId === i.id), it) {
                const k = S.originalStartTime + c(y), ot = e.overlays.find((It) => It.id === it.toClipId);
                if (console.log("Right resize: updating merged transition (as fromClip)", it.id, "start to", k), s.updateOverlayBatch(it.id, { startTime: k, row: i.row }), ot) {
                  const It = k + it.duration;
                  if (console.log("Right resize: moving toClip", ot.id, "to stay attached at", It), s.updateOverlayBatch(ot.id, { startTime: It, row: i.row }), ot.transitionInId) {
                    const ct = e.overlays.find((ut) => ut.id === ot.transitionInId);
                    if (ct) {
                      const ut = It - ct.duration;
                      s.updateOverlayBatch(ct.id, { startTime: ut, row: i.row });
                    }
                  }
                  if (ot.transitionOutId) {
                    const ct = e.overlays.find((ut) => ut.id === ot.transitionOutId);
                    if (ct) {
                      const ut = It + ot.duration;
                      s.updateOverlayBatch(ct.id, { startTime: ut, row: i.row });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, et = () => {
      A && (s.commitDragHistory(), W(i.id)), A = !1, m(!1), s.endDrag(), t.onDragEnd?.(i), document.removeEventListener("mousemove", Y), document.removeEventListener("mouseup", et);
    };
    document.addEventListener("mousemove", Y), document.addEventListener("mouseup", et);
  }, [
    N,
    j,
    rt,
    tt,
    c,
    pt,
    C,
    p,
    Z,
    x,
    w,
    B,
    s,
    t
  ]), Tt = X((a, i) => {
    if (!d) {
      if (a.stopPropagation(), (a.ctrlKey || a.metaKey) && i.type === o.TRANSITION_MERGED) {
        s.splitMergedTransition(i.id);
        return;
      }
      s.selectOverlay(i.id, a.ctrlKey || a.metaKey), t.onSelect?.(i);
    }
  }, [d, s, t]), bt = X((a) => {
    if (d)
      return;
    const i = g.current;
    if (!i)
      return;
    const _ = i.getBoundingClientRect(), O = a.clientX - _.left - 60, I = Math.max(0, j(O));
    u(!0), s.seek(I), s.clearSelection();
    const E = (G) => {
      if (!v || !i)
        return;
      const H = i.getBoundingClientRect(), S = G.clientX - H.left - 60, J = Math.max(0, Math.min(e.duration, j(S)));
      s.seek(J);
    }, b = () => {
      u(!1), document.removeEventListener("mousemove", E), document.removeEventListener("mouseup", b);
    };
    document.addEventListener("mousemove", E), document.addEventListener("mouseup", b);
  }, [d, v, j, s, e.duration, g]), Wt = X((a) => {
    a.preventDefault();
  }, []), ne = X((a) => {
    const i = D(a.startTime), _ = D(a.duration);
    return {
      left: `${i}px`,
      width: `${_}px`,
      zIndex: a.selected ? 10 : 1
    };
  }, [D]), ie = X((a, i) => {
    if (d)
      return "grabbing";
    const _ = document.getElementById(`overlay-${a.id}`);
    if (!_)
      return "grab";
    const O = _.getBoundingClientRect(), I = i - O.left, E = 12, b = 12;
    return a.type === o.TRANSITION_IN ? I <= b ? "ew-resize" : "grab" : a.type === o.TRANSITION_OUT ? I >= O.width - b ? "ew-resize" : "grab" : (a.type === o.TRANSITION_MERGED, I <= E || I >= O.width - E ? "ew-resize" : "grab");
  }, [d]);
  return {
    // State
    isDragging: d,
    isTimelineScrubbing: v,
    dragInfo: l,
    // Event handlers
    handleMouseDown: mt,
    handleClick: Tt,
    handleTimelineClick: Wt,
    handleTimelineMouseDown: bt,
    // Utilities
    getClipStyle: ne,
    getCursor: ie,
    pixelToTime: j,
    timeToPixel: D,
    snapToGrid: c,
    // Length validation utilities
    getEffectiveClipLength: B,
    validateClipTotalLength: w,
    getMaxAllowedDuration: x,
    // Refs
    timelineRef: g
  };
}
const He = () => {
  const { settings: t, state: e, actions: r } = Ut(), [l, s] = Gt({
    isDragging: !1,
    draggedClip: null,
    dragPosition: null,
    dropTarget: null
  }), d = zt(null), m = X((c) => c / (t.pixelsPerSecond * e.zoom), [t.pixelsPerSecond, e.zoom]), v = X((c) => {
    const F = c - 18;
    return Math.floor(F / t.trackHeight);
  }, [t.trackHeight]), u = X((c) => {
    if (!t.snapToGrid) return c;
    if (c === 0) return 0;
    const B = 1 / t.fps;
    return Math.round(c / B) * B;
  }, [t.snapToGrid, t.fps]), N = X(() => `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, []), g = X((c, B) => {
    const F = e.duration - B;
    return c <= F ? c : Math.max(L(), F);
  }, [e.duration]), L = X(() => ln(t.fps), [t.fps]), W = X((c, B) => {
    console.log("Starting drag with clip data:", c), s({
      isDragging: !0,
      draggedClip: c,
      dragPosition: { x: B.clientX, y: B.clientY },
      dropTarget: null
    }), B.dataTransfer.setData("application/json", JSON.stringify(c)), B.dataTransfer.effectAllowed = "copy", console.log("Drag state set, dataTransfer configured");
  }, []), p = X((c) => {
    if (c.preventDefault(), c.dataTransfer.dropEffect = "copy", !d.current) {
      console.log("No timeline ref available");
      return;
    }
    if (!(l.draggedClip || c.dataTransfer.types.includes("application/json"))) {
      console.log("No clip data detected in drag operation");
      return;
    }
    const F = d.current.getBoundingClientRect(), q = c.clientX - F.left, h = c.clientY - F.top, w = u(Math.max(0, m(q))), $ = Math.max(0, v(h));
    console.log("Drag over timeline:", { x: q, y: h, time: w, row: $ }), s((x) => ({
      ...x,
      isDragging: !0,
      // Ensure drag state is active
      dragPosition: { x: c.clientX, y: c.clientY },
      dropTarget: { row: $, time: w }
    }));
  }, [m, v, u, l.draggedClip]), Z = X((c) => {
    if (!d.current) return;
    const B = d.current.getBoundingClientRect(), { clientX: F, clientY: q } = c;
    (F < B.left || F > B.right || q < B.top || q > B.bottom) && s((h) => ({
      ...h,
      dropTarget: null
    }));
  }, []), C = X((c) => {
    c.preventDefault();
    try {
      const B = c.dataTransfer.getData("application/json");
      let F;
      if (B)
        F = JSON.parse(B);
      else if (l.draggedClip)
        F = l.draggedClip;
      else {
        console.warn("No clip data available for drop");
        return;
      }
      let q = l.dropTarget;
      if (!q && d.current) {
        const bt = d.current.getBoundingClientRect(), Wt = c.clientX - bt.left, ne = c.clientY - bt.top, ie = u(Math.max(0, m(Wt)));
        q = { row: Math.max(0, v(ne)), time: ie }, console.log("Calculated drop target from drop position:", q);
      }
      if (!q) {
        console.warn("No drop target available and could not calculate from position");
        return;
      }
      const { row: h, time: w } = q, $ = N(), x = `${$}-transition-in`, tt = `${$}-transition-out`, rt = g(F.length, w);
      let pt;
      switch (F.mediaType) {
        case "audio":
          pt = o.SOUND;
          break;
        case "image":
          pt = o.IMAGE;
          break;
        case "video":
        default:
          pt = o.CLIP;
          break;
      }
      const mt = [];
      let Tt;
      if (pt === o.CLIP) {
        Tt = {
          id: $,
          type: o.CLIP,
          startTime: w,
          duration: rt,
          row: h,
          selected: !1,
          label: F.label || F.src.split("/").pop() || "Untitled",
          src: F.src,
          volume: 1,
          // Full volume by default
          muted: !1,
          length: F.length,
          speed: 1,
          // Normal speed
          // Initialize trims from timeline geometry (authoritative)
          trimmedIn: Math.max(0, w - Math.max(0, w - 0.5)),
          trimmedOut: Math.max(0, F.length / 1 - rt),
          transitionInId: x,
          transitionOutId: tt
        };
        const bt = {
          id: x,
          type: o.TRANSITION_IN,
          startTime: Math.max(0, w - 0.5),
          // 0.5s fade in, but don't go below 0
          duration: 0.5,
          row: h,
          selected: !1,
          parentClipId: $,
          transitionType: "fade"
        }, Wt = {
          id: tt,
          type: o.TRANSITION_OUT,
          startTime: w + rt,
          // starts when main clip ends
          duration: 0.5,
          row: h,
          selected: !1,
          parentClipId: $,
          transitionType: "fade"
        };
        mt.push(Tt, bt, Wt);
      } else pt === o.SOUND ? (Tt = {
        id: $,
        type: o.SOUND,
        startTime: w,
        duration: rt,
        row: h,
        selected: !1,
        label: F.label || F.src.split("/").pop() || "Untitled",
        src: F.src,
        volume: 0.8,
        // Slightly lower volume for audio tracks
        muted: !1
      }, mt.push(Tt)) : (Tt = {
        id: $,
        type: o.IMAGE,
        startTime: w,
        duration: rt,
        row: h,
        selected: !1,
        label: F.label || F.src.split("/").pop() || "Untitled",
        src: F.src,
        x: 0,
        y: 0,
        width: 100,
        // Default width percentage
        height: 100,
        // Default height percentage
        opacity: 1
      }, mt.push(Tt));
      mt.forEach((bt) => {
        r.addOverlay(bt);
      }), r.selectOverlay($), console.log("Successfully dropped clip with transitions:", {
        clipData: F,
        mainOverlay: Tt,
        totalOverlaysCreated: mt.length,
        dropTarget: q
      });
    } catch (B) {
      console.error("Error handling drop:", B);
    } finally {
      s({
        isDragging: !1,
        draggedClip: null,
        dragPosition: null,
        dropTarget: null
      });
    }
  }, [l, N, g, r, u, m, v]), j = X(() => {
    s({
      isDragging: !1,
      draggedClip: null,
      dragPosition: null,
      dropTarget: null
    });
  }, []), D = X(() => {
    if (!l.isDragging || !l.draggedClip || !l.dropTarget)
      return null;
    const { draggedClip: c, dropTarget: B } = l, F = g(c.length, B.time), q = F * t.pixelsPerSecond * e.zoom;
    return {
      row: B.row,
      time: B.time,
      duration: F,
      width: q,
      label: c.label || c.src.split("/").pop() || "Untitled",
      mediaType: c.mediaType
    };
  }, [l, g, t.pixelsPerSecond, e.zoom]);
  return {
    // State
    dragState: l,
    dropPreview: D(),
    timelineRef: d,
    // Actions
    startDrag: W,
    endDrag: j,
    handleDragOver: p,
    handleDragLeave: Z,
    handleDrop: C,
    // Utilities
    pixelToTime: m,
    pixelToRow: v,
    snapToGrid: u
  };
};
function Un(t, e = {}) {
  const { samplesPerPixel: r = 512, fallbackDuration: l = 10 } = e, [s, d] = Gt(null), [m, v] = Gt(!1), [u, N] = Gt(null), g = zt(null), L = zt(null), W = X((C) => {
    const j = C.getChannelData(0), D = j.length, c = Math.floor(D / (D / r)), B = [];
    for (let F = 0; F < D; F += c) {
      let q = 0;
      for (let h = 0; h < c && F + h < D; h++) {
        const w = Math.abs(j[F + h]);
        w > q && (q = w);
      }
      B.push(q);
    }
    return {
      peaks: B,
      duration: C.duration
    };
  }, [r]), p = X(async (C) => {
    L.current && L.current.abort(), L.current = new AbortController(), v(!0), N(null);
    try {
      g.current || (g.current = new (window.AudioContext || window.webkitAudioContext)());
      const j = await fetch(C, {
        signal: L.current.signal
      });
      if (!j.ok)
        throw new Error(`Failed to fetch audio: ${j.statusText}`);
      const D = await j.arrayBuffer(), c = await g.current.decodeAudioData(D), B = W(c);
      d(B);
    } catch (j) {
      if (j instanceof Error && j.name === "AbortError")
        return;
      const D = j instanceof Error ? j.message : "Unknown error occurred";
      N(D), console.error("Waveform loading error:", j);
      const c = Z(l);
      d(c);
    } finally {
      v(!1);
    }
  }, [W]);
  se(() => (t ? p(t) : (d(null), N(null)), () => {
    L.current && L.current.abort();
  }), [t, p]), se(() => () => {
    g.current && g.current.state !== "closed" && g.current.close();
  }, []);
  const Z = X((C, j = 100) => {
    const D = [];
    for (let c = 0; c < j; c++) {
      const B = Math.sin(c / j * Math.PI * 4) * 0.5 + 0.5, F = (Math.random() - 0.5) * 0.3, q = Math.max(0, Math.min(1, B + F));
      D.push(q);
    }
    return { peaks: D, duration: C };
  }, []);
  return {
    waveformData: s,
    isLoading: m,
    error: u,
    generateMockWaveform: Z,
    reload: t ? () => p(t) : void 0,
    audioDuration: s?.duration
    // Add audio duration to return
  };
}
const Bn = ({ overlay: t }) => {
  const { settings: e, state: r, dragInfo: l, actions: s } = Ut(), { handleMouseDown: d, handleClick: m, getClipStyle: v } = Ge(), { waveformData: u, generateMockWaveform: N, audioDuration: g } = Un(
    t.type === o.SOUND ? t.src : void 0,
    { fallbackDuration: t.duration }
    // Pass the overlay duration as fallback
  );
  Se.useEffect(() => {
    t.type === o.SOUND && g && g > 0 && s.setDuration(g);
  }, [g, t.type, s]);
  const L = t.type === o.SOUND, p = (() => {
    if (t.type === o.TRANSITION_IN || t.type === o.TRANSITION_OUT) {
      const h = t.parentClipId;
      return r.overlays.find((w) => w.id === h);
    } else if (t.type === o.TRANSITION_MERGED) {
      const h = t.fromClipId;
      return r.overlays.find((w) => w.id === h);
    }
    return null;
  })(), Z = () => t.type === o.TRANSITION_IN && p?.type === o.CLIP ? (p.trimmedIn || 0) > 0.01 : t.type === o.TRANSITION_OUT && p?.type === o.CLIP ? (p.trimmedOut || 0) > 0.01 : !1, C = () => {
    if (t.type !== o.CLIP) return { left: !1, right: !1 };
    const h = t;
    let w = !1, $ = !1;
    if (h.transitionInId) {
      const x = r.overlays.find((rt) => rt.id === h.transitionInId), tt = h.trimmedIn || 0;
      x && x.duration === 0 && tt > 0.01 && (w = !0);
    }
    if (h.transitionOutId) {
      const x = r.overlays.find((rt) => rt.id === h.transitionOutId), tt = h.trimmedOut || 0;
      x && x.duration === 0 && tt > 0.01 && ($ = !0);
    }
    return { left: w, right: $ };
  }, j = () => {
    if (t.type !== o.CLIP) return { showTrimIn: !1, showTrimOut: !1, trimIn: 0, trimOut: 0 };
    const h = t, w = h.trimmedIn || 0, $ = h.trimmedOut || 0;
    return {
      showTrimIn: w > 0.01,
      showTrimOut: $ > 0.01,
      trimIn: w,
      trimOut: $
    };
  }, D = v(t), c = t.duration * e.pixelsPerSecond * r.zoom, B = e.trackHeight - 20, F = () => {
    const h = "clip";
    let w = `clip-${t.type}`;
    if (t.type === o.TRANSITION_IN || t.type === o.TRANSITION_OUT) {
      const tt = p ? `clip-${p.type}` : "clip-clip";
      w = `${w} ${tt}-transition`;
    } else if (t.type === o.TRANSITION_MERGED) {
      const tt = p ? `clip-${p.type}` : "clip-clip";
      w = `${w} ${tt}-transition`;
    }
    const $ = t.selected ? "selected" : "", x = l?.overlayId === t.id ? "dragging" : "";
    return [h, w, $, x].filter(Boolean).join(" ");
  }, q = () => {
    switch (t.type) {
      case o.TRANSITION_IN:
        return /* @__PURE__ */ f.jsx("div", { className: "clip-content" });
      case o.TRANSITION_OUT:
        return /* @__PURE__ */ f.jsx("div", { className: "clip-content" });
      case o.TRANSITION_MERGED:
        const h = t;
        return /* @__PURE__ */ f.jsxs("div", { className: "clip-content", children: [
          /* @__PURE__ */ f.jsx("div", { className: "clip-title", style: { fontSize: "8px", textAlign: "center" }, children: "Merged Transition" }),
          /* @__PURE__ */ f.jsx("div", { className: "transition-info", style: {
            fontSize: "6px",
            textAlign: "center",
            opacity: 0.8,
            marginTop: "2px"
          }, children: h.transitionType })
        ] });
      case o.SOUND:
        const w = t;
        let $ = [];
        return u?.peaks ? $ = u.peaks : $ = N(t.duration, Math.floor(c / 4)).peaks, /* @__PURE__ */ f.jsxs("div", { className: "clip-content", children: [
          /* @__PURE__ */ f.jsxs("div", { className: "clip-title", style: { fontSize: "10px", marginBottom: "2px" }, children: [
            "Audio ",
            w.volume !== 1 && `(${Math.round(w.volume * 100)}%)`,
            w.muted && " (Muted)"
          ] }),
          /* @__PURE__ */ f.jsx("div", { className: "waveform", style: { height: "30px", overflow: "hidden" }, children: /* @__PURE__ */ f.jsx("svg", { width: c, height: 30, style: { display: "block" }, children: $.map((x, tt) => {
            const rt = c / $.length, pt = x * 25, mt = tt * rt, Tt = (30 - pt) / 2;
            return /* @__PURE__ */ f.jsx(
              "rect",
              {
                x: mt,
                y: Tt,
                width: Math.max(1, rt - 0.5),
                height: pt,
                fill: "currentColor",
                opacity: 0.8
              },
              tt
            );
          }) }) })
        ] });
      case o.CLIP:
        return /* @__PURE__ */ f.jsxs("div", { className: "clip-content", children: [
          t.label && /* @__PURE__ */ f.jsx("div", { className: "clip-title", style: { fontSize: "10px" }, children: t.label }),
          /* @__PURE__ */ f.jsx("div", { className: "clip-preview", style: {
            width: "100%",
            height: "40px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "8px",
            color: "rgba(255,255,255,0.7)"
          }, children: "📹" })
        ] });
      case o.TEXT:
        return /* @__PURE__ */ f.jsx("div", { className: "clip-content", children: /* @__PURE__ */ f.jsx("div", { className: "text-preview", style: {
          fontSize: "12px",
          opacity: 0.8,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }, children: t.text || "Text Overlay" }) });
      case o.IMAGE:
        return /* @__PURE__ */ f.jsxs("div", { className: "clip-content", children: [
          t.label && /* @__PURE__ */ f.jsx("div", { className: "clip-title", style: { fontSize: "10px" }, children: t.label }),
          /* @__PURE__ */ f.jsx("div", { className: "image-preview", style: {
            width: "100%",
            height: "40px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px"
          }, children: "🖼️" })
        ] });
      case o.CAPTION:
        return /* @__PURE__ */ f.jsxs("div", { className: "clip-content", children: [
          /* @__PURE__ */ f.jsx("div", { className: "clip-title", style: { fontSize: "10px" }, children: "Captions" }),
          /* @__PURE__ */ f.jsx("div", { className: "caption-preview", style: {
            fontSize: "8px",
            opacity: 0.8
          }, children: "📝 Subtitles" })
        ] });
      default:
        return /* @__PURE__ */ f.jsx("div", { className: "clip-content", children: /* @__PURE__ */ f.jsx("div", { className: "clip-title", style: { fontSize: "10px" }, children: "Unknown" }) });
    }
  };
  return (t.type === o.TRANSITION_IN || t.type === o.TRANSITION_OUT) && t.duration === 0 ? null : /* @__PURE__ */ f.jsxs(
    "div",
    {
      id: `overlay-${t.id}`,
      className: F(),
      style: {
        ...D,
        height: `${B}px`,
        top: "10px"
      },
      onMouseDown: L ? void 0 : (h) => d(h, t),
      onClick: L ? void 0 : (h) => m(h, t),
      children: [
        q(),
        !L && t.type !== o.TRANSITION_IN && t.type !== o.TRANSITION_OUT ? (
          // Regular clips and merged transitions get normal resize handles
          /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
            /* @__PURE__ */ f.jsx(
              "div",
              {
                className: "resize-handle resize-handle-left",
                onMouseDown: (h) => {
                  h.stopPropagation(), d(h, t);
                }
              }
            ),
            /* @__PURE__ */ f.jsx(
              "div",
              {
                className: "resize-handle resize-handle-right",
                onMouseDown: (h) => {
                  h.stopPropagation(), d(h, t);
                }
              }
            )
          ] })
        ) : (
          // Transitions get selective resize handles
          /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
            t.type === o.TRANSITION_IN && /* @__PURE__ */ f.jsx(
              "div",
              {
                className: "resize-handle resize-handle-left transition-resize",
                onMouseDown: (h) => {
                  h.stopPropagation(), d(h, t);
                }
              }
            ),
            t.type === o.TRANSITION_OUT && /* @__PURE__ */ f.jsx(
              "div",
              {
                className: "resize-handle resize-handle-right transition-resize",
                onMouseDown: (h) => {
                  h.stopPropagation(), d(h, t);
                }
              }
            )
          ] })
        ),
        Z() && /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
          t.type === o.TRANSITION_IN && /* @__PURE__ */ f.jsx("div", { className: "dog-ear dog-ear-left" }),
          t.type === o.TRANSITION_OUT && /* @__PURE__ */ f.jsx("div", { className: "dog-ear dog-ear-right" })
        ] }),
        (() => {
          const h = C();
          return /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
            h.left && /* @__PURE__ */ f.jsx("div", { className: "dog-ear dog-ear-left" }),
            h.right && /* @__PURE__ */ f.jsx("div", { className: "dog-ear dog-ear-right" })
          ] });
        })(),
        (() => {
          const h = j();
          return /* @__PURE__ */ f.jsxs(f.Fragment, { children: [
            h.showTrimIn && /* @__PURE__ */ f.jsx("div", { className: "trim-indicator trim-in", title: `Trim In: ${h.trimIn.toFixed(2)}s`, children: /* @__PURE__ */ f.jsxs("span", { className: "trim-value", children: [
              h.trimIn.toFixed(1),
              "s"
            ] }) }),
            h.showTrimOut && /* @__PURE__ */ f.jsx("div", { className: "trim-indicator trim-out", title: `Trim Out: ${h.trimOut.toFixed(2)}s`, children: /* @__PURE__ */ f.jsxs("span", { className: "trim-value", children: [
              h.trimOut.toFixed(1),
              "s"
            ] }) })
          ] });
        })()
      ]
    }
  );
}, Ae = ({ rowIndex: t, overlays: e }) => {
  const { settings: r } = Ut(), s = e.some((d) => d.type === o.SOUND) ? "audio" : `Track ${t + 1}`;
  return /* @__PURE__ */ f.jsxs(
    "div",
    {
      className: "track",
      style: {
        position: "absolute",
        top: `${t * r.trackHeight}px`,
        left: 0,
        right: 0,
        height: `${r.trackHeight}px`,
        borderBottom: "1px solid #333"
      },
      children: [
        /* @__PURE__ */ f.jsx(
          "div",
          {
            className: "track-label",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: "60px",
              height: "100%",
              backgroundColor: "#2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#888",
              borderRight: "1px solid #444",
              zIndex: 1
            },
            children: s
          }
        ),
        /* @__PURE__ */ f.jsx(
          "div",
          {
            className: "track-content",
            style: {
              position: "absolute",
              left: "60px",
              top: 0,
              right: 0,
              height: "100%"
            },
            children: e.map((d) => /* @__PURE__ */ f.jsx(Bn, { overlay: d }, d.id))
          }
        )
      ]
    }
  );
}, $n = () => {
  const { settings: t, state: e } = Ut(), { dropPreview: r, dragState: l } = He();
  if (!r || !l.isDragging)
    return null;
  const { row: s, time: d, duration: m, width: v, label: u, mediaType: N } = r, g = 18 + s * t.trackHeight + 10, L = d * t.pixelsPerSecond * e.zoom, W = () => {
    switch (N) {
      case "video":
        return "📹";
      case "audio":
        return "🎵";
      case "image":
        return "🖼️";
      default:
        return "📁";
    }
  }, p = () => {
    switch (N) {
      case "video":
        return "rgba(74, 144, 226, 0.8)";
      // Blue for video clips
      case "audio":
        return "rgba(126, 211, 33, 0.8)";
      // Green for audio
      case "image":
        return "rgba(189, 16, 224, 0.8)";
      // Purple for images
      default:
        return "rgba(128, 128, 128, 0.8)";
    }
  };
  return /* @__PURE__ */ f.jsxs(
    "div",
    {
      className: "drop-preview",
      style: {
        position: "absolute",
        left: `${L}px`,
        top: `${g}px`,
        width: `${Math.max(v, 40)}px`,
        // Minimum width for visibility
        height: "60px",
        backgroundColor: p(),
        border: "2px dashed rgba(255, 255, 255, 0.8)",
        borderRadius: "4px",
        pointerEvents: "none",
        zIndex: 1e3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
        fontSize: "10px",
        fontWeight: "600",
        textAlign: "center",
        padding: "2px",
        boxSizing: "border-box",
        opacity: 0.9,
        animation: "pulse 1.5s ease-in-out infinite alternate"
      },
      children: [
        /* @__PURE__ */ f.jsx("div", { style: { fontSize: "16px", marginBottom: "2px" }, children: W() }),
        /* @__PURE__ */ f.jsx("div", { style: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          fontSize: "8px"
        }, children: u }),
        /* @__PURE__ */ f.jsxs("div", { style: { fontSize: "6px", opacity: 0.8 }, children: [
          m.toFixed(1),
          "s"
        ] })
      ]
    }
  );
}, Gn = () => {
  const { state: t, settings: e } = Ut(), { handleTimelineClick: r, handleTimelineMouseDown: l, timelineRef: s } = Ge(), { handleDragOver: d, handleDragLeave: m, handleDrop: v, timelineRef: u } = He(), N = (w) => {
    s && (s.current = w), u && (u.current = w);
  }, g = Oe(() => {
    const w = {}, $ = t.overlays.filter((rt) => rt.type === o.TRANSITION_MERGED), x = /* @__PURE__ */ new Set();
    $.forEach((rt) => {
      const pt = rt, mt = t.overlays.find((bt) => bt.id === pt.fromClipId), Tt = t.overlays.find((bt) => bt.id === pt.toClipId);
      mt && mt.transitionOutId && x.add(mt.transitionOutId), Tt && Tt.transitionInId && x.add(Tt.transitionInId);
    });
    const tt = t.overlays.filter((rt) => !x.has(rt.id));
    return x.size > 0 && (console.log("Hiding transitions due to merged transitions:", Array.from(x)), console.log("Total overlays:", t.overlays.length, "Visible overlays:", tt.length)), tt.forEach((rt) => {
      w[rt.row] || (w[rt.row] = []), w[rt.row].push(rt);
    }), Object.keys(w).forEach((rt) => {
      w[parseInt(rt)].sort((pt, mt) => pt.startTime - mt.startTime);
    }), w;
  }, [t.overlays]), L = Oe(() => {
    const w = [], $ = [];
    return Object.keys(g).forEach((x) => {
      const tt = parseInt(x);
      g[tt].some((pt) => pt.type === o.SOUND) ? $.push(tt) : w.push(tt);
    }), [...w.sort((x, tt) => x - tt), ...$.sort((x, tt) => x - tt)];
  }, [g]), W = Math.max(0, ...Object.keys(g).map(Number)), Z = Math.max(4, W + 1), C = 18, j = t.duration * e.pixelsPerSecond * t.zoom, D = [], c = 5, B = 1, F = 1 / e.fps, q = F * e.pixelsPerSecond * t.zoom, h = q >= 8;
  for (let w = 0; w <= t.duration; w += B) {
    const $ = w * e.pixelsPerSecond * t.zoom + 60, x = w % c === 0;
    D.push(
      /* @__PURE__ */ f.jsx(
        "div",
        {
          className: `timeline-grid-line ${x ? "major" : "minor"}`,
          style: {
            position: "absolute",
            left: `${$}px`,
            top: 0,
            bottom: 0,
            width: "1px",
            backgroundColor: x ? "#444" : "#333",
            opacity: x ? 0.8 : 0.4,
            pointerEvents: "none"
          }
        },
        `grid-${w}`
      )
    ), x && w > 0 && D.push(
      /* @__PURE__ */ f.jsx(
        "div",
        {
          className: "timeline-time-label",
          style: {
            position: "absolute",
            left: `${$ + 4}px`,
            top: "4px",
            fontSize: "10px",
            color: "#888",
            pointerEvents: "none",
            userSelect: "none"
          },
          children: dn(w, { fps: e.fps })
        },
        `label-${w}`
      )
    );
  }
  if (h)
    for (let w = 0; w <= t.duration; w += F) {
      const $ = w * e.pixelsPerSecond * t.zoom + 60, x = Math.round(w * e.fps);
      x % e.fps !== 0 && (D.push(
        /* @__PURE__ */ f.jsx(
          "div",
          {
            className: "timeline-frame-line",
            style: {
              position: "absolute",
              left: `${$}px`,
              top: 0,
              bottom: 0,
              width: "1px",
              backgroundColor: "#555",
              opacity: 0.3,
              pointerEvents: "none"
            }
          },
          `frame-${x}`
        )
      ), x % 5 === 0 && q >= 20 && D.push(
        /* @__PURE__ */ f.jsx(
          "div",
          {
            className: "timeline-frame-label",
            style: {
              position: "absolute",
              left: `${$ + 2}px`,
              top: "16px",
              fontSize: "8px",
              color: "#666",
              pointerEvents: "none",
              userSelect: "none"
            },
            children: x
          },
          `frame-label-${x}`
        )
      ));
    }
  return /* @__PURE__ */ f.jsxs(
    "div",
    {
      ref: N,
      className: "timeline-tracks-container",
      onClick: r,
      onMouseDown: l,
      onDragOver: d,
      onDragLeave: m,
      onDrop: v,
      style: {
        position: "relative",
        width: `${Math.max(j + 60, 800)}px`,
        // Add 60px for track labels
        minHeight: `${C + Z * e.trackHeight}px`,
        backgroundColor: "#1e1e1e",
        cursor: "crosshair"
      },
      children: [
        /* @__PURE__ */ f.jsx("div", { className: "timeline-grid", style: { position: "absolute", inset: 0 }, children: D }),
        /* @__PURE__ */ f.jsxs(
          "div",
          {
            className: "timeline-tracks-wrapper",
            style: { position: "absolute", top: `${C}px`, left: 0, right: 0 },
            children: [
              L.map((w, $) => /* @__PURE__ */ f.jsx(
                Ae,
                {
                  rowIndex: $,
                  overlays: g[w] || []
                },
                w
              )),
              Array.from({ length: Math.max(0, Z - L.length) }, (w, $) => /* @__PURE__ */ f.jsx(
                Ae,
                {
                  rowIndex: L.length + $,
                  overlays: []
                },
                `empty-${$}`
              ))
            ]
          }
        ),
        /* @__PURE__ */ f.jsx($n, {})
      ]
    }
  );
}, Hn = () => {
  const { state: t, settings: e } = Ut(), r = t.currentTime * e.pixelsPerSecond * t.zoom;
  return /* @__PURE__ */ f.jsxs(
    "div",
    {
      className: "playhead",
      style: {
        position: "absolute",
        left: `${r + 60}px`,
        // Offset by track label width
        top: 0,
        bottom: 0,
        width: "2px",
        backgroundColor: "#ff4757",
        pointerEvents: "none",
        zIndex: 100
      },
      children: [
        /* @__PURE__ */ f.jsx(
          "div",
          {
            className: "playhead-handle",
            style: {
              position: "absolute",
              top: "-8px",
              left: "-6px",
              width: "14px",
              height: "16px",
              backgroundColor: "#ff4757",
              clipPath: "polygon(50% 100%, 0 0, 100% 0)",
              pointerEvents: "auto",
              cursor: "pointer"
            }
          }
        ),
        /* @__PURE__ */ f.jsx(
          "div",
          {
            className: "playhead-time",
            style: {
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#ff4757",
              color: "white",
              padding: "2px 6px",
              borderRadius: "3px",
              fontSize: "10px",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              pointerEvents: "none"
            },
            children: me(t.currentTime, { fps: e.fps, showFrames: !0, showHours: !0 })
          }
        )
      ]
    }
  );
}, Wn = 60, Yn = () => {
  const { settings: t, state: e } = Ut(), [r, l] = Gt(null), [s, d] = Gt(!1);
  return se(() => {
    const m = document.querySelector(".timeline-tracks-container");
    if (!m) return;
    const v = () => d(!0), u = () => {
      d(!1), l(null);
    }, N = (g) => {
      const L = m.getBoundingClientRect();
      let W = g.clientX - L.left;
      W = Math.max(Wn, Math.min(L.width, W)), l(W);
    };
    return m.addEventListener("mouseenter", v), m.addEventListener("mouseleave", u), m.addEventListener("mousemove", N), () => {
      m.removeEventListener("mouseenter", v), m.removeEventListener("mouseleave", u), m.removeEventListener("mousemove", N);
    };
  }, [t.pixelsPerSecond, e.zoom]), !s || r == null ? null : /* @__PURE__ */ f.jsx(
    "div",
    {
      className: "cursor-playhead",
      style: {
        position: "absolute",
        left: `${r}px`,
        top: 0,
        bottom: 0,
        width: "2px",
        backgroundColor: "#3b82f6",
        // blue
        pointerEvents: "none",
        zIndex: 99
      },
      children: /* @__PURE__ */ f.jsx(
        "div",
        {
          style: {
            position: "absolute",
            top: "-8px",
            left: "-6px",
            width: "14px",
            height: "16px",
            backgroundColor: "#3b82f6",
            clipPath: "polygon(50% 100%, 0 0, 100% 0)",
            pointerEvents: "none"
          }
        }
      )
    }
  );
}, Kn = () => /* @__PURE__ */ f.jsxs("div", { className: "timeline-container", children: [
  /* @__PURE__ */ f.jsx(zn, {}),
  /* @__PURE__ */ f.jsx("div", { className: "timeline-content", children: /* @__PURE__ */ f.jsxs("div", { className: "timeline-tracks", style: { position: "relative" }, children: [
    /* @__PURE__ */ f.jsx(Gn, {}),
    /* @__PURE__ */ f.jsx(Yn, {}),
    /* @__PURE__ */ f.jsx(Hn, {})
  ] }) })
] });
function Xn() {
  return /* @__PURE__ */ f.jsx(an, { children: /* @__PURE__ */ f.jsx("div", { style: { display: "flex", height: "100vh" }, children: /* @__PURE__ */ f.jsx("div", { style: { flex: 1, overflow: "hidden" }, children: /* @__PURE__ */ f.jsx(Kn, {}) }) }) });
}
export {
  Xn as default
};
