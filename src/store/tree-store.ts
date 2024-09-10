import TreeNode from './tree-node'
import { ignoreEnum } from '../const'
import type { ITreeNodeOptions } from './tree-node'
import type { TreeNodeKeyType, IgnoreType } from '../const'

//#region Interfaces

interface ITreeStoreOptions {
  [key: string]: any,
  keyField: string,
  ignoreMode?: IgnoreType,
  filteredNodeCheckable?: boolean,
  cascade?: boolean,
  defaultExpandAll?: boolean,
  load?: Function,
  expandOnFilter?: boolean,
}

interface IMapData {
  [key: string]: TreeNode,
  [key: number]: TreeNode,
}

interface IListenersMap {
  [eventName: string]: Function[],
}

export interface IEventNames {
  'set-data': () => void,
  'visible-data-change': () => void,
  'render-data-change': () => void,
  'expand': NodeGeneralListenerType,
  'select': NodeGeneralListenerType,
  'unselect': NodeGeneralListenerType,
  'selected-change': (node: TreeNode[] | null, key: TreeNodeKeyType[] | null) => void,
  'check': NodeGeneralListenerType,
  'uncheck': NodeGeneralListenerType,
  'checked-change': (nodes: TreeNode[], keys: TreeNodeKeyType[]) => void,
}

//#endregion Interfaces

//#region Types

type NodeGeneralListenerType = (node: TreeNode) => void

export type ListenerType<T extends keyof IEventNames> = IEventNames[T]

export type FilterFunctionType = (keyword: string, node: TreeNode) => boolean

//#endregion Types

export default class TreeStore {
  //#region Properties

  /** 树数据 */
  data: TreeNode[] = []

  /** 扁平化的树数据 */
  flatData: TreeNode[] = []

  /** 树数据 map */
  mapData: IMapData = Object.create(null)

  /** 未加载但已选中的节点 key ，每次 flattenData 的时候进行检查，将加载的节点从此数组中剔除 */
  private unloadCheckedKeys: TreeNodeKeyType[] = []

  /** 未加载但选中的单选节点 key */
  private unloadSelectedKeys: TreeNodeKeyType[] | null = null

  /** 当前选中节点 keys */
  private currentSelectedKeys: TreeNodeKeyType[] | null = null

  /** 事件 listeners */
  private listenersMap: IListenersMap = {}

  //#endregion Properties

  constructor (private readonly options: ITreeStoreOptions) {
  }

  /**
   * Use this function to insert nodes into flatData to avoid 'maximun call stack size exceeded' error
   * @param insertIndex The index to insert, the same usage as `this.flatData.splice(insertIndex, 0, insertNodes)`
   * @param insertNodes Tree nodes to insert
   */
  private insertIntoFlatData(insertIndex: number, insertNodes: TreeNode[]) {
    this.flatData = this.flatData.slice(0, insertIndex).concat(insertNodes, this.flatData.slice(insertIndex))
  }

  setData (data: ITreeNodeOptions[], selectableUnloadKey: TreeNodeKeyType[] | null = null, checkableUnloadKeys: TreeNodeKeyType[] | null = null): void {
    this.data = data.map((nodeData: ITreeNodeOptions): TreeNode => new TreeNode(nodeData, null, this.options.keyField, !!this.options.load))
    // 清空 mapData
    for (let key in this.mapData) delete this.mapData[key]
    // 扁平化之前清空单选选中，如果 value 有值，则是 selectableUnloadKey 有值，会重新设置 currentSelectedKeys ；多选选中没有存储在 store 中，因此不必事先清空。
    this.currentSelectedKeys = null
    // 扁平化节点数据
    this.flatData = this.flattenData(this.data)
    // 更新未载入多选选中节点
    this.setUnloadCheckedKeys(checkableUnloadKeys || [])
    if (selectableUnloadKey) {
      // 更新未载入单选选中节点
      this.currentSelectedKeys = null
      this.setUnloadSelectedKeys(selectableUnloadKey)
    }
    this.emit('visible-data-change')
    this.emit('set-data')
  }

  //#region Set api

  /**
   * 设置单个节点多选选中
   * @param key 设置的节点 key
   * @param value 是否选中
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发 `data-change` 事件以通知外部刷新视图
   * @param filtering 是否正在过滤，如果是，则考虑 `filteredNodeCheckable` Prop，用于判断是否是用户点击节点触发的勾选
   */
  setChecked (key: TreeNodeKeyType, value: boolean, triggerEvent: boolean = true, triggerDataChange: boolean = true, filtering: boolean = false): void {
    const node = this.mapData[key]
    if (!node) return this.setUnloadChecked(key, value, triggerEvent, triggerDataChange)
    if (node.disabled) return

    // 首先确定没有变化的情况
    if (node._checked && value) return // 已经勾选的再次勾选，直接返回
    if (!node._checked && !node.indeterminate && !value) return // 未勾选且不是半选状态再次设置未勾选，直接返回

    if (this.options.cascade) {
      // 向下勾选，包括自身
      this.checkNodeDownward(node, value, filtering)
      // 向上勾选父节点直到根节点
      this.checkNodeUpward(node)
    } else {
      node._checked = value
    }

    if (triggerEvent) {
      if (node._checked) {
        this.emit('check', node)
      } else {
        this.emit('uncheck', node)
      }
    }

    this.triggerCheckedChange(triggerEvent, triggerDataChange)
  }

