<template>
  <div :class="indentWrapperCls">
    <template v-if="showLine">
      <template v-for="(level, index) in data._level">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          :style="{
            alignSelf: 'stretch',
            width: `${nodeIndent}px`,
          }"
        >
          <polyline
            fill="none"
            :points="polylinePoints(index === data._level - 1)"
            :stroke-width="strokeWidth"
            :stroke="showLineParams.color"
            :stroke-dasharray="strokeDasharray"
          />
        </svg>
      </template>
    </template>
    <div
      :class="wrapperCls"
      :style="{
        paddingLeft: showLine ? 'none' : (usePadding ? `${data._level * nodeIndent}px` : 'inherit'),
        marginLeft: showLine ? 'none' : (usePadding ? 'inherit' : `${data._level * nodeIndent}px`),
      }"
    >
      <div :class="dropBeforeCls"></div>
      <div
        ref="nodeBody"
        :class="nodeBodyCls"
        v-on="dropListeners"
      >
        <!-- 展开按钮 -->
        <div :class="squareCls">
          <!-- 外层用于占位，icon 用于点击 -->
          <i
            v-show="!data.isLeaf && !data._loading"
            :class="expandCls"
            @click="handleExpand"
          ></i>
          <LoadingIcon
            v-if="data._loading"
            :class="loadingIconCls"
          />
        </div>

        <!-- 复选框 -->
        <div
          v-if="showCheckbox"
          :class="squareCls"
        >
          <div
            :class="checkboxCls"
            @click="handleCheck"
          ></div>
        </div>

        <!-- 标题 -->
        <div
          :class="titleCls"
          @click="handleSelect"
          @dblclick="handleDblclick"
          @contextmenu="handleRightClick"
          v-on="dragListeners"
          :draggable="draggable && !disableAll && !data.disabled"
        >
          <slot :node="fullData">
            <component
              v-if="renderFunction"
              :is="renderComponent"
            ></component>
            <template v-else>{{ data[titleField] }}</template>
          </slot>
        </div>
      </div>
      <div :class="dropAfterCls"></div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { VueConstructor, CreateElement, VNode } from 'vue';
import type { TreeNode } from '../store'
import LoadingIcon from './LoadingIcon.vue'
import type { ShowLine } from '../const'
import { dragHoverPartEnum, showLineType } from '../const'
import type CTree from './Tree.vue'

const prefixCls = 'ctree-tree-node'

