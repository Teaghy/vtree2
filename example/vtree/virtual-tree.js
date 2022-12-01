var M = Object.defineProperty;
var O = (s, e, t) => e in s ? M(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var f = (s, e, t) => (O(s, typeof e != "symbol" ? e + "" : e, t), t);
import m from "vue";
const H = [
  "_level",
  "_filterVisible",
  "_parent",
  "_loading",
  "_loaded",
  "_remote",
  "_keyField",
  "children",
  "setChildren"
];
class C {
  constructor(e, t = null, i = "id", r = !1) {
    f(this, "_level", 0);
    f(this, "checked", !1);
    f(this, "selected", !1);
    f(this, "indeterminate", !1);
    f(this, "disabled", !1);
    f(this, "expand", !1);
    f(this, "visible", !0);
    f(this, "_filterVisible", !0);
    f(this, "_parent", null);
    f(this, "children", []);
    f(this, "isLeaf", !1);
    f(this, "_loading", !1);
    f(this, "_loaded", !1);
    this._keyField = i, this._remote = r;
    for (let a in e)
      H.indexOf(a) === -1 && (this[a] = e[a]);
    this[i] == null && (this[i] = Math.random().toString(36).substring(2)), this._parent = t, this._parent && (this._level = this._parent._level + 1), this.visible = this._parent === null || this._parent.expand && this._parent.visible, Array.isArray(e.children) && this.setChildren(e.children), this.children.length && (this._loaded = !0), this._remote || (this.isLeaf = !this.children.length);
  }
  setChildren(e) {
    this.children = e.map((t) => new C(Object.assign({}, t), this, this._keyField, this._remote));
  }
}
var x = /* @__PURE__ */ ((s) => (s.none = "none", s.parents = "parents", s.children = "children", s))(x || {});
const K = [
  "setData",
  "setChecked",
  "setCheckedKeys",
  "checkAll",
  "clearChecked",
  "setSelected",
  "clearSelected",
  "setExpand",
  "setExpandKeys",
  "setExpandAll",
  "getCheckedNodes",
  "getCheckedKeys",
  "getIndeterminateNodes",
  "getSelectedNode",
  "getSelectedKey",
  "getExpandNodes",
  "getExpandKeys",
  "getCurrentVisibleNodes",
  "getNode",
  "getTreeData",
  "getFlatData",
  "getNodesCount",
  "insertBefore",
  "insertAfter",
  "append",
  "prepend",
  "remove",
  "filter",
  "showCheckedNodes",
  "loadRootNodes",
  "scrollTo"
], P = ["clearKeyword", "getKeyword", "search"];
var R = /* @__PURE__ */ ((s) => (s["bottom-start"] = "bottom-start", s["bottom-end"] = "bottom-end", s.bottom = "bottom", s["top-start"] = "top-start", s["top-end"] = "top-end", s.top = "top", s))(R || {}), S = /* @__PURE__ */ ((s) => (s.top = "top", s.center = "center", s.bottom = "bottom", s))(S || {}), k = /* @__PURE__ */ ((s) => (s.before = "before", s.body = "body", s.after = "after", s))(k || {});
class W {
  constructor(e) {
    f(this, "data", []);
    f(this, "flatData", []);
    f(this, "mapData", /* @__PURE__ */ Object.create(null));
    f(this, "unloadCheckedKeys", []);
    f(this, "unloadSelectedKey", null);
    f(this, "currentSelectedKey", null);
    f(this, "listenersMap", {});
    this.options = e;
  }
  setData(e, t = null, i = null) {
    this.data = e.map(
      (r) => new C(r, null, this.options.keyField, !!this.options.load)
    );
    for (let r in this.mapData)
      delete this.mapData[r];
    this.currentSelectedKey = null, this.flatData = this.flattenData(this.data), this.setUnloadCheckedKeys(i || []), t && (this.currentSelectedKey = null, this.setUnloadSelectedKey(t)), this.emit("visible-data-change"), this.emit("set-data");
  }
  setChecked(e, t, i = !0, r = !0, a = !1) {
    const n = this.mapData[e];
    if (!n)
      return this.setUnloadChecked(e, t, i, r);
    n.disabled || n.checked && t || !n.checked && !n.indeterminate && !t || (this.options.cascade ? (this.checkNodeDownward(n, t, a), this.checkNodeUpward(n)) : n.checked = t, i && (n.checked ? this.emit("check", n) : this.emit("uncheck", n)), this.triggerCheckedChange(i, r));
  }
  setUnloadChecked(e, t, i = !0, r = !0) {
    const a = this.findIndex(e, this.unloadCheckedKeys);
    t ? a === -1 && this.unloadCheckedKeys.push(e) : a !== -1 && this.unloadCheckedKeys.splice(a, 1), this.triggerCheckedChange(i, r);
  }
  setCheckedKeys(e, t, i = !0, r = !0) {
    e.forEach((a) => {
      this.setChecked(a, t, !1, !1);
    }), this.triggerCheckedChange(i, r);
  }
  checkAll(e = !0, t = !0) {
    if (this.options.cascade) {
      const i = (r) => {
        r.forEach((a) => {
          a.disabled ? i(a.children) : this.setChecked(a[this.options.keyField], !0, !1, !1);
        });
      };
      i(this.data);
    } else {
      const i = this.flatData.length;
      for (let r = 0; r < i; r++) {
        const a = this.flatData[r];
        this.setChecked(a[this.options.keyField], !0, !1, !1);
      }
    }
    this.triggerCheckedChange(e, t);
  }
  clearChecked(e = !0, t = !0) {
    this.getCheckedNodes().forEach((r) => {
      this.setChecked(r[this.options.keyField], !1, !1, !1);
    }), this.unloadCheckedKeys = [], this.triggerCheckedChange(e, t);
  }
  triggerCheckedChange(e = !0, t = !0) {
    e && this.emit("checked-change", this.getCheckedNodes(), this.getCheckedKeys()), t && this.emit("render-data-change");
  }
  setSelected(e, t, i = !0, r = !0) {
    const a = this.mapData[e];
    if (!a)
      return this.setUnloadSelected(e, t, i, r);
    a.disabled || a.selected !== t && (e === this.currentSelectedKey ? t || (a.selected = t, this.currentSelectedKey = null) : t && (this.currentSelectedKey === null ? (a.selected = t, this.currentSelectedKey = a[this.options.keyField]) : (this.mapData[this.currentSelectedKey] && (this.mapData[this.currentSelectedKey].selected = !1), a.selected = t, this.currentSelectedKey = a[this.options.keyField])), i && (a.selected ? this.emit("select", a) : this.emit("unselect", a), this.emit("selected-change", this.getSelectedNode(), this.getSelectedKey())), r && this.emit("render-data-change"));
  }
  setUnloadSelected(e, t, i = !0, r = !0) {
    t ? (this.currentSelectedKey && this.setSelected(this.currentSelectedKey, !1, !1, !1), this.unloadSelectedKey = e) : this.unloadSelectedKey === e && (this.unloadSelectedKey = null), i && this.emit("selected-change", this.getSelectedNode(), this.getSelectedKey()), r && this.emit("render-data-change");
  }
  clearSelected(e = !0, t = !0) {
    this.currentSelectedKey && this.mapData[this.currentSelectedKey] ? this.setSelected(this.currentSelectedKey, !1, e, t) : this.unloadSelectedKey !== null && (this.unloadSelectedKey = null, e && this.emit("selected-change", this.getSelectedNode(), this.getSelectedKey()), t && this.emit("render-data-change"));
  }
  setExpand(e, t, i = !1, r = !0, a = !0) {
    const n = this.mapData[e];
    if (!(!n || !i && n.isLeaf) && n.expand !== t) {
      if (!n.isLeaf) {
        if (typeof this.options.load == "function") {
          if (!n._loaded && !n._loading && t) {
            n._loading = !0, a && this.emit("visible-data-change"), new Promise((l, d) => {
              const h = this.options.load;
              h(n, l, d);
            }).then((l) => {
              if (Array.isArray(l)) {
                const d = this.findIndex(n);
                if (d === -1)
                  return;
                n._loaded = !0, n.expand = t, n.setChildren(l);
                const h = this.getCheckedKeys(), c = this.flattenData(
                  n.children,
                  this.getSelectedKey === null
                );
                this.flatData.splice(d + 1, 0, ...c), this.setUnloadCheckedKeys(h), this.unloadSelectedKey !== null && this.setUnloadSelectedKey(this.unloadSelectedKey), this.emit("set-data");
              }
            }).catch((l) => {
              let d = l;
              l instanceof Error || (d = new Error(l)), console.error(d);
            }).then(() => {
              n._loading = !1, r && this.emit("expand", n), a && this.emit("visible-data-change");
            });
            return;
          } else if (n._loading)
            return;
        }
        n.expand = t;
        const o = [...n.children];
        for (; o.length; )
          o[0].expand && o[0].children.length && o.push(...o[0].children), o[0]._filterVisible === !1 ? o[0].visible = !1 : o[0].visible = o[0]._parent === null || o[0]._parent.expand && o[0]._parent.visible, o.shift();
        r && this.emit("expand", n), a && this.emit("visible-data-change");
      }
      i && n._parent && t && this.setExpand(
        n._parent[this.options.keyField],
        t,
        i,
        !1,
        a
      );
    }
  }
  setExpandKeys(e, t, i = !0) {
    e.forEach((r) => {
      this.setExpand(r, t, !1, !1, !1);
    }), i && this.emit("visible-data-change");
  }
  setExpandAll(e, t = !0) {
    this.flatData.forEach((i) => {
      (!this.options.load || i._loaded) && this.setExpand(i[this.options.keyField], e, !1, !1, !1);
    }), t && this.emit("visible-data-change");
  }
  getCheckedNodes(e = this.options.ignoreMode) {
    if (e === x.children) {
      const t = [], i = (r) => {
        r.forEach((a) => {
          a.checked ? t.push(a) : !a.isLeaf && a.indeterminate && i(a.children);
        });
      };
      return i(this.data), t;
    } else
      return this.flatData.filter((t) => e === x.parents ? t.checked && t.isLeaf : t.checked);
  }
  getCheckedKeys(e = this.options.ignoreMode) {
    return this.getCheckedNodes(e).map((t) => t[this.options.keyField]).concat(this.unloadCheckedKeys);
  }
  getIndeterminateNodes() {
    return this.flatData.filter((e) => e.indeterminate);
  }
  getSelectedNode() {
    return this.currentSelectedKey === null ? null : this.mapData[this.currentSelectedKey] || null;
  }
  getSelectedKey() {
    return this.currentSelectedKey || this.unloadSelectedKey || null;
  }
  getUnloadCheckedKeys() {
    return this.unloadCheckedKeys;
  }
  getExpandNodes() {
    return this.flatData.filter((e) => !e.isLeaf && e.expand);
  }
  getExpandKeys() {
    return this.getExpandNodes().map((e) => e[this.options.keyField]);
  }
  getNode(e) {
    return this.mapData[e] || null;
  }
  insertBefore(e, t) {
    const i = this.getInsertedNode(e, t);
    if (!i)
      return null;
    this.remove(i[this.options.keyField], !1);
    const a = this.mapData[t]._parent, n = this.findIndex(t, a && a.children), o = this.findIndex(t), l = a && -1 || this.findIndex(t, this.data);
    return this.insertIntoStore(i, a, n, o, l), this.emit("visible-data-change"), i;
  }
  insertAfter(e, t) {
    const i = this.getInsertedNode(e, t);
    if (!i)
      return null;
    this.remove(i[this.options.keyField], !1);
    const r = this.mapData[t], a = r._parent, n = this.findIndex(t, a && a.children) + 1, o = this.flatData.length, l = this.findIndex(t);
    let d = l + 1;
    for (let c = l + 1; c <= o; c++) {
      if (c === o) {
        d = c;
        break;
      }
      if (this.flatData[c]._level <= r._level) {
        d = c;
        break;
      }
    }
    const h = a && -1 || this.findIndex(t, this.data) + 1;
    return this.insertIntoStore(i, a, n, d, h), this.emit("visible-data-change"), i;
  }
  append(e, t) {
    const i = this.mapData[t];
    if (!i.isLeaf) {
      const n = i.children.length;
      return this.insertAfter(
        e,
        i.children[n - 1][this.options.keyField]
      );
    }
    const r = this.getInsertedNode(e, t, !0);
    if (!r)
      return null;
    this.remove(r[this.options.keyField], !1);
    const a = this.findIndex(t) + 1;
    return this.insertIntoStore(r, i, 0, a), this.emit("visible-data-change"), r;
  }
  prepend(e, t) {
    const i = this.mapData[t];
    if (!i.isLeaf)
      return this.insertBefore(e, i.children[0][this.options.keyField]);
    const r = this.getInsertedNode(e, t, !0);
    if (!r)
      return null;
    this.remove(r[this.options.keyField], !1);
    const a = this.findIndex(t) + 1;
    return this.insertIntoStore(r, i, 0, a), this.emit("visible-data-change"), r;
  }
  remove(e, t = !0) {
    const i = this.mapData[e];
    if (!i)
      return null;
    const r = this.findIndex(i);
    if (r === -1)
      return null;
    let a = 1;
    const n = this.flatData.length;
    for (let l = r + 1; l < n && this.flatData[l]._level > i._level; l++)
      a++;
    this.flatData.splice(r, a);
    const o = (l) => {
      const d = this.mapData[l];
      delete this.mapData[l], d.children.forEach((h) => o(h[this.options.keyField]));
    };
    if (o(e), !i._parent) {
      const l = this.findIndex(i, this.data);
      l > -1 && this.data.splice(l, 1);
    }
    if (i._parent) {
      const l = this.findIndex(i, i._parent.children);
      l !== -1 && i._parent.children.splice(l, 1), i._parent.isLeaf = !i._parent.children.length, i._parent.isLeaf && (i._parent.expand = !1, i._parent.indeterminate = !1), this.updateMovingNodeStatus(i);
    }
    return t && this.emit("visible-data-change"), i;
  }
  getInsertedNode(e, t, i = !1) {
    const r = this.mapData[t];
    if (!r)
      return null;
    const a = i ? r : r._parent;
    if (e instanceof C)
      return e[this.options.keyField] === t ? null : e;
    if (typeof e == "object") {
      if (e[this.options.keyField] === t)
        return null;
      const n = this.mapData[e[this.options.keyField]];
      return n || new C(e, a, this.options.keyField, !!this.options.load);
    } else
      return !this.mapData[e] || e === t ? null : this.mapData[e];
  }
  insertIntoStore(e, t, i, r, a) {
    if (r === -1)
      return;
    i !== -1 && t && t.children.splice(i, 0, e), e._parent = t, t ? (t.isLeaf = !1, this.setExpand(t[this.options.keyField], !0, !1, !1, !1)) : typeof a == "number" && a > -1 && this.data.splice(a, 0, e);
    const n = this.flattenData([e]);
    e._level = t ? t._level + 1 : 0, n.forEach(
      (o) => o._level = o._parent ? o._parent._level + 1 : 0
    ), this.flatData.splice(r, 0, ...n), this.updateMovingNodeStatus(e);
  }
  updateMovingNodeStatus(e) {
    this.checkNodeUpward(e), this.triggerCheckedChange(), e.selected && this.setSelected(e[this.options.keyField], !0);
  }
  filter(e, t) {
    const i = [];
    this.flatData.forEach((r) => {
      r._filterVisible = r._parent && r._parent._filterVisible || t(e, r), r.visible = r._filterVisible, r._filterVisible && i.push(r);
    }), i.forEach((r) => {
      const a = [];
      let n = r._parent;
      for (; n; )
        a.unshift(n), n = n._parent;
      a.forEach((o) => {
        o._filterVisible = !0, o.visible = (o._parent === null || o._parent.expand && o._parent.visible) && o._filterVisible, this.options.expandOnFilter && this.setExpand(o[this.options.keyField], !0, !1, !1, !1);
      }), r.visible = r._parent === null || r._parent.expand && r._parent.visible;
    }), this.emit("visible-data-change");
  }
  setUnloadCheckedKeys(e) {
    this.unloadCheckedKeys = e;
    const t = e.concat(), i = this.unloadCheckedKeys.length;
    for (let a = i - 1; a >= 0; a--) {
      const n = this.unloadCheckedKeys[a];
      this.mapData[n] && (this.setChecked(n, !0, !1, !1), this.unloadCheckedKeys.splice(a, 1));
    }
    const r = this.getCheckedKeys();
    r.length === t.length && r.every(
      (a) => t.some((n) => n === a)
    ) || this.emit("checked-change", this.getCheckedNodes(), r);
  }
  setUnloadSelectedKey(e) {
    const t = this.getSelectedKey();
    this.mapData[e] ? (this.setSelected(e, !0, !1), this.unloadSelectedKey = null) : (this.currentSelectedKey && this.setSelected(this.currentSelectedKey, !1, !1), this.unloadSelectedKey = e);
    const i = this.getSelectedKey();
    i !== t && this.emit("selected-change", this.getSelectedNode(), i);
  }
  flattenData(e, t = !0, i = []) {
    const r = e.length;
    for (let a = 0; a < r; a++) {
      const n = e[a], o = n[this.options.keyField];
      if (i.push(n), this.mapData[o])
        throw new Error("[CTree] Duplicate tree node key.");
      this.mapData[o] = n, n.checked && this.options.cascade && (this.checkNodeDownward(n, !0), this.checkNodeUpward(n)), n.selected && t && (this.clearSelected(!1, !1), this.currentSelectedKey = n[this.options.keyField], this.emit("selected-change", n, this.currentSelectedKey)), (this.options.defaultExpandAll || n.expand) && !this.options.load && !n.isLeaf && (n.expand = !1, this.setExpand(n[this.options.keyField], !0, !1, !1, !1)), n.children.length && this.flattenData(n.children, t, i);
    }
    return i;
  }
  checkNodeDownward(e, t, i = !1) {
    if (e.children.forEach((r) => {
      this.checkNodeDownward(r, t, i);
    }), e.isLeaf || this.options.load && !e.children.length) {
      if (!e.disabled) {
        if (i && !this.options.filteredNodeCheckable && !e._filterVisible)
          return;
        e.checked = t, e.indeterminate = !1;
      }
    } else
      this.checkParentNode(e);
  }
  checkNodeUpward(e) {
    let t = e._parent;
    for (; t; )
      this.checkParentNode(t), t = t._parent;
  }
  checkParentNode(e) {
    const t = e.children.length;
    if (!t)
      return;
    let i = !1, r = !1, a = !1;
    for (let n = 0; n < t; n++) {
      const o = e.children[n];
      if (o.checked ? i = !0 : r = !0, i && r || o.indeterminate) {
        a = !0, e.checked = !1, e.indeterminate = !0;
        break;
      }
    }
    a || (e.checked = i, e.indeterminate = !1);
  }
  findIndex(e, t = this.flatData) {
    if (t !== null) {
      let i = e instanceof C ? e[this.options.keyField] : e;
      const r = t.length;
      for (let a = 0; a < r; a++)
        if (t[0] instanceof C) {
          if (i === t[a][this.options.keyField])
            return a;
        } else if (i === t[a])
          return a;
    }
    return -1;
  }
  on(e, t) {
    this.listenersMap[e] || (this.listenersMap[e] = []);
    let i = [];
    Array.isArray(t) ? i = t : i = [t], i.forEach((r) => {
      this.listenersMap[e].indexOf(r) === -1 && this.listenersMap[e].push(r);
    });
  }
  off(e, t) {
    if (!!this.listenersMap[e])
      if (!t)
        this.listenersMap[e] = [];
      else {
        const i = this.listenersMap[e].indexOf(t);
        i > -1 && this.listenersMap[e].splice(i, 1);
      }
  }
  emit(e, ...t) {
    if (!this.listenersMap[e])
      return;
    const i = this.listenersMap[e].length;
    for (let r = 0; r < i; r++)
      this.listenersMap[e][r](...t);
  }
}
const U = m.extend({
  name: "CLoadingIcon"
});
function b(s, e, t, i, r, a, n, o) {
  var l = typeof s == "function" ? s.options : s;
  e && (l.render = e, l.staticRenderFns = t, l._compiled = !0), i && (l.functional = !0), a && (l._scopeId = "data-v-" + a);
  var d;
  if (n ? (d = function(_) {
    _ = _ || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext, !_ && typeof __VUE_SSR_CONTEXT__ < "u" && (_ = __VUE_SSR_CONTEXT__), r && r.call(this, _), _ && _._registeredComponents && _._registeredComponents.add(n);
  }, l._ssrRegister = d) : r && (d = o ? function() {
    r.call(
      this,
      (l.functional ? this.parent : this).$root.$options.shadowRoot
    );
  } : r), d)
    if (l.functional) {
      l._injectStyles = d;
      var h = l.render;
      l.render = function(L, w) {
        return d.call(w), h(L, w);
      };
    } else {
      var c = l.beforeCreate;
      l.beforeCreate = c ? [].concat(c, d) : [d];
    }
  return {
    exports: s,
    options: l
  };
}
var V = function() {
  var e = this, t = e._self._c;
  return e._self._setupProxy, t("svg", { attrs: { viewBox: "0 0 50 50" } }, [t("circle", { staticClass: "ctree-loading-icon__circle", attrs: { cx: "25", cy: "25", r: "20", fill: "none", "stroke-width": "5", "stroke-miterlimit": "10" } })]);
}, X = [], Y = /* @__PURE__ */ b(
  U,
  V,
  X,
  !1,
  null,
  null,
  null,
  null
);
const F = Y.exports, u = "ctree-tree-node", j = m.extend({
  name: "CTreeNode",
  inheritAttrs: !1,
  components: {
    LoadingIcon: F
  },
  props: {
    data: Object,
    titleField: String,
    keyField: String,
    render: Function,
    checkable: Boolean,
    selectable: Boolean,
    unselectOnClick: Boolean,
    disableAll: Boolean,
    draggable: Boolean,
    droppable: Boolean
  },
  data() {
    return {
      dragoverBody: !1,
      dragoverBefore: !1,
      dragoverAfter: !1
    };
  },
  computed: {
    wrapperCls() {
      return [
        `${u}__wrapper`,
        {
          [`${u}__wrapper_is-leaf`]: this.data.isLeaf
        }
      ];
    },
    nodeBodyCls() {
      return [
        `${u}__node-body`,
        {
          [`${u}__drop_active`]: this.dragoverBody
        }
      ];
    },
    dropBeforeCls() {
      return [
        `${u}__drop`,
        {
          [`${u}__drop_active`]: this.dragoverBefore
        }
      ];
    },
    dropAfterCls() {
      return [
        `${u}__drop`,
        {
          [`${u}__drop_active`]: this.dragoverAfter
        }
      ];
    },
    squareCls() {
      return [`${u}__square`];
    },
    expandCls() {
      return [
        `${u}__expand`,
        {
          [`${u}__expand_active`]: this.data.expand
        }
      ];
    },
    loadingIconCls() {
      return [`${u}__loading-icon`];
    },
    checkboxCls() {
      return [
        `${u}__checkbox`,
        {
          [`${u}__checkbox_checked`]: this.data.checked,
          [`${u}__checkbox_indeterminate`]: this.data.indeterminate,
          [`${u}__checkbox_disabled`]: this.disableAll || this.data.disabled
        }
      ];
    },
    titleCls() {
      return [
        `${u}__title`,
        {
          [`${u}__title_selected`]: this.data.selected,
          [`${u}__title_disabled`]: this.disableAll || this.data.disabled
        }
      ];
    },
    fullData() {
      return this.$parent.getNode(this.data[this.keyField]) || {};
    },
    showCheckbox() {
      return this.checkable;
    },
    renderFunction() {
      return this.data.render || this.render || null;
    },
    renderComponent() {
      return m.extend({
        name: "Render",
        functional: !0,
        render: (s) => typeof this.renderFunction != "function" ? s("div") : this.renderFunction(s, this.fullData)
      });
    },
    dragListeners() {
      let s = {};
      return this.draggable && !this.disableAll && !this.data.disabled && (s = {
        dragstart: this.handleDragStart
      }), s;
    },
    dropListeners() {
      let s = {};
      return this.droppable && (s = {
        dragenter: this.handleDragEnter.bind(this),
        dragover: this.handleDragOver.bind(this),
        dragleave: this.handleDragLeave.bind(this),
        drop: this.handleDrop.bind(this)
      }), s;
    }
  },
  methods: {
    handleExpand() {
      this.data.isLeaf || this.$emit("expand", this.fullData);
    },
    handleCheck() {
      this.disableAll || this.data.disabled || !this.checkable || this.$emit("check", this.fullData);
    },
    handleSelect() {
      if (this.$emit("click", this.fullData), this.selectable) {
        if (this.disableAll || this.data.disabled || this.data.selected && !this.unselectOnClick)
          return;
        this.$emit("select", this.fullData);
      } else
        this.checkable ? this.handleCheck() : this.handleExpand();
    },
    handleDblclick() {
      this.$emit("node-dblclick", this.fullData);
    },
    handleRightClick() {
      this.$emit("node-right-click", this.fullData);
    },
    getHoverPart(s) {
      const e = this.$refs.nodeBody.getBoundingClientRect(), t = e.height, i = s.clientY - e.top;
      return i <= t * 0.3 ? k.before : i <= t * (0.3 + 0.4) ? k.body : k.after;
    },
    resetDragoverFlags(s, e = !1) {
      this.dragoverBefore = !1, this.dragoverBody = !1, this.dragoverAfter = !1, e || (s === k.before ? this.dragoverBefore = !0 : s === k.body ? this.dragoverBody = !0 : s === k.after && (this.dragoverAfter = !0));
    },
    handleDragStart(s) {
      s.dataTransfer && s.dataTransfer.setData("node", JSON.stringify(this.data)), this.data.expand && this.handleExpand(), this.$emit("node-dragstart", this.fullData, s);
    },
    handleDragEnter(s) {
      s.preventDefault();
      const e = this.getHoverPart(s);
      this.resetDragoverFlags(e), this.$emit("node-dragenter", this.fullData, s, e);
    },
    handleDragOver(s) {
      s.preventDefault();
      const e = this.getHoverPart(s);
      this.resetDragoverFlags(e), this.$emit("node-dragover", this.fullData, s, e);
    },
    handleDragLeave(s) {
      const e = this.getHoverPart(s);
      this.resetDragoverFlags(e, !0), this.$emit("node-dragleave", this.fullData, s, e);
    },
    handleDrop(s) {
      const e = this.getHoverPart(s);
      this.resetDragoverFlags(e, !0), this.$emit("node-drop", this.fullData, s, e);
    }
  }
});
var q = function() {
  var e = this, t = e._self._c;
  return e._self._setupProxy, t("div", { class: e.wrapperCls }, [t("div", { class: e.dropBeforeCls }), t("div", e._g({ ref: "nodeBody", class: e.nodeBodyCls }, e.dropListeners), [t("div", { class: e.squareCls }, [t("i", { directives: [{ name: "show", rawName: "v-show", value: !e.data.isLeaf && !e.data._loading, expression: "!data.isLeaf && !data._loading" }], class: e.expandCls, on: { click: e.handleExpand } }), e.data._loading ? t("LoadingIcon", { class: e.loadingIconCls }) : e._e()], 1), e.showCheckbox ? t("div", { class: e.squareCls }, [t("div", { class: e.checkboxCls, on: { click: e.handleCheck } })]) : e._e(), t("div", e._g({ class: e.titleCls, attrs: { draggable: e.draggable && !e.disableAll && !e.data.disabled }, on: { click: e.handleSelect, dblclick: e.handleDblclick, contextmenu: e.handleRightClick } }, e.dragListeners), [e.renderFunction ? t(e.renderComponent, { tag: "component" }) : [e._v(e._s(e.data[e.titleField]))]], 2)]), t("div", { class: e.dropAfterCls })]);
}, z = [], J = /* @__PURE__ */ b(
  j,
  q,
  z,
  !1,
  null,
  null,
  null,
  null
);
const G = J.exports, y = "ctree-tree", $ = [
  "expand",
  "select",
  "unselect",
  "selected-change",
  "check",
  "uncheck",
  "checked-change",
  "set-data"
], Q = ["node-drop"], Z = (s, e) => {
  if (Array.isArray(s) && Array.isArray(e)) {
    if (s.length === e.length && s.every((t) => e.some((i) => i === t)))
      return !0;
  } else if (s === e)
    return !0;
  return !1;
}, ee = m.extend({
  name: "CTree",
  components: {
    CTreeNode: G,
    LoadingIcon: F
  },
  props: {
    value: [String, Number, Array],
    data: {
      type: Array,
      default: () => []
    },
    unloadDataList: {
      type: Array,
      default: () => []
    },
    showUnloadCheckedNodes: {
      type: Boolean,
      default: !0
    },
    emptyText: {
      type: String,
      default: "\u6682\u65E0\u6570\u636E"
    },
    titleField: {
      type: String,
      default: "title"
    },
    keyField: {
      type: String,
      default: "id"
    },
    separator: {
      type: String,
      default: ","
    },
    checkable: {
      type: Boolean,
      default: !1
    },
    selectable: {
      type: Boolean,
      default: !1
    },
    filteredNodeCheckable: {
      type: Boolean,
      default: !1
    },
    cascade: {
      type: Boolean,
      default: !0
    },
    enableLeafOnly: {
      type: Boolean,
      default: !1
    },
    disableAll: {
      type: Boolean,
      default: !1
    },
    defaultExpandAll: {
      type: Boolean,
      default: !1
    },
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    expandedKeys: {
      type: Array,
      default: () => []
    },
    draggable: {
      type: Boolean,
      default: !1
    },
    droppable: {
      type: Boolean,
      default: !1
    },
    beforeDropMethod: {
      type: Function,
      default: () => () => !0
    },
    ignoreMode: {
      type: String,
      default: x.none
    },
    autoLoad: {
      type: Boolean,
      default: !0
    },
    load: Function,
    render: Function,
    filterMethod: Function,
    expandOnFilter: {
      type: Boolean,
      default: !0
    },
    unselectOnClick: {
      type: Boolean,
      default: !0
    },
    loading: {
      type: Boolean,
      default: !1
    },
    nodeMinHeight: {
      type: Number,
      default: 30
    },
    nodeIndent: {
      type: Number,
      default: 20
    },
    renderNodeAmount: {
      type: Number,
      default: 100
    },
    bufferNodeAmount: {
      type: Number,
      default: 20
    },
    nodeClassName: {
      type: [
        String,
        Object,
        Array,
        Function
      ]
    },
    usePadding: {
      type: Boolean,
      default: !1
    }
  },
  data() {
    const s = Array.isArray(this.value) ? this.value.concat() : this.value;
    return {
      unloadCheckedNodes: [],
      blockLength: 0,
      blockAreaHeight: 0,
      topSpaceHeight: 0,
      bottomSpaceHeight: 0,
      renderAmount: 0,
      renderAmountCache: 0,
      renderNodes: [],
      renderStart: 0,
      renderStartCache: 0,
      isRootLoading: !1,
      valueCache: s,
      debounceTimer: void 0
    };
  },
  computed: {
    topSpaceStyles() {
      return {
        height: `${this.topSpaceHeight}px`
      };
    },
    bottomSpaceStyles() {
      return {
        height: `${this.bottomSpaceHeight}px`
      };
    },
    wrapperCls() {
      return [`${y}__wrapper`];
    },
    scrollAreaCls() {
      return [`${y}__scroll-area`];
    },
    blockAreaCls() {
      return [`${y}__block-area`];
    },
    emptyCls() {
      return [`${y}__empty`];
    },
    emptyTextDefaultCls() {
      return [`${y}__empty-text_default`];
    },
    loadingCls() {
      return [`${y}__loading`];
    },
    loadingWrapperCls() {
      return [`${y}__loading-wrapper`];
    },
    loadingIconCls() {
      return [`${y}__loading-icon`];
    },
    iframeCls() {
      return [`${y}__iframe`];
    },
    treeNodeListeners() {
      let s = {};
      for (let e in this.$listeners)
        $.indexOf(e) === -1 && Q.indexOf(e) === -1 && (s[e] = this.$listeners[e]);
      return s;
    }
  },
  methods: {
    setData(s) {
      this.resetSpaceHeights();
      let e = null, t = null;
      this.checkable ? Array.isArray(this.value) ? e = this.value.concat() : typeof this.value == "string" && (e = this.value === "" ? [] : this.value.split(this.separator)) : this.selectable && !Array.isArray(this.value) && (t = this.value), this.nonReactive.store.setData(
        s,
        t,
        e
      ), this.updateExpandedKeys();
    },
    setChecked(s, e) {
      this.nonReactive.store.setChecked(s, e);
    },
    setCheckedKeys(s, e) {
      this.nonReactive.store.setCheckedKeys(s, e);
    },
    checkAll() {
      this.nonReactive.store.checkAll();
    },
    clearChecked() {
      this.nonReactive.store.clearChecked();
    },
    setSelected(s, e) {
      this.nonReactive.store.setSelected(s, e);
    },
    clearSelected() {
      this.nonReactive.store.clearSelected();
    },
    setExpand(s, e, t = !0) {
      this.nonReactive.store.setExpand(s, e, t);
    },
    setExpandKeys(s, e) {
      this.nonReactive.store.setExpandKeys(s, e);
    },
    setExpandAll(s) {
      this.nonReactive.store.setExpandAll(s);
    },
    getCheckedNodes(s) {
      return s = s || this.ignoreMode, this.nonReactive.store.getCheckedNodes(s);
    },
    getCheckedKeys(s) {
      return s = s || this.ignoreMode, this.nonReactive.store.getCheckedKeys(s);
    },
    getIndeterminateNodes() {
      return this.nonReactive.store.getIndeterminateNodes();
    },
    getSelectedNode() {
      return this.nonReactive.store.getSelectedNode();
    },
    getSelectedKey() {
      return this.nonReactive.store.getSelectedKey();
    },
    getExpandNodes() {
      return this.nonReactive.store.getExpandNodes();
    },
    getExpandKeys() {
      return this.nonReactive.store.getExpandKeys();
    },
    getCurrentVisibleNodes() {
      return this.nonReactive.store.flatData.filter((s) => s._filterVisible);
    },
    getNode(s) {
      return this.nonReactive.store.getNode(s);
    },
    getTreeData() {
      return this.nonReactive.store.data;
    },
    getFlatData() {
      return this.nonReactive.store.flatData;
    },
    getNodesCount() {
      return this.nonReactive.store.flatData.length;
    },
    insertBefore(s, e) {
      return this.nonReactive.store.insertBefore(s, e);
    },
    insertAfter(s, e) {
      return this.nonReactive.store.insertAfter(s, e);
    },
    append(s, e) {
      return this.nonReactive.store.append(s, e);
    },
    prepend(s, e) {
      return this.nonReactive.store.prepend(s, e);
    },
    remove(s) {
      return this.nonReactive.store.remove(s);
    },
    filter(s, e) {
      const t = (i, r) => {
        const a = r[this.titleField];
        return a == null || !a.toString ? !1 : a.toString().toLowerCase().indexOf(i.toLowerCase()) > -1;
      };
      e = e || this.filterMethod || t, this.nonReactive.store.filter(s, e);
    },
    showCheckedNodes(s) {
      if (!this.checkable)
        return;
      s = s == null ? this.showUnloadCheckedNodes : s;
      const e = this.nonReactive.store.getCheckedNodes();
      if (this.nonReactive.store.filter("", (i, r) => r.checked), !s)
        return;
      const t = this.nonReactive.store.getUnloadCheckedKeys();
      if (t.length) {
        const i = t.map((r) => {
          const a = this.unloadDataList.concat(e);
          let n = r;
          return a.some((o) => o[this.keyField] === r && o[this.titleField] != null ? (n = o[this.titleField], !0) : !1), new C(
            {
              [this.keyField]: r,
              [this.titleField]: n,
              checked: !0,
              isLeaf: !0
            },
            null,
            this.keyField,
            !!this.load
          );
        });
        this.unloadCheckedNodes = i, this.nonReactive.blockNodes.push(...i), this.updateBlockData(), this.updateRender();
      }
    },
    loadRootNodes() {
      return this.isRootLoading = !0, new Promise((s, e) => {
        this.load(null, s, e);
      }).then((s) => {
        Array.isArray(s) && this.setData(s);
      }).catch(() => {
      }).then(() => {
        this.isRootLoading = !1;
      });
    },
    scrollTo(s, e = S.top) {
      const t = this.nonReactive.store.mapData[s];
      if (!t || !t.visible)
        return;
      let i = -1;
      for (let a = 0; a < this.blockLength; a++)
        if (this.nonReactive.blockNodes[a][this.keyField] === s) {
          i = a;
          break;
        }
      if (i === -1)
        return;
      let r = i * this.nodeMinHeight;
      if (e === S.center) {
        const a = this.$refs.scrollArea.clientHeight;
        r = r - (a - this.nodeMinHeight) / 2;
      } else if (e === S.bottom) {
        const a = this.$refs.scrollArea.clientHeight;
        r = r - (a - this.nodeMinHeight);
      } else
        typeof e == "number" && (r = r - e);
      this.$refs.scrollArea.scrollTop = r;
    },
    updateExpandedKeys() {
      this.expandedKeys.length && (this.nonReactive.store.setExpandAll(!1, !1), this.nonReactive.store.setExpandKeys(this.expandedKeys, !0));
    },
    updateUnloadStatus() {
      if (this.unloadCheckedNodes.length) {
        const s = this.nonReactive.store.getUnloadCheckedKeys();
        this.unloadCheckedNodes.forEach((e) => {
          e.checked = s.indexOf(e[this.keyField]) > -1;
        });
      }
    },
    handleNodeCheck(s) {
      !this.cascade && this.enableLeafOnly && !s.isLeaf || this.nonReactive.store.setChecked(
        s[this.keyField],
        s.indeterminate ? !1 : !s.checked,
        !0,
        !0,
        !0
      );
    },
    handleNodeSelect(s) {
      this.enableLeafOnly && !s.isLeaf || this.nonReactive.store.setSelected(s[this.keyField], !s.selected);
    },
    handleNodeExpand(s) {
      this.nonReactive.store.setExpand(s[this.keyField], !s.expand);
    },
    handleNodeDrop(s, e, t) {
      if (!!this.droppable && e.dataTransfer)
        try {
          const r = JSON.parse(e.dataTransfer.getData("node"))[this.keyField], a = s[this.keyField];
          if (this.beforeDropMethod(r, a, t)) {
            if (r === a)
              return;
            t === k.before ? this.nonReactive.store.insertBefore(r, a) : t === k.body || !s.isLeaf && s.expand ? this.nonReactive.store.prepend(r, a) : t === k.after && this.nonReactive.store.insertAfter(r, a), this.$emit("node-drop", s, e, t, this.getNode(r));
          }
        } catch (i) {
          throw new Error(i);
        }
    },
    emitCheckableInput(s, e) {
      if (this.checkable) {
        let t = e;
        Array.isArray(this.value) || (t = t.join(this.separator)), Array.isArray(t) ? this.valueCache = t.concat() : this.valueCache = t, this.$emit("input", t);
      }
    },
    emitSelectableInput(s, e) {
      if (this.selectable && !this.checkable) {
        const t = e || "";
        this.valueCache = t, this.$emit("input", t);
      }
    },
    attachStoreEvents() {
      for (let s in this.$listeners)
        if ($.indexOf(s) > -1) {
          const e = s;
          this.nonReactive.store.on(
            e,
            this.$listeners[s]
          );
        }
    },
    resetSpaceHeights() {
      this.topSpaceHeight = 0, this.bottomSpaceHeight = 0, this.$refs.scrollArea.scrollTop = 0;
    },
    updateBlockNodes() {
      this.nonReactive.blockNodes = this.nonReactive.store.flatData.filter((s) => s.visible), this.updateBlockData(), this.updateRender();
    },
    updateBlockData() {
      this.blockLength = this.nonReactive.blockNodes.length, this.blockAreaHeight = this.nodeMinHeight * this.blockLength;
    },
    updateRender() {
      this.updateRenderAmount(), this.updateRenderNodes();
    },
    updateRenderAmount() {
      const s = this.$refs.scrollArea.clientHeight;
      this.renderAmount = Math.max(
        this.renderNodeAmount,
        Math.ceil(s / this.nodeMinHeight) + this.bufferNodeAmount
      );
    },
    updateRenderNodes(s = !1) {
      if (this.blockLength > this.renderAmount) {
        const e = this.$refs.scrollArea.scrollTop, t = Math.floor(e / this.nodeMinHeight);
        this.renderStart = Math.floor(t / this.bufferNodeAmount) * this.bufferNodeAmount;
      } else
        this.renderStart = 0;
      s && this.renderAmountCache === this.renderAmount && this.renderStartCache === this.renderStart || (this.renderNodes = this.nonReactive.blockNodes.slice(this.renderStart, this.renderStart + this.renderAmount).map((e) => Object.assign({}, e, {
        _parent: null,
        children: []
      })), this.topSpaceHeight = this.renderStart * this.nodeMinHeight, this.bottomSpaceHeight = this.blockAreaHeight - (this.topSpaceHeight + this.renderNodes.length * this.nodeMinHeight));
    },
    handleTreeScroll() {
      this.debounceTimer && window.cancelAnimationFrame(this.debounceTimer), this.renderAmountCache = this.renderAmount, this.renderStartCache = this.renderStart, this.debounceTimer = window.requestAnimationFrame(this.updateRenderNodes.bind(this, !0));
    }
  },
  created() {
    const {
      keyField: s,
      ignoreMode: e,
      filteredNodeCheckable: t,
      cascade: i,
      defaultExpandAll: r,
      load: a,
      expandOnFilter: n
    } = this;
    this.nonReactive = {
      store: new W({
        keyField: s,
        ignoreMode: e,
        filteredNodeCheckable: t,
        cascade: i,
        defaultExpandAll: r,
        load: a,
        expandOnFilter: n
      }),
      blockNodes: []
    }, this.nonReactive.store.on("visible-data-change", this.updateBlockNodes), this.nonReactive.store.on("render-data-change", this.updateRender), this.nonReactive.store.on(
      "checked-change",
      (o, l) => {
        this.emitCheckableInput(o, l), this.updateUnloadStatus();
      }
    ), this.nonReactive.store.on("selected-change", this.emitSelectableInput), this.attachStoreEvents();
  },
  mounted() {
    this.data.length ? (this.setData(this.data), this.defaultExpandedKeys.length && this.nonReactive.store.setExpandKeys(this.defaultExpandedKeys, !0)) : typeof this.load == "function" && this.autoLoad && this.loadRootNodes();
    const s = this.$refs.iframe;
    s.contentWindow && s.contentWindow.addEventListener("resize", this.updateRender);
  },
  beforeDestroy() {
    const s = this.$refs.iframe;
    s.contentWindow && s.contentWindow.removeEventListener("resize", this.updateRender);
  },
  watch: {
    value(s) {
      if (this.checkable) {
        if (Z(s, this.valueCache))
          return;
        let e = [];
        Array.isArray(s) ? e = s.concat() : typeof s == "string" && (e = s === "" ? [] : s.split(this.separator)), this.nonReactive.store.clearChecked(!1, !1), this.nonReactive.store.setCheckedKeys(e, !0);
      } else if (this.selectable) {
        if (s === this.valueCache)
          return;
        const e = this.nonReactive.store.getSelectedKey();
        s !== "" && s != null ? this.nonReactive.store.setSelected(s, !0) : (s === "" || s == null) && e && this.nonReactive.store.setSelected(e, !1);
      }
    },
    data: {
      deep: !0,
      handler(s) {
        this.setData(s);
      }
    },
    expandedKeys() {
      this.updateExpandedKeys();
    },
    $listeners() {
      this.attachStoreEvents();
    }
  }
});
var te = function() {
  var e = this, t = e._self._c;
  return e._self._setupProxy, t("div", { class: e.wrapperCls }, [t("div", { ref: "scrollArea", class: e.scrollAreaCls, on: { "&scroll": function(i) {
    return i.stopPropagation(), e.handleTreeScroll.apply(null, arguments);
  } } }, [t("div", { class: e.blockAreaCls }, [t("div", { style: e.topSpaceStyles }), e._l(e.renderNodes, function(i, r) {
    return t("CTreeNode", e._g(e._b({ key: i[e.keyField], class: typeof e.nodeClassName == "function" ? e.nodeClassName(i) : e.nodeClassName, style: {
      minHeight: `${e.nodeMinHeight}px`,
      marginLeft: e.usePadding ? null : `${i._level * e.nodeIndent}px`,
      paddingLeft: e.usePadding ? `${i._level * e.nodeIndent}px` : null
    }, attrs: { data: i }, on: { check: e.handleNodeCheck, select: e.handleNodeSelect, expand: e.handleNodeExpand, "node-drop": e.handleNodeDrop } }, "CTreeNode", e.$props, !1), e.treeNodeListeners));
  }), t("div", { style: e.bottomSpaceStyles })], 2)]), t("div", { directives: [{ name: "show", rawName: "v-show", value: !e.blockLength, expression: "!blockLength" }], class: e.emptyCls }, [t("span", { class: e.emptyTextDefaultCls }, [e._t("empty", function() {
    return [e._v(" " + e._s(e.emptyText) + " ")];
  })], 2)]), t("div", { directives: [{ name: "show", rawName: "v-show", value: e.loading || e.isRootLoading, expression: "loading || isRootLoading" }], class: e.loadingCls }, [t("div", { class: e.loadingWrapperCls }, [e._t("loading", function() {
    return [t("LoadingIcon", { class: e.loadingIconCls })];
  })], 2)]), t("iframe", { ref: "iframe", class: e.iframeCls })]);
}, se = [], ie = /* @__PURE__ */ b(
  ee,
  te,
  se,
  !1,
  null,
  null,
  null,
  null
);
const E = ie.exports, p = "ctree-tree-search", v = "ctree-tree-node";
let T = {};
const D = E.options.methods;
for (let s in D) {
  const e = s;
  if (K.indexOf(e) > -1) {
    const t = T;
    t[e] = function(...i) {
      return D[e].apply(this.$refs.tree, i);
    };
  }
}
const re = m.extend({
  name: "CTreeSearch",
  inheritAttrs: !1,
  components: {
    CTree: E
  },
  props: {
    value: {},
    searchPlaceholder: {
      type: String,
      default: "\u641C\u7D22\u5173\u952E\u5B57"
    },
    showCheckAll: {
      type: Boolean,
      default: !0
    },
    showCheckedButton: {
      type: Boolean,
      default: !0
    },
    checkedButtonText: {
      type: String,
      default: "\u5DF2\u9009"
    },
    showFooter: {
      type: Boolean,
      default: !0
    },
    searchMethod: Function,
    searchLength: {
      type: Number,
      default: 1
    },
    searchDisabled: {
      type: Boolean,
      default: !1
    },
    searchRemote: {
      type: Boolean,
      default: !1
    },
    searchDebounceTime: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      checkAllStatus: {
        checked: !1,
        indeterminate: !1,
        disabled: !1
      },
      isShowingChecked: !1,
      keyword: "",
      debounceTimer: void 0,
      checkedCount: 0
    };
  },
  computed: {
    wrapperCls() {
      return [`${p}__wrapper`];
    },
    searchCls() {
      return [`${p}__search`];
    },
    checkAllWrapperCls() {
      return [`${p}__check-all-wrapper`];
    },
    checkboxCls() {
      return [
        `${p}__check-all`,
        `${v}__checkbox`,
        {
          [`${v}__checkbox_checked`]: this.checkAllStatus.checked,
          [`${v}__checkbox_indeterminate`]: this.checkAllStatus.indeterminate,
          [`${v}__checkbox_disabled`]: this.searchDisabled || this.checkAllStatus.disabled
        }
      ];
    },
    inputWrapperCls() {
      return [`${p}__input-wrapper`];
    },
    inputCls() {
      return [
        `${p}__input`,
        {
          [`${p}__input_disabled`]: this.searchDisabled
        }
      ];
    },
    actionWrapperCls() {
      return [`${p}__action-wrapper`];
    },
    checkedButtonCls() {
      return [
        `${p}__checked-button`,
        {
          [`${p}__checked-button_active`]: this.isShowingChecked
        }
      ];
    },
    treeWrapperCls() {
      return [`${p}__tree-wrapper`];
    },
    footerCls() {
      return [`${p}__footer`];
    },
    checkable() {
      return "checkable" in this.$attrs && this.$attrs.checkable !== !1;
    }
  },
  methods: {
    ...T,
    clearKeyword() {
      this.keyword = "";
    },
    getKeyword() {
      return this.keyword;
    },
    search(s) {
      let e = s;
      return typeof s != "string" && (e = this.keyword), new Promise((t, i) => {
        clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(() => {
          if (!(e.length > 0 && e.length < this.searchLength))
            if (this.isShowingChecked = !1, this.$emit("search", e), typeof this.searchMethod == "function") {
              const r = this.searchMethod(e);
              Promise.resolve(r).then(() => {
                this.updateCheckAllStatus(), t();
              });
            } else
              this.searchRemote ? this.$refs.tree.loadRootNodes().then(() => {
                this.updateCheckAllStatus(), t();
              }) : (this.$refs.tree.filter(e), this.updateCheckAllStatus(), t());
        }, this.searchDebounceTime);
      });
    },
    handleCheckAll() {
      if (this.searchDisabled || this.checkAllStatus.disabled)
        return;
      const s = this.$refs.tree.getCurrentVisibleNodes().map((e) => e[this.$refs.tree.keyField]);
      this.checkAllStatus.checked || this.checkAllStatus.indeterminate ? this.$refs.tree.setCheckedKeys(s, !1) : this.$refs.tree.setCheckedKeys(s, !0), this.updateCheckAllStatus();
    },
    handleSearch() {
      this.search();
    },
    handleShowChecked() {
      const s = () => {
        this.isShowingChecked = !this.isShowingChecked, this.isShowingChecked ? this.$refs.tree.showCheckedNodes() : this.$refs.tree.filter(this.keyword, () => !0), this.updateCheckAllStatus();
      };
      this.keyword ? (this.clearKeyword(), this.search().then(() => {
        s();
      })) : s();
    },
    handleSetData() {
      this.updateCheckedCount(), this.updateCheckAllStatus();
    },
    updateCheckAllStatus() {
      const s = this.$refs.tree.getCurrentVisibleNodes(), e = s.length;
      let t = !1, i = !1, r = !1;
      for (let a = 0; a < e; a++) {
        const n = s[a];
        if (n.checked ? t = !0 : i = !0, t && i || n.indeterminate) {
          r = !0, this.checkAllStatus.checked = !1, this.checkAllStatus.indeterminate = !0;
          break;
        }
      }
      r || (this.checkAllStatus.checked = t, this.checkAllStatus.indeterminate = !1);
    },
    updateCheckedCount() {
      this.checkedCount = this.$refs.tree.getCheckedKeys().length;
    }
  },
  mounted() {
    this.checkable && !this.checkedCount && this.handleSetData();
  }
});
var ae = function() {
  var e = this, t = e._self._c;
  return e._self._setupProxy, t("div", { class: e.wrapperCls }, [t("div", { class: e.searchCls }, [e.showCheckAll && e.checkable ? t("div", { class: e.checkAllWrapperCls }, [t("div", { class: e.checkboxCls, on: { click: e.handleCheckAll } })]) : e._e(), t("div", { class: e.inputWrapperCls }, [e._t("search-input", function() {
    return [t("input", { directives: [{ name: "model", rawName: "v-model", value: e.keyword, expression: "keyword" }], class: e.inputCls, attrs: { type: "text", placeholder: e.searchPlaceholder, disabled: e.searchDisabled }, domProps: { value: e.keyword }, on: { input: [function(i) {
      i.target.composing || (e.keyword = i.target.value);
    }, e.handleSearch] } })];
  })], 2), t("div", { class: e.actionWrapperCls }, [e.showCheckedButton && e.checkable ? t("span", { class: e.checkedButtonCls, on: { click: e.handleShowChecked } }, [e._v(" " + e._s(e.checkedButtonText) + " ")]) : e._e(), e._t("actions")], 2)]), t("div", { class: e.treeWrapperCls }, [t("CTree", e._g(e._b({ ref: "tree", attrs: { value: e.value }, on: { input: e.updateCheckedCount, "set-data": e.handleSetData, "checked-change": e.updateCheckAllStatus }, scopedSlots: e._u([e._l(e.$scopedSlots, function(i, r) {
    return { key: r, fn: function(a) {
      return [e._t(r, null, null, a)];
    } };
  })], null, !0) }, "CTree", e.$attrs, !1), e.$listeners))], 1), e.showFooter && e.checkable ? t("div", { class: e.footerCls }, [e._t("footer", function() {
    return [t("span", { staticStyle: { float: "right" } }, [e._v("\u5DF2\u9009 " + e._s(e.checkedCount) + " \u4E2A")])];
  })], 2) : e._e()]);
}, ne = [], le = /* @__PURE__ */ b(
  re,
  ae,
  ne,
  !1,
  null,
  null,
  null,
  null
);
const B = le.exports, g = "ctree-tree-drop", A = "ctree-tree-search";
let I = {}, oe = K.concat(P);
const N = B.options.methods;
for (let s in N) {
  const e = s;
  if (oe.indexOf(e) > -1) {
    const t = I;
    t[e] = function(...i) {
      return N[e].apply(
        this.$refs.treeSearch,
        i
      );
    };
  }
}
const de = m.extend({
  name: "CTreeDrop",
  inheritAttrs: !1,
  components: {
    CTreeSearch: B
  },
  props: {
    value: {},
    dropHeight: {
      type: Number,
      default: 300
    },
    dropPlaceholder: {
      type: String
    },
    dropDisabled: {
      type: Boolean,
      default: !1
    },
    clearable: {
      type: Boolean,
      default: !1
    },
    placement: {
      type: String,
      default: R["bottom-start"]
    },
    transfer: {
      type: Boolean,
      default: !1
    },
    dropdownClassName: {
      type: [String, Array]
    },
    dropdownMinWidth: {
      type: Number
    },
    dropdownWidthFixed: {
      type: Boolean,
      default: !1
    }
  },
  data() {
    return {
      dropdownVisible: !1,
      checkedCount: 0,
      selectedTitle: "",
      slotProps: {
        checkedNodes: [],
        checkedKeys: [],
        selectedNode: null,
        selectedKey: null
      }
    };
  },
  computed: {
    wrapperCls() {
      return [`${g}__wrapper`];
    },
    referenceCls() {
      return [`${g}__reference`];
    },
    displayInputCls() {
      return [
        `${A}__input`,
        `${g}__display-input`,
        {
          [`${g}__display-input_focus`]: this.dropdownVisible,
          [`${A}__input_disabled`]: this.dropDisabled
        }
      ];
    },
    displayInputTextCls() {
      let s = !1;
      return typeof this.dropPlaceholder == "string" && (this.checkable ? s = this.checkedCount === 0 : this.selectable && (s = this.selectedTitle === "")), [
        `${g}__display-input-text`,
        {
          [`${g}__display-input-placeholder`]: s
        }
      ];
    },
    dropIconCls() {
      return [
        `${g}__display-icon-drop`,
        {
          [`${g}__display-icon-drop_active`]: this.dropdownVisible
        }
      ];
    },
    clearIconCls() {
      return [`${g}__display-icon-clear`];
    },
    dropdownCls() {
      const s = Array.isArray(this.dropdownClassName) ? this.dropdownClassName : [this.dropdownClassName];
      return [`${g}__dropdown`, ...s];
    },
    checkable() {
      return "checkable" in this.$attrs && this.$attrs.checkable !== !1;
    },
    selectable() {
      return "selectable" in this.$attrs && this.$attrs.selectable !== !1;
    },
    displayValue() {
      return this.checkable ? this.checkedCount === 0 && typeof this.dropPlaceholder == "string" ? this.dropPlaceholder : `\u5DF2\u9009 ${this.checkedCount} \u4E2A` : this.selectable ? this.selectedTitle === "" && typeof this.dropPlaceholder == "string" ? this.dropPlaceholder : this.selectedTitle : this.dropPlaceholder || "";
    },
    showClearIcon() {
      return this.checkable ? this.checkedCount !== 0 : this.selectable ? this.selectedTitle !== "" : !1;
    }
  },
  methods: {
    ...I,
    locateDropdown() {
      const s = this.$refs.reference.getBoundingClientRect(), e = s.width, t = s.height, i = `${typeof this.dropdownMinWidth == "number" ? this.dropdownMinWidth : e}px`;
      this.$refs.dropdown.style.minWidth = i, this.$refs.dropdown.style.width = this.dropdownWidthFixed ? i : "auto";
      const r = this.$refs.dropdown.getBoundingClientRect(), a = window.getComputedStyle(this.$refs.dropdown), n = parseFloat(a.marginLeft) + parseFloat(a.marginRight), o = parseFloat(a.marginTop) + parseFloat(a.marginBottom), l = r.width + n, d = r.height / 0.8 + o;
      let h = 0, c = 0;
      switch (this.transfer && (h = -999, c = -999), this.placement) {
        case "bottom-start":
          this.transfer ? (h = window.pageYOffset + s.bottom, c = window.pageXOffset + s.left) : h = t;
          break;
        case "bottom-end":
          this.transfer ? (h = window.pageYOffset + s.bottom, c = window.pageXOffset + s.right - l) : (h = t, c = e - l);
          break;
        case "bottom":
          this.transfer ? (h = window.pageYOffset + s.bottom, c = window.pageXOffset + s.left + (e - l) / 2) : (h = t, c = (e - l) / 2);
          break;
        case "top-start":
          this.transfer ? (h = window.pageYOffset + s.top - d, c = window.pageXOffset + s.left) : h = -d;
          break;
        case "top-end":
          this.transfer ? (h = window.pageYOffset + s.top - d, c = window.pageXOffset + s.right - l) : (h = -d, c = e - l);
          break;
        case "top":
          this.transfer ? (h = window.pageYOffset + s.top - d, c = window.pageXOffset + s.left + (e - l) / 2) : (h = -d, c = (e - l) / 2);
          break;
      }
      this.$refs.dropdown.style.top = `${h}px`, this.$refs.dropdown.style.left = `${c}px`;
    },
    handleRefClick() {
      this.dropDisabled || (this.dropdownVisible = !this.dropdownVisible);
    },
    handleDocumentClick(s) {
      !this.$refs || !this.$refs.reference.contains(s.target) && !this.$refs.dropdown.contains(s.target) && (this.dropdownVisible = !1);
    },
    handleClear() {
      this.$emit("clear"), this.checkable ? this.clearChecked() : this.selectable && this.clearSelected();
    },
    handleCheckedChange(s, e) {
      this.slotProps.checkedNodes = s, this.slotProps.checkedKeys = e, this.checkedCount = e.length;
    },
    handleSelectedChange(s, e) {
      if (this.slotProps.selectedNode = s, this.slotProps.selectedKey = e, s) {
        const t = this.$refs.treeSearch.$refs.tree.titleField;
        this.selectedTitle = s[t];
      } else
        e ? this.selectedTitle = e : this.selectedTitle = "";
      this.dropdownVisible = !1;
    },
    handleSetData() {
      if (this.slotProps.checkedNodes = this.getCheckedNodes(), this.slotProps.checkedKeys = this.getCheckedKeys(), this.slotProps.selectedNode = this.getSelectedNode(), this.slotProps.selectedKey = this.getSelectedKey(), this.checkable && (this.checkedCount = this.slotProps.checkedKeys.length), this.selectable && this.value != null) {
        const s = this.getNode(this.value);
        if (s) {
          const e = this.$refs.treeSearch.$refs.tree.titleField;
          this.selectedTitle = s[e];
        } else
          this.selectedTitle = this.value;
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleDocumentClick), this.transfer && document.body.appendChild(this.$refs.dropdown), this.handleSetData();
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleDocumentClick), this.$refs.dropdown.remove();
  },
  watch: {
    dropdownVisible(s) {
      this.$emit("dropdown-visible-change", s), s ? this.$nextTick(() => {
        this.locateDropdown();
      }) : this.$refs.treeSearch.getKeyword() && (this.$refs.treeSearch.clearKeyword(), this.$refs.treeSearch.search());
    }
  }
});
var he = function() {
  var e = this, t = e._self._c;
  return e._self._setupProxy, t("div", { class: e.wrapperCls }, [t("div", { ref: "reference", class: e.referenceCls, on: { click: e.handleRefClick } }, [e._t("default", function() {
    return [t("div", { class: e.displayInputCls }, [t("span", { class: e.displayInputTextCls }, [e._t("display", function() {
      return [e._v(" " + e._s(e.displayValue) + " ")];
    }, null, e.slotProps)], 2), e.dropDisabled ? e._e() : [t("i", { class: e.dropIconCls }), e.clearable && e.showClearIcon ? e._t("clear", function() {
      return [t("i", { class: e.clearIconCls, on: { click: function(i) {
        return i.stopPropagation(), e.handleClear.apply(null, arguments);
      } } })];
    }) : e._e()]], 2)];
  }, null, e.slotProps)], 2), t("transition", { attrs: { name: "ctree-dropdown" } }, [t("div", { directives: [{ name: "show", rawName: "v-show", value: e.dropdownVisible, expression: "dropdownVisible" }], ref: "dropdown", class: e.dropdownCls, style: {
    height: `${e.dropHeight}px`
  } }, [t("CTreeSearch", e._g(e._b({ ref: "treeSearch", attrs: { value: e.value }, on: { "set-data": e.handleSetData, "checked-change": e.handleCheckedChange, "selected-change": e.handleSelectedChange }, scopedSlots: e._u([e._l(e.$scopedSlots, function(i, r) {
    return { key: r, fn: function(a) {
      return [e._t(r, null, null, a)];
    } };
  })], null, !0) }, "CTreeSearch", e.$attrs, !1), e.$listeners))], 1)])], 1);
}, ce = [], fe = /* @__PURE__ */ b(
  de,
  he,
  ce,
  !1,
  null,
  null,
  null,
  null
);
const ge = fe.exports;
export {
  ge as CTreeDrop,
  G as CTreeNode,
  B as CTreeSearch,
  E as default
};