  /**
   * 设置单个未加载节点选中，不公开此 API
   */
  private setUnloadChecked (key: TreeNodeKeyType, value: boolean,  triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    const index = this.findIndex(key, this.unloadCheckedKeys)
    if (value) {
      if (index === -1) {
        this.unloadCheckedKeys.push(key)
      }
    } else {
      if (index !== -1) {
        this.unloadCheckedKeys.splice(index, 1)
      }
    }

    this.triggerCheckedChange(triggerEvent, triggerDataChange)
  }

  /**
   * 批量选中/取消多选选中节点
   * @param keys 选中的节点 key 数组
   * @param value 是否选中
   * @param triggerEvent 是否触发事件
   */
  setCheckedKeys (keys: TreeNodeKeyType[], value: boolean, triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    keys.forEach((key) => {
      this.setChecked(key, value, false, false)
    })

    this.triggerCheckedChange(triggerEvent, triggerDataChange)
  }

  /**
   * 多选勾选全部节点
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发视图刷新
   */
  checkAll (triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    if (this.options.cascade) {
      // 级联时，只要勾选第一层节点即可，如果第一层被禁用了，则往下一层勾选
      const checkCascade = (nodes: TreeNode[]): void => {
        nodes.forEach((node) => {
          if (node.disabled) {
            checkCascade(node.children)
          } else {
            this.setChecked(node[this.options.keyField], true, false, false)
          }
        })
      }
      checkCascade(this.data)
    } else {
      const length = this.flatData.length
      for (let i = 0; i < length; i++) {
        const node = this.flatData[i]
        this.setChecked(node[this.options.keyField], true, false, false)
      }
    }

    this.triggerCheckedChange(triggerEvent, triggerDataChange)
  }

  /**
   * 清除所有多选已选
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发视图刷新
   */
  clearChecked (triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    const currentCheckedNodes = this.getCheckedNodes()
    currentCheckedNodes.forEach((checkedNode) => {
      this.setChecked(checkedNode[this.options.keyField], false, false, false)
    })
    // 清空未加载多选选中节点
    this.unloadCheckedKeys = []

    this.triggerCheckedChange(triggerEvent, triggerDataChange)
  }

  /**
   * 触发 checked-change 的快捷方法
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发视图刷新
   */
  private triggerCheckedChange (triggerEvent: boolean = true, triggerDataChange: boolean = true) {
    if (triggerEvent) {
      this.emit('checked-change', this.getCheckedNodes(), this.getCheckedKeys())
    }

    if (triggerDataChange) {
      this.emit('render-data-change')
    }
  }

  /**
   * 设置单选选中
   * @param key 选中节点 key
   * @param value 是否选中
   * @param triggerEvent 是否触发事件
   */
  setSelected (key: TreeNodeKeyType, value: boolean, triggerEvent: boolean = true, triggerDataChange: boolean = true, isMultiple: boolean = false): void {
    const node = this.mapData[key]
    if (!node) return this.setUnloadSelected(key, value, triggerEvent, triggerDataChange, isMultiple)
    if (node.disabled) return

    if (node._selected === value) return // 当前节点已经是将要设置的状态，直接返回

    if (this.currentSelectedKeys?.includes(key)) { // 设置的节点即当前已选中节点
      if (!value) { // 取消当前选中节点
        node._selected = value
        this.currentSelectedKeys = this.currentSelectedKeys.filter(item => item !== key)
      }
    } else { // 设置的节点不是当前已选中节点，要么当前没有选中节点，要么当前有选中节点
      if (value) {
        if (this.currentSelectedKeys === null) { // 当前没有选中节点
          node._selected = value
          this.currentSelectedKeys = [node[this.options.keyField]]
        } else { 
          if (isMultiple) {
            // 多选不需要让其他节点的select状态变化
            node._selected = value
            this.currentSelectedKeys.push(node[this.options.keyField])
          } else {
            // 单选需要取消其它选中
            this.currentSelectedKeys.forEach(itemKey => {
              if (this.mapData[itemKey]) {
                this.mapData[itemKey]._selected = false
              }
            });
            node._selected = value
            this.currentSelectedKeys = [node[this.options.keyField]]
          }
         
        }
      }
    }

    if (triggerEvent) {
      if (node._selected) {
        this.emit('select', node)
      } else {
        this.emit('unselect', node)
      }

      this.emit('selected-change', this.getSelectedNode(), this.getSelectedKey())
    }

    if (triggerDataChange) {
      this.emit('render-data-change')
    }
  }

  /**
   * 设置多选选中
   * @param keys 选中节点 key
   * @param triggerEvent 是否触发事件
   */
  setSelectedKeys (keys: TreeNodeKeyType[], triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    keys.forEach((key) => {
      this.setSelected(key, true, false, false, true)
    })

    this.triggerSelectChange(triggerEvent, triggerDataChange)
  }