export default (Vue as VueConstructor<Vue & {
  $refs: {
    nodeBody: HTMLDivElement,
  },
}>).extend({
  name: 'CTreeNode',
  inheritAttrs: false,
  components: {
    LoadingIcon,
  },
  props: {
    /** 节点数据，注意！！为了性能，不让 Vue 监听过多属性，这个 data 不是完整的 TreeNode ，不包括 _parent 和 children 属性 */
    data: Object as () => TreeNode,

    /** 节点标题字段 */
    titleField: String,

    /** 节点唯一标识字段 */
    keyField: String,

    /** 节点渲染 render 函数 */
    render: Function as any as () => (h: CreateElement, node: TreeNode) => VNode,

    /** 是否显示选择框 */
    checkable: Boolean,
    
    /** 是否可单选 */
    selectable: Boolean,

    /** 点击已选中节点是否取消选中 */
    unselectOnClick: Boolean,

    /** 是否禁用所有节点 */
    disableAll: Boolean,

    /** 是否可拖拽 */
    draggable: Boolean,

    /** 是否可放置 */
    droppable: Boolean,

    /**
     * 使用 padding 代替 margin 来展示子节点缩进
     * 此 Prop 是为了方便样式定制，在下个大版本将全部使用 padding
     * @deprecated
     */
     usePadding: Boolean,

    /** 子节点缩进 */
    nodeIndent: {
      type: Number,
      default: 20,
    },

    showLine: {
      type: [
        Boolean,
        Object,
      ],
    },

    noSiblingNodeMap: Object,
  },
  data () {
    return {
      /** 节点拖拽 dragover */
      dragoverBody: false,

      /** 节点前拖拽 dragover */
      dragoverBefore: false,

      /** 节点后拖拽 dragover */
      dragoverAfter: false,
    }
  },
  computed: {
    //#region Classes
    indentWrapperCls (): Array<string | object> {
      return [
        `${prefixCls}__indent-wrapper`,
      ]
    },
    wrapperCls (): Array<string | object> {
      return [
        `${prefixCls}__wrapper`,
        {
          [`${prefixCls}__wrapper_is-leaf`]: this.data.isLeaf,
        },
      ]
    },
    nodeBodyCls (): Array<string | object> {
      return [
        `${prefixCls}__node-body`,
        {
          [`${prefixCls}__drop_active`]: this.dragoverBody,
        },
      ]
    },
    dropBeforeCls (): Array<string | object> {
      return [
        `${prefixCls}__drop`,
        {
          [`${prefixCls}__drop_active`]: this.dragoverBefore,
        },
      ]
    },
    dropAfterCls (): Array<string | object> {
      return [
        `${prefixCls}__drop`,
        {
          [`${prefixCls}__drop_active`]: this.dragoverAfter,
        },
      ]
    },
    squareCls (): string[] {
      return [
        `${prefixCls}__square`,
      ]
    },
    expandCls (): Array<string | object> {
      return [
        `${prefixCls}__expand`,
        {
          [`${prefixCls}__expand_active`]: this.data.expand,
        },
      ]
    },
    loadingIconCls (): string[] {
      return [
        `${prefixCls}__loading-icon`,
      ]
    },
    checkboxCls (): Array<string | object> {
      return [
        `${prefixCls}__checkbox`,
        {
          [`${prefixCls}__checkbox_checked`]: this.data._checked,
          [`${prefixCls}__checkbox_indeterminate`]: this.data.indeterminate,
          [`${prefixCls}__checkbox_disabled`]: this.disableAll || this.data.disabled,
        },
      ]
    },
    titleCls (): Array<string | object> {
      return [
        `${prefixCls}__title`,
        {
          [`${prefixCls}__title_selected`]: this.data._selected,
          [`${prefixCls}__title_disabled`]: this.disableAll || this.data.disabled,
        },
      ]
    },
    //#endregion Classes

    /** 完整的节点 */
    fullData (): TreeNode {
      return (this.$parent as InstanceType<typeof CTree>).getNode(this.data[this.keyField]) || ({} as TreeNode)
    },
    showCheckbox (): boolean {
      return this.checkable
    },
    renderFunction (): ((h: CreateElement, data: TreeNode) => VNode) | null {
      return this.data.render || this.render || null
    },
    renderComponent (): VueConstructor {
      return Vue.extend({
        name: 'Render',
        functional: true,
        render: (h: CreateElement): VNode => {
          if (typeof this.renderFunction !== 'function') return h('div')
          return this.renderFunction(h, this.fullData)
        },
      })
    },

    //#region Drag events
    dragListeners (): object {
      let result = {}
      if (this.draggable && !this.disableAll && !this.data.disabled) {
        result = {
          dragstart: this.handleDragStart,
        }
      }
      return result
    },

    dropListeners (): object {
      let result = {}
      if (this.droppable) {
        result = {
          dragenter: this.handleDragEnter.bind(this),
          dragover: this.handleDragOver.bind(this),
          dragleave: this.handleDragLeave.bind(this),
          drop: this.handleDrop.bind(this),
        }
      }
      return result
    },
    //#endregion Drag events

    // #region show line
    showLineParams (): Required<ShowLine> {
      const defaultParams: Required<ShowLine> = {
        width: 1,
        type: showLineType.solid,
        color: '#D3D3D3',
        polyline: false,
      }
      let params: Required<ShowLine> = defaultParams
      if (typeof this.showLine === 'object') {
        params = {
          width: this.showLine.width != null ? this.showLine.width : defaultParams.width,
          type: this.showLine.type || defaultParams.type,
          color: this.showLine.color || defaultParams.color,
          polyline: this.showLine.polyline != null ? this.showLine.polyline : defaultParams.polyline,
        }
      }
      return params
    },

    strokeWidth (): number {
      return this.showLineParams.width * 100 / this.nodeIndent
    },

    strokeDasharray (): string {
      switch (this.showLineParams.type) {
        case showLineType.dashed:
          return '25'
        default:
          break
      }
      return 'none'
    },
    // #endregion show line
  },
  methods: {
    polylinePoints (isDirectParentLine: boolean): string {
      if (!this.showLineParams.polyline || !isDirectParentLine) return '50,0 50,100'
      const parent = this.fullData && this.fullData._parent
      if (parent && this.noSiblingNodeMap[parent[this.keyField]] && this.noSiblingNodeMap[this.data[this.keyField]]) return '50,0 50,50 100,50 50,50'
      return '50,0 50,50 100,50 50,50 50,100'
    },

    handleExpand (): void {
      if (this.data.isLeaf) return
      this.$emit('expand', this.fullData)
    },

    handleCheck (): void {
      if (this.disableAll || this.data.disabled || !this.checkable) return
      this.$emit('check', this.fullData)
    },

    handleSelect (e: MouseEvent): void {
      this.$emit('click', this.fullData, e)
      if (this.selectable) {
        if (this.disableAll || this.data.disabled) return
        if (this.data._selected && !this.unselectOnClick) return
        this.$emit('select', this.fullData, e)
      } else if (this.checkable) {
        this.handleCheck()
      } else {
        this.handleExpand()
      }
    },

    handleDblclick (e: MouseEvent): void {
      this.$emit('node-dblclick', this.fullData, e)
    },

    handleRightClick (e: MouseEvent): void {
      this.$emit('node-right-click', this.fullData, e)
    },

    //#region Drag handlers
    /** 计算拖拽到节点的哪个部分 */
    getHoverPart (e: DragEvent) {
      const boundingClientRect = this.$refs.nodeBody.getBoundingClientRect()
      const height = boundingClientRect.height
      const y = e.clientY - boundingClientRect.top
      if (y <= height * 0.3) return dragHoverPartEnum.before
      if (y <= height * (0.3 + 0.4)) return dragHoverPartEnum.body
      return dragHoverPartEnum.after
    },

    /**
     * 重置 dragover 标志位
     * @param hoverPart 计算出的拖拽部分
     * @param isLeaveOrDrop 是否是 dragleave 或者 drop 事件，如果是则不再把标志位置为 true
     */
    resetDragoverFlags (hoverPart: dragHoverPartEnum, isLeaveOrDrop = false) {
      this.dragoverBefore = false
      this.dragoverBody = false
      this.dragoverAfter = false
      if (!isLeaveOrDrop) {
        if (hoverPart === dragHoverPartEnum.before) this.dragoverBefore = true
        else if (hoverPart === dragHoverPartEnum.body) this.dragoverBody = true
        else if (hoverPart === dragHoverPartEnum.after) this.dragoverAfter = true
      }
    },

    handleDragStart (e: DragEvent): void {
      if (e.dataTransfer) {
        e.dataTransfer.setData('node', JSON.stringify(this.data))
      }
      if (this.data.expand) this.handleExpand()
      this.$emit('node-dragstart', this.fullData, e)
    },

    handleDragEnter (e: DragEvent): void {
      e.preventDefault()
      const hoverPart = this.getHoverPart(e)
      this.resetDragoverFlags(hoverPart)
      this.$emit('node-dragenter', this.fullData, e, hoverPart)
    },

    handleDragOver (e: DragEvent): void {
      e.preventDefault()
      const hoverPart = this.getHoverPart(e)
      this.resetDragoverFlags(hoverPart)
      this.$emit('node-dragover', this.fullData, e, hoverPart)
    },

    handleDragLeave (e: DragEvent): void {
      const hoverPart = this.getHoverPart(e)
      this.resetDragoverFlags(hoverPart, true)
      this.$emit('node-dragleave', this.fullData, e, hoverPart)
    },

    handleDrop (e: DragEvent): void {
      const hoverPart = this.getHoverPart(e)
      this.resetDragoverFlags(hoverPart, true)
      this.$emit('node-drop', this.fullData, e, hoverPart)
    },
    //#endregion Drag handlers
  },
})
</script>