  /**
   * 触发 selected-change 的快捷方法
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发视图刷新
   */
  private triggerSelectChange (triggerEvent: boolean = true, triggerDataChange: boolean = true) {
    if (triggerEvent) {
      this.emit('selected-change', this.getSelectedNode(), this.getSelectedKey())
    }

    if (triggerDataChange) {
      this.emit('render-data-change')
    }
  }

  /**
   * 设置未加载单选选中节点，不公开此 API
   */
  private setUnloadSelected (key: TreeNodeKeyType, value: boolean, triggerEvent: boolean = true, triggerDataChange: boolean = true, isMultiple: boolean = false): void {
    if (value) {
      // if (this.currentSelectedKeys) {
      //   this.setSelected(this.currentSelectedKey, false, false, false)
      // }
      if (isMultiple) {
        this.unloadSelectedKeys?.push(key);
      } else {
        this.unloadSelectedKeys = [key];
      }
      
    } else {
      if (this.unloadSelectedKeys?.includes(key)) {
        this.unloadSelectedKeys = this.unloadSelectedKeys.filter(itemKey => itemKey !== key);
      }
    }

    if (triggerEvent) {
      this.emit('selected-change', this.getSelectedNode(), this.getSelectedKey())
    }

    if (triggerDataChange) {
      this.emit('render-data-change')
    }
  }

  /**
   * 清除当前单选选中
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发视图刷新
   */
  clearSelected (triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    // const currentCheckedNodes = this.getCheckedNodes()
    // currentCheckedNodes.forEach((checkedNode) => {
    //   this.setChecked(checkedNode[this.options.keyField], false, false, false)
    // })
    // // 清空未加载多选选中节点
    // this.unloadCheckedKeys = []

    // this.triggerCheckedChange(triggerEvent, triggerDataChange)
    
    if (this.currentSelectedKeys) {
      this.currentSelectedKeys.forEach(itemKey => {
        if (this.mapData[itemKey]) {
          this.setSelected(itemKey, false, triggerEvent, triggerDataChange)
        }
      })
    } else if (this.unloadSelectedKeys !== null) {
      // Todo
      this.unloadSelectedKeys = null

      if (triggerEvent) {
        this.emit('selected-change', this.getSelectedNode(), this.getSelectedKey())
      }

      if (triggerDataChange) {
        this.emit('render-data-change')
      }
    }
  }

  /**
   * 设置节点展开
   * @param key 节点 key
   * @param value 是否展开
   * @param expandParent 展开节点时是否同时展开父节点
   * @param triggerEvent 是否触发事件
   * @param triggerDataChange 是否触发 `data-change` 事件以通知外部刷新视图
   */
  setExpand (key: TreeNodeKeyType, value: boolean, expandParent: boolean = false, triggerEvent: boolean = true, triggerDataChange: boolean = true): void {
    const node = this.mapData[key]
    if (!node || (!expandParent && node.isLeaf)) return

    if (node.expand === value) return // 当前节点已经是将要设置的状态，直接返回

    if (!node.isLeaf) {
      if (typeof this.options.load === 'function') {
        // 如果节点未加载过且将要设置为加载，则调用 load 方法
        if (!node._loaded && !node._loading && value) {
          node._loading = true
          if (triggerDataChange) {
            this.emit('visible-data-change')
          }
          new Promise((resolve, reject) => {
            const load = (this.options.load as Function)
            load(node, resolve, reject)
          }).then((children) => {
            if (Array.isArray(children)) {
              const parentIndex: number = this.findIndex(node)
              if (parentIndex === -1) return
              node._loaded = true
              node.expand = value
              node.setChildren(children)
              // 如果单选选中的值为空，则允许后续数据覆盖单选 value
              const currentCheckedKeys = this.getCheckedKeys()
              const flattenChildren = this.flattenData(node.children)
              this.insertIntoFlatData(parentIndex + 1, flattenChildren)
              // 如果有未加载的选中节点，判断其是否已加载
              this.setUnloadCheckedKeys(currentCheckedKeys)
              if (this.unloadSelectedKeys !== null) {
                this.setUnloadSelectedKeys(this.unloadSelectedKeys)
              }
              this.emit('set-data')
            }
          }).catch((e: Error | string) => {
            let err = e
            if (!(e instanceof Error)) {
              err = new Error(e)
            }
            // tslint:disable-next-line: no-console
            console.error(err)
          }).then(() => {
            node._loading = false

            if (triggerEvent) {
              this.emit('expand', node)
            }

            if (triggerDataChange) {
              this.emit('visible-data-change')
            }
          })
          return
        } else if (node._loading) return // 正在加载的节点，直接返回
      }

      node.expand = value
      // Set children visibility
      let queue = node.children.concat()
      while (queue.length) {
        const nodeFromQueue = queue.pop()
        if (!nodeFromQueue) continue
        if (nodeFromQueue.expand && nodeFromQueue.children.length) {
          queue = nodeFromQueue.children.concat(queue)
        }
        if (nodeFromQueue._filterVisible === false) {
          nodeFromQueue.visible = false
        } else {
          nodeFromQueue.visible =
            nodeFromQueue._parent === null ||
            (nodeFromQueue._parent.expand && nodeFromQueue._parent.visible)
        }
      }

      if (triggerEvent) {
        this.emit('expand', node)
      }

      if (triggerDataChange) {
        this.emit('visible-data-change')
      }
    }

    if (expandParent && node._parent && value) {
      this.setExpand(node._parent[this.options.keyField], value, expandParent, false, triggerDataChange)
    }
  }

  /**
   * 批量设置节点展开/折叠
   * @param keys 展开的节点 key 数组
   * @param value 是否展开
   */
  setExpandKeys (keys: TreeNodeKeyType[], value: boolean, triggerDataChange: boolean = true): void {
    keys.forEach((key) => {
      this.setExpand(key, value, false, false, false)
    })

    if (triggerDataChange) {
      this.emit('visible-data-change')
    }
  }

  setExpandAll (value: boolean, triggerDataChange: boolean = true): void {
    this.flatData.forEach((node) => {
      if (!this.options.load || node._loaded) {
        this.setExpand(node[this.options.keyField], value, false, false, false)
      }
    })

    if (triggerDataChange) {
      this.emit('visible-data-change')
    }
  }

  // 更新节点
  updateNode(key: TreeNodeKeyType, newNode: ITreeNodeOptions, triggerDataChange = true) {
    const targetNode = this.mapData[key];
    if (!targetNode) return;
    // 不允许设置的属性
    const notAllowedFields = [
      this.options.keyField,
      'indeterminate',
      'visible',
      'isLeaf',
    ];
    const node: ITreeNodeOptions = {};
    Object.keys(newNode).forEach(field => {
      if (!notAllowedFields.includes(field) && !field.startsWith('_')) {
        node[field] = newNode[field];
      }
    });

    if (('children' in node) && targetNode.children.length && node.children?.length) {
      // 删除原来的children
      this.removeChildren(key, false, false);

      if (Array.isArray(node.children)) {
        this.loadChildren(targetNode, node.children, node.expand)
      }

      delete node.children
    }

    Object.keys(node).forEach((field) => {
      this.mapData[key][field] = node[field]
    })

    if (triggerDataChange) {
      this.emit('visible-data-change')
    }
  }

  // 更新多个节点
  updateNodes(nodes: ITreeNodeOptions[]) {
    const needUpdateNodes = nodes.filter(item => item[this.options.keyField]);
    if (!needUpdateNodes.length) return;
    const previousCheckedKeys = this.getCheckedKeys()
    const previousSelectedKey = this.getSelectedKey()
    needUpdateNodes.forEach(item => {
      const key = item[this.options.keyField];
      const node = this.mapData[key];
      if (node) {
        this.updateNode(key, item, false);
      }
    })
    const currentCheckedKeys = this.getCheckedKeys()
    const currentSelectedKey = this.getSelectedKey()

    if (JSON.stringify(currentCheckedKeys.sort()) !== JSON.stringify(previousCheckedKeys.sort())) {
      this.triggerCheckedChange(true, false)
    }

    if (JSON.stringify(currentSelectedKey?.sort() || []) !== JSON.stringify(previousSelectedKey?.sort() || [])) {
      this.triggerSelectChange(true, false)
    }
    this.emit('visible-data-change')
  }

  //#endregion Set api

  //#region Get api

  /**
   * 获取多选选中节点
   * @param ignoreMode 忽略模式，可选择忽略父节点或子节点，默认值是 CTree 的 ignoreMode Prop
   */
  getCheckedNodes (ignoreMode = this.options.ignoreMode): TreeNode[] {
    if (ignoreMode === ignoreEnum.children) {
      const result: TreeNode[] = []
      const traversal = (nodes: TreeNode[]) => {
        nodes.forEach((node) => {
          if (node._checked) {
            result.push(node)
          } else if (!node.isLeaf && node.indeterminate) {
            traversal(node.children)
          }
        })
      }
      traversal(this.data)
      return result
    } else {
      return this.flatData.filter((node) => {
        if (ignoreMode === ignoreEnum.parents) return node._checked && node.isLeaf
        return node._checked
      })
    }
  }

  /**
   * 获取多选选中的节点 key ，包括未加载的 key
   * @param ignoreMode 忽略模式，同 `getCheckedNodes`
   */
  getCheckedKeys (ignoreMode = this.options.ignoreMode): TreeNodeKeyType[] {
    return this.getCheckedNodes(ignoreMode).map((checkedNodes) => checkedNodes[this.options.keyField]).concat(this.unloadCheckedKeys)
  }

  /**
   * 获取多选半选状态节点
   */
  getIndeterminateNodes (): TreeNode[] {
    return this.flatData.filter((node) => node.indeterminate)
  }

  /**
   * 获取当前单选选中节点
   */
  getSelectedNode (): TreeNode[] | null {
    if (this.currentSelectedKeys === null) return null;
    const nodesList = this.currentSelectedKeys.map(itemKey => this.mapData[itemKey] || null);
    return nodesList || null
  }

  /**
   * 获取当前单选选中节点 key ，有可能是未加载的选中项 Todo
   */
  getSelectedKey (): TreeNodeKeyType[] | null  {
    return this.currentSelectedKeys || this.unloadSelectedKeys || null
  }

  /**
   * 获取未加载但多选选中的节点
   */
  getUnloadCheckedKeys (): TreeNodeKeyType[] {
    return this.unloadCheckedKeys
  }

  /**
   * 获取展开节点
   */
  getExpandNodes (): TreeNode[] {
    return this.flatData.filter((node) => !node.isLeaf && node.expand)
  }

  /**
   * 获取展开节点 keys
   */
  getExpandKeys (): TreeNodeKeyType[] {
    return this.getExpandNodes().map((node) => node[this.options.keyField])
  }

  /**
   * 根据节点 key  获取节点
   * @param key 节点 key
   */
  getNode (key: TreeNodeKeyType): TreeNode | null {
    return this.mapData[key] || null
  }

  //#endregion Get api

  //#region Node transfer api

  // 这边的 referenceKey 都是被执行的节点，比如 insertBefore ，在这里 referenceKey 就是指要插入到 referenceKey 节点前面

  insertBefore (insertedNode: TreeNodeKeyType | ITreeNodeOptions, referenceKey: TreeNodeKeyType): TreeNode | null {
    const node = this.getInsertedNode(insertedNode, referenceKey)
    if (!node) return null

    this.remove(node[this.options.keyField], false)

    const referenceNode = this.mapData[referenceKey]
    const parentNode = referenceNode._parent
    const childIndex = this.findIndex(referenceKey, parentNode && parentNode.children)
    const flatIndex = this.findIndex(referenceKey)

    const dataIndex = (parentNode && -1) || this.findIndex(referenceKey, this.data)

    this.insertIntoStore(node, parentNode, childIndex, flatIndex, dataIndex)
    this.emit('visible-data-change')
    return node
  }

  insertAfter (insertedNode: TreeNodeKeyType | ITreeNodeOptions, referenceKey: TreeNodeKeyType): TreeNode | null {
    const node = this.getInsertedNode(insertedNode, referenceKey)
    if (!node) return null

    this.remove(node[this.options.keyField], false)

    const referenceNode = this.mapData[referenceKey]
    const parentNode = referenceNode._parent
    const childIndex = this.findIndex(referenceKey, parentNode && parentNode.children) + 1

    const length = this.flatData.length
    const referenceIndex = this.findIndex(referenceKey)

    // 找到待插入节点应该插入 flatData 的索引
    let flatIndex = referenceIndex + 1
    for (let i = referenceIndex + 1; i <= length; i++) {
      if (i === length) {
        flatIndex = i
        break
      }
      if (this.flatData[i]._level <= referenceNode._level) {
        flatIndex = i
        break
      }
    }

    const dataIndex = (parentNode && -1) || (this.findIndex(referenceKey, this.data) + 1)

    this.insertIntoStore(node, parentNode, childIndex, flatIndex, dataIndex)
    this.emit('visible-data-change')
    return node
  }

  append (insertedNode: TreeNodeKeyType | ITreeNodeOptions, parentKey: TreeNodeKeyType): TreeNode | null {
    const parentNode = this.mapData[parentKey]
    if (!parentNode.isLeaf) {
      const childrenLength = parentNode.children.length
      return this.insertAfter(insertedNode, parentNode.children[childrenLength - 1][this.options.keyField])
    }

    const node = this.getInsertedNode(insertedNode, parentKey, true)
    if (!node) return null

    this.remove(node[this.options.keyField], false)

    const flatIndex = this.findIndex(parentKey) + 1

    this.insertIntoStore(node, parentNode, 0, flatIndex)
    this.emit('visible-data-change')
    return node
  }

  prepend (insertedNode: TreeNodeKeyType | ITreeNodeOptions, parentKey: TreeNodeKeyType): TreeNode | null {
    const parentNode = this.mapData[parentKey]
    if (!parentNode.isLeaf) {
      return this.insertBefore(insertedNode, parentNode.children[0][this.options.keyField])
    }

    const node = this.getInsertedNode(insertedNode, parentKey, true)
    if (!node) return null

    this.remove(node[this.options.keyField], false)

    const flatIndex = this.findIndex(parentKey) + 1

    this.insertIntoStore(node, parentNode, 0, flatIndex)
    this.emit('visible-data-change')
    return node
  }

  /**
   * 删除节点
   * @param removedKey 要删除的节点 key
   */
  remove (removedKey: TreeNodeKeyType, triggerDataChange: boolean = true): TreeNode | null {
    const node = this.mapData[removedKey]
    if (!node) return null

    // 从 flatData 中移除
    const index = this.findIndex(node)
    if (index === -1) return null
    let deleteCount = 1
    const length = this.flatData.length
    for (let i = index + 1; i < length; i++) {
      if (this.flatData[i]._level > node._level) {
        deleteCount++
      } else break
    }
    this.flatData.splice(index, deleteCount)

    // 从 mapData 中移除
    const deleteInMap = (key: TreeNodeKeyType): void => {
      const node = this.mapData[key]
      delete this.mapData[key]
      node.children.forEach((child) => deleteInMap(child[this.options.keyField]))
    }
    deleteInMap(removedKey)

    // 从 data 中移除
    if (!node._parent) {
      const index = this.findIndex(node, this.data)
      if (index > -1) {
        this.data.splice(index, 1)
      }
    }

    // 从父节点 children 中移除
    if (node._parent) {
      const childIndex = this.findIndex(node, node._parent.children)
      if (childIndex !== -1) {
        node._parent.children.splice(childIndex, 1)
      }
      // 处理父节点 isLeaf
      node._parent.isLeaf = !node._parent.children.length
      // 处理父节点 expand
      if (node._parent.isLeaf) {
        node._parent.expand = false
        node._parent.indeterminate = false
      }
      // 更新被移除处父节点状态
      this.updateMovingNodeStatus(node)
    }

    if (triggerDataChange) {
      this.emit('visible-data-change')
    }

    return node
  }

  private removeChildren(
    parentKey: TreeNodeKeyType,
    triggerEvent: boolean = true,
    triggerDataChange: boolean = true,
  ) {
    const node = this.mapData[parentKey]
    if (!node || !node.children.length) return null

    const firstChild = node.children[0]
    let movingNode = firstChild

    // 从 flatData 中移除
    const index = this.findIndex(node)
    if (index === -1) return null
    let deleteCount = 0
    const length = this.flatData.length
    for (let i = index + 1; i < length; i++) {
      if (this.flatData[i]._level > node._level) {
        // 从 mapData 中移除
        delete this.mapData[this.flatData[i][this.options.keyField]]
        deleteCount++

        // 如果是 Selected 的节点，则记录
        if (this.flatData[i].selected) {
          movingNode = this.flatData[i]
        }
      } else break
    }
    this.flatData.splice(index + 1, deleteCount)

    // 从父节点 children 中移除
    node.children.splice(0, node.children.length)
    node.isLeaf = true
    node.indeterminate = false

    // 更新被移除处父节点状态
    this.updateMovingNodeStatus(movingNode, triggerEvent, triggerDataChange)

    if (triggerDataChange) {
      this.emit('visible-data-change')
    }

    return node
  }

  /**
   * 
   * @param node 加载的node节点
   * @param children 
   * @param expand 
   * @returns 
   */
  private loadChildren(node: TreeNode, children: any[], expand: boolean) {
    const parentIndex: number = this.findIndex(node)
    if (parentIndex === -1) return
    node._loaded = true
    node.expand = expand
    node.setChildren(children)
    node.isLeaf = !node.children.length
    // 如果单选选中的值为空，则允许后续数据覆盖单选 value
    const currentCheckedKeys = this.getCheckedKeys()
    const flattenChildren = this.flattenData(node.children)
    this.insertIntoFlatData(parentIndex + 1, flattenChildren)
    // 如果有未加载的选中节点，判断其是否已加载
    this.setUnloadCheckedKeys(currentCheckedKeys)
    if (this.unloadSelectedKeys !== null) {
      this.setUnloadSelectedKeys(this.unloadSelectedKeys)
    }

    this.checkNodeUpward(node, true)
  }

  private getInsertedNode (insertedNode: TreeNodeKeyType | ITreeNodeOptions, referenceKey: TreeNodeKeyType, isParent: boolean = false): TreeNode | null {
    const referenceNode = this.mapData[referenceKey]
    if (!referenceNode) return null
    const parentNode = isParent ? referenceNode : referenceNode._parent
    if (insertedNode instanceof TreeNode) {
      // 与参照节点是同一个节点
      if (insertedNode[this.options.keyField] === referenceKey) return null
      return insertedNode
    } else if (typeof insertedNode === 'object') {
      if (insertedNode[this.options.keyField] === referenceKey) return null
      const mapNode = this.mapData[insertedNode[this.options.keyField]]
      if (mapNode) return mapNode
      return new TreeNode(insertedNode, parentNode, this.options.keyField, !!this.options.load)
    } else {
      if (!this.mapData[insertedNode] || insertedNode === referenceKey) return null
      return this.mapData[insertedNode]
    }
  }

  /**
   * 将一个节点插入 store 记录中
   * @param node 要插入的节点
   * @param parentNode 要插入节点的父节点
   * @param childIndex 如果有父节点，则需提供要插入的节点在同级节点中的顺序
   * @param flatIndex 在 flatData 中的索引
   * @param dataIndex 如果没有父节点，需要提供节点在 data 中的索引
   */
  private insertIntoStore (node: TreeNode, parentNode: TreeNode | null, childIndex: number, flatIndex: number, dataIndex?: number, triggerEvent = true, triggerDataChange = true): void {
    if (flatIndex === -1) return

    // 插入父节点 children 中
    if (childIndex !== -1 && parentNode) {
      parentNode.children.splice(childIndex, 0, node)
    }

    // 更新 _parent
    node._parent = parentNode

    // 更新父节点 isLeaf, expand
    if (parentNode) {
      parentNode.isLeaf = false
      this.setExpand(parentNode[this.options.keyField], true, false, false, false)
    } else if (typeof dataIndex === 'number' && dataIndex > -1) {
      // 没有父节点，则需要插入到 this.data 中以保证数据正确
      this.data.splice(dataIndex, 0, node)
    }

    // 插入 flatData 与 mapData
    const nodes: TreeNode[] = this.flattenData([node])
    // 处理自身及子节点 _level
    node._level = parentNode ? parentNode._level + 1 : 0
    nodes.forEach((childNode) => childNode._level = childNode._parent ? childNode._parent._level + 1 : 0)
    this.insertIntoFlatData(flatIndex, nodes)

    // 更新被移除处父节点状态
    this.updateMovingNodeStatus(node, triggerEvent, triggerDataChange)
  }

  private updateMovingNodeStatus (movingNode: TreeNode, triggerEvent = true, triggerDataChange = true): void {
    // 处理多选
    this.checkNodeUpward(movingNode)
    this.triggerCheckedChange(triggerEvent, triggerDataChange)
    // 处理单选
    if (movingNode._selected) {
      this.setSelected(movingNode[this.options.keyField], true, triggerEvent, triggerDataChange)
    }
  }

  //#endregion Node transfer api

  /**
   * 过滤本地节点数据
   * @param keyword 过滤关键词
   * @param filterMethod 过滤方法
   */
  filter (keyword: string, filterMethod: FilterFunctionType): void {
    // 使用树形结构数据进行遍历
    const filterVisibleNodes: TreeNode[] = []
    this.flatData.forEach((node) => {
      node._filterVisible = node._parent && node._parent._filterVisible || filterMethod(keyword, node)
      node.visible = node._filterVisible

      if (node._filterVisible) {
        filterVisibleNodes.push(node)
      }
    })
    // 对于临时列表中的节点，都是可见的，因此将它们的父节点都设为可见并展开
    filterVisibleNodes.forEach((node) => {
      const stack = []
      let parent = node._parent
      while (parent) {
        stack.unshift(parent)
        parent = parent._parent
      }
      stack.forEach((parent) => {
        parent._filterVisible = true
        // parent.visible = parent._filterVisible
        // _filterVisible 且 无父级或者父级展开且可见，则设为可见
        parent.visible = (parent._parent === null || (parent._parent.expand && parent._parent.visible)) && parent._filterVisible
        this.options.expandOnFilter && this.setExpand(parent[this.options.keyField], true, false, false, false)
      })
      node.visible = node._parent === null || (node._parent.expand && node._parent.visible)
    })

    this.emit('visible-data-change')
  }

  /**
   * 过滤未加载多选节点，对比最终勾选节点是否有变化并触发 checked-change 事件
   * @param keys 全量选中节点 key 数组，包括加载与未加载选中节点
   */
  private setUnloadCheckedKeys (keys: TreeNodeKeyType[]): void {
    this.unloadCheckedKeys = keys
    const checkedKeysCache = keys.concat()
    const length = this.unloadCheckedKeys.length
    for (let i = length - 1; i >= 0; i--) {
      const key = this.unloadCheckedKeys[i]
      if (this.mapData[key]) {
        this.setChecked(key, true, false, false)
        this.unloadCheckedKeys.splice(i, 1)
      }
    }

    const newCheckedKeys = this.getCheckedKeys()
    if (newCheckedKeys.length === checkedKeysCache.length && newCheckedKeys.every((val) => (checkedKeysCache as TreeNodeKeyType[]).some((cache) => cache === val))) return
    // 因为多选模式下，value 传过来的数据跟数据上标识 checked: true 的结果可能不一致，因此需要触发一个事件告诉外部最终勾选了哪些节点
    this.emit('checked-change', this.getCheckedNodes(), newCheckedKeys)
  }

  /**
   * 过滤未加载单选选中节点，对比是否有变化并触发 selected-change 事件
   * @param key 节点 key
   */
  private setUnloadSelectedKeys (keys: TreeNodeKeyType[]): void {
    this.unloadSelectedKeys = keys;
    const selectedKeysCache = keys.concat();
    const length = this.unloadSelectedKeys.length;

    for (let i = length - 1; i >= 0; i--) {
      const key = this.unloadSelectedKeys[i]
      if (this.mapData[key]) {
        this.setSelected(key, true, false, false)
        this.unloadSelectedKeys.splice(i, 1)
      }
    }

    const newSelectedKey = this.getSelectedKey();
    if (newSelectedKey === selectedKeysCache) return
    this.emit('selected-change', this.getSelectedNode(), newSelectedKey)
  }

  /**
   * 保存扁平化的节点数据 `flatData` 与节点数据 Map `mapData`
   * @param nodes 树状节点数据
   * @param overrideSelected 是否根据数据设置 `selected`
   */
  private flattenData (nodes: TreeNode[], result: TreeNode[] = []): TreeNode[] {
    const length = nodes.length
    for (let i = 0; i < length; i++) {
      const node = nodes[i]
      const key: TreeNodeKeyType = node[this.options.keyField]
      result.push(node)
      if (this.mapData[key]) {
        throw new Error('[CTree] Duplicate tree node key.')
      }
      this.mapData[key] = node

      // // 如果数据上就是选中的，则更新节点状态   ----去除节点中的select选项
      // if (node.checked && this.options.cascade) {
      //   // 向下勾选，包括自身
      //   this.checkNodeDownward(node, true)
      //   // 向上勾选父节点直到根节点
      //   this.checkNodeUpward(node)
      // }

      // if (node.selected && overrideSelected) {
      //   // this.clearSelected(false, false)
      //   this.currentSelectedKeys?.push(node[this.options.keyField])
      //   // todo
      //   // this.emit('selected-change', node, this.currentSelectedKey)
      // }

      if ((this.options.defaultExpandAll || node.expand) && !this.options.load && !node.isLeaf) {
        node.expand = false
        this.setExpand(node[this.options.keyField], true, false, false, false)
      }

      if (node.children.length) {
        this.flattenData(node.children, result)
      }
    }
    return result
  }

  //#region Check nodes

  /**
   * 向下勾选/取消勾选节点，包括自身
   * @param node 需要向下勾选的节点
   * @param value 勾选或取消勾选
   * @param filtering 是否正在过滤，如果是，则考虑 `filteredNodeCheckable` Prop
   */
  private checkNodeDownward (node: TreeNode, value: boolean, filtering: boolean = false): void {
    node.children.forEach((child) => {
      this.checkNodeDownward(child, value, filtering)
    })
    if (node.isLeaf || (this.options.load && !node.children.length)) {
      if (!node.disabled) {
        // 正在过滤，若被过滤节点不可勾选，且节点过滤后不可见，则直接返回
        if (filtering && !this.options.filteredNodeCheckable && !node._filterVisible) return
        node._checked = value
        node.indeterminate = false
      }
    } else {
      this.checkParentNode(node)
    }
  }

  /**
   * 向上勾选/取消勾选父节点，不包括自身
   * @param node 需要勾选的节点
   * @param fromCurrentNode 是否从当前节点开始处理
   */
  private checkNodeUpward (node: TreeNode, fromCurrentNode = false) {
    let parent = fromCurrentNode ? node : node._parent
    while (parent) {
      this.checkParentNode(parent)
      parent = parent._parent
    }
  }

  /**
   * 根据子节点的勾选状态更新当前父节点的勾选状态
   * @param node 需要勾选的节点
   */
  private checkParentNode (node: TreeNode): void {
    const length = node.children.length
    if (!length) return
    let hasChecked = false
    let hasUnchecked = false
    let isInterrupted = false
    for (let i = 0; i < length; i++) {
      const child = node.children[i]
      if (child._checked) {
        hasChecked = true
      } else {
        hasUnchecked = true
      }
      if ((hasChecked && hasUnchecked) || child.indeterminate) {
        isInterrupted = true
        node._checked = false
        node.indeterminate = true
        break
      }
    }
    if (!isInterrupted) {
      node._checked = hasChecked
      node.indeterminate = false
    }
  }

  //#endregion Check nodes

  //#region Utils

  /**
   * 搜索节点在指定数组中的位置
   */
  private findIndex (keyOrNode: TreeNode | TreeNodeKeyType, searchList: TreeNode[] | TreeNodeKeyType[] | null = this.flatData): number {
    if (searchList !== null) {
      let key: TreeNodeKeyType = keyOrNode instanceof TreeNode ? keyOrNode[this.options.keyField] : keyOrNode
      const length = searchList.length
      for (let i = 0; i < length; i++) {
        if (searchList[0] instanceof TreeNode) {
          if (key === (searchList as TreeNode[])[i][this.options.keyField]) {
            return i
          }
        } else {
          if (key === searchList[i]) {
            return i
          }
        }
      }
    }
    return -1
  }

  //#endregion Utils

  //#region Mini EventTarget
  on<T extends keyof IEventNames> (eventName: T, listener: ListenerType<T> | Array<ListenerType<T>>): void {
    if (!this.listenersMap[eventName]) {
      this.listenersMap[eventName] = []
    }
    let listeners: Array<ListenerType<T>> = []
    if (!Array.isArray(listener)) {
      listeners = [listener]
    } else {
      listeners = listener
    }
    listeners.forEach((listener) => {
      if (this.listenersMap[eventName].indexOf(listener) === -1) {
        this.listenersMap[eventName].push(listener)
      }
    })
  }

  off<T extends keyof IEventNames> (eventName: T, listener?: ListenerType<T>): void {
    if (!this.listenersMap[eventName]) return
    if (!listener) {
      this.listenersMap[eventName] = []
    } else {
      const index = this.listenersMap[eventName].indexOf(listener)
      if (index > -1) {
        this.listenersMap[eventName].splice(index, 1)
      }
    }
  }

  emit<T extends keyof IEventNames> (eventName: T, ...args: Parameters<IEventNames[T]>): void {
    if (!this.listenersMap[eventName]) return
    const length: number = this.listenersMap[eventName].length
    for (let i: number = 0; i < length; i++) {
      this.listenersMap[eventName][i](...args)
    }
  }
  //#endregion Mini EventTarget
}
