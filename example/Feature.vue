<template>
  <div class="container">
    <!-- 基本用法 -->
    <div class="panel">
      <div class="header">基本用法</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              ref="fTree"
              :data="basicUsage"
              multiple
              selectable
              :nodeClassName="(node) => `generated-class-${node.id}`"
              animation
            />
          </div>
        </div>
        <div class="desc">
          <button @click="handleClick">updateNode</button>
        </div>
      </div>
    </div>
    <!-- CTree Search -->
    <div class="panel">
      <div class="header">CTreeDrop基本用法</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTreeDrop
              :data="basicUsage"
              multiple
              selectable
              :nodeClassName="(node) => `generated-class-${node.id}`"
              animation
            />
          </div>
        </div>
        <div class="desc">
          纯展示
        </div>
      </div>
    </div>
    <!-- CTree Search -->
    <div class="panel">
      <div class="header">CtreeDrop基本用法</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTreeSearch
              :data="basicUsage"
              multiple
              selectable
              :nodeClassName="(node) => `generated-class-${node.id}`"
              animation
            />
          </div>
        </div>
        <div class="desc">
          纯展示
        </div>
      </div>
    </div>

    <!-- 数据正确性验证 -->
    <div class="panel">
      <div class="header">数据正确性验证</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              :data="orderData"
              default-expand-all
            ></CTree>
          </div>
        </div>
        <div class="desc">
          数据正确性
        </div>
      </div>
    </div>

    <!-- 单选 -->
    <div class="panel">
      <div class="header">单选</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              :selected-keys.sync="selectedKeys"
              :data="selectable"
              multiple
              selectable
            ></CTree>
          </div>
        </div>
        <div class="desc">
          单选模式。设置 selectedKeys 即可<br/>
          v-model: <br/>
          {{ selectedKeys }}
        </div>
      </div>
    </div>

    <!-- 多选 -->
    <div class="panel">
      <div class="header">多选</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              v-if="showCheckable"
              v-model="checkableValue"
              :data="checkable"
              checkable
              :ignore-mode="checkableIgnoreMode"
              :cascade="checkableCascade"
            ></CTree>
          </div>
        </div>
        <div class="desc">
          <div class="desc-block">
            <p>多选模式。设置 checkable 即可</p>
            v-model: <br/>
            {{ checkableValue }}
          </div>
          <div class="desc-block">
            <p>设置 ignoreMode 可指定 v-model 与 getCheckedNodes 方法要忽略父节点或者子节点，该 prop 仅初始设置有效</p>
            <button
              v-for="mode in ['none', 'parents', 'children']"
              :key="mode"
              @click="checkableIgnoreMode = mode; showCheckable = false; $nextTick(() => { checkableValue = []; showCheckable = true })"
            >{{ mode }}</button>
            <p>当前 ignoreMode: {{ checkableIgnoreMode }}</p>
          </div>
          <div class="desc-block">
            <p>设置 cascade 可指定父子节点是否级联</p>
            <button
              v-for="(mode, index) in [true, false]"
              :key="index"
              @click="checkableCascade = mode; showCheckable = false; $nextTick(() => { checkableValue = []; showCheckable = true })"
            >{{ mode }}</button>
            <p>当前 cascade: {{ checkableCascade }}</p>
          </div>
          <div class="desc-block">
            <p>重置以上选项</p>
            <button
              @click="
              showCheckable = false;
              $nextTick(() => {
                checkableIgnoreMode = 'none';
                checkableCascade = true;
                checkableValue = [];
                showCheckable = true
              })"
            >Reset</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 单选与多选并存 -->
    <div class="panel">
      <div class="header">单选与多选并存</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              animation
              v-model="bothValue"
              :data="both"
              checkable
              selectable
            ></CTree>
          </div>
        </div>
        <div class="desc">
          当既可以单选又可以多选时， v-model 绑定的是多选的值<br/>
          v-model: <br/>
          {{ bothValue }}
        </div>
      </div>
    </div>

    <!-- 连接线 -->
    <div class="panel">
      <div class="header">连接线</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px">
            <CTree
              :data="showLineTreeData"
              :showLine="{ type: showLineType, polyline: showLinePolyline }"
              defaultExpandAll
              animation
            />
          </div>
        </div>
        <div class="desc">
          <div class="desc-block">
            传入 showLine 可展示连接线，type 可指定连接线类型
          </div>
          <div class="desc-block">
            showLine 传入对象可设置连接线的宽度，连线类型与颜色等<br/>
            showLine.type:

            <button
              v-for="showLineType in (['solid', 'dashed'])"
              :key="showLineType"
              @click="onShowLineTypeBtnClick(showLineType)"
            >
              {{ showLineType }}
            </button>
            <p>当前连接线类型：{{ showLineType }}</p>
          </div>
          <div class="desc-block">
            showLine.polyline:

            <button
              v-for="polyline in [true, false]"
              :key="polyline"
              @click="onShowLinePolylineBtnClick(polyline)"
            >
              {{ polyline }}
            </button>
            <p>是否启用折线：{{ showLinePolyline }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义节点 -->
    <div class="panel">
      <div class="header">自定义节点</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px">
            <CTree :data="basicUsage">
              <template v-slot:node="{ node }">
                <button>{{ node.title }}</button>
              </template>
            </CTree>
          </div>
        </div>
        <div class="desc">
          <div class="desc-block">
            除了 render，也可以传入 slot 自定义树节点
            <pre>
            {{ nodeSlotDescText }}
            </pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义节点图标 -->
    <div class="panel">
      <div class="header">自定义节点图标</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              animation
              :data="basicUsage"
              :nodeClassName="(node) => `generated-class-${node.id}`"
            >
              <template #switcherIcon="{ node }">
                <i
                  :class="[node.expand ? 'iconfont icon-shouhui' : 'iconfont icon-zhankai']"
                >
                  {{ node.expand ? 'P' : 'Q' }}
                </i>
              </template>
            </CTree>
          </div>
        </div>
        <div class="desc">
          <div class="desc-block">
            传入 slot 自定义节点图标，可通过node.expand来进行切换
            <pre>
            {{ nodeIconSlotDescText }}
            </pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 远程 -->
    <div class="panel">
      <div class="header">远程</div>
      <div class="body">
        <div class="interface">
          <div style="height: 300px;">
            <CTree
              v-if="remoteShow"
              :load="remoteLoad"
            ></CTree>
          </div>
        </div>
        <div class="desc">
          <div class="desc-block">
            设置 load 方法可以使用远程加载数据，如果有设置 data ，则 data 数据作为根数据；<br/>
            如果没有传 data ，则初始化时调用 load 方法载入根数据，其中节点参数为 null
          </div>
          <div class="desc-block">
            <button @click="remoteShow = false; $nextTick(() => { remoteShow = true })">加载树组件</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CTree from '@/components/Tree.vue';
import CTreeSearch from '@/components/TreeSearch.vue';
import CTreeDrop from '@/components/TreeDrop.vue';
import '@/styles/index.less';
import treeDataGenerator from '../tests/tree-data-generator'

const genData = (extra = {}) => {
  return treeDataGenerator(Object.assign({
    treeDepth: 3,
    nodesPerLevel: 5,
    sameIdTitle: true,
  }, extra))
}

const genChildrenData = (nodeCount = 2) => {
  return treeDataGenerator({
    treeDepth: 1,
    nodesPerLevel: nodeCount,
    inOrder: true,
  })
}

export default {
  name: 'Feature',
  components: {
    CTree,
    CTreeSearch,
    CTreeDrop
  },
  data () {
    const selectableData = genData().data
    selectableData[0].selected = true
    const checkableData = genData().data
    checkableData[0].expand = true
    checkableData[1].children[0].disabled = true
    // checkableData[1].children[0].children[0].checked = true

    return {
      // 基本用法
      basicUsage: genData().data,

      // 数据正确性
      orderData: genData({ inOrder: true }).data,

      // 单选
      selectable: selectableData,
      // selectableValue: selectableData[0].id,
      selectableValue: '',

      selectedKeys: [],

      // 多选
      showCheckable: true,
      checkable: checkableData,
      checkableValue: [checkableData[0].id],
      checkableIgnoreMode: 'none',
      checkableCascade: true,

      // 单选与多选并存
      both: genData().data,
      bothValue: [],

      // 连接线
      showLineTreeData: [
        {
          title: 'node-1',
          id: 'node-1',
          children: [
            {
              title: 'node-1-1',
              id: 'node-1-1',
              children: [
                {
                  title: 'node-1-1-1',
                  id: 'node-1-1-1',
                },
                {
                  title: 'node-1-1-2',
                  id: 'node-1-1-2',
                },
                {
                  title: 'node-1-1-3',
                  id: 'node-1-1-3',
                },
              ],
            },
            {
              title: 'node-1-2',
              id: 'node-1-2',
              children: [
                {
                  title: 'node-1-2-1',
                  id: 'node-1-2-1',
                },
                {
                  title: 'node-1-2-2',
                  id: 'node-1-2-2',
                },
              ],
            },
            {
              title: 'node-1-3',
              id: 'node-1-3',
              children: [
                {
                  title: 'node-1-3-1',
                  id: 'node-1-3-1',
                },
                {
                  title: 'node-1-3-2',
                  id: 'node-1-3-2',
                },
              ],
            },
          ],
        },
        {
          title: 'node-2',
          id: 'node-2',
          children: [
            {
              title: 'node-2-1',
              id: 'node-2-1',
              children: [
                {
                  title: 'node-2-1-1',
                  id: 'node-2-1-1',
                },
                {
                  title: 'node-2-1-2',
                  id: 'node-2-1-2',
                },
              ],
            },
          ],
        },
      ],
      showLineType: undefined,
      showLinePolyline: false,

      // 自定义节点
      nodeSlotDescText: `
<CTree :data="basicUsage">
  <template v-slot:node="{ node }">
    <button>{{ node.title }}</button>
  </template>
</CTree>
      `,
      // 自定义节点图标
      nodeIconSlotDescText: `
<CTree :data="basicUsage">
  <template v-slot:switcherIcon="{ node }">
    <i>{{ node.expand ? 'P' : 'Q' }} </i>
  </template>
</CTree>
      `,

      // 远程
      remoteShow: false,
      remoteLoad: (node, resolve, reject) => {
        setTimeout(() => {
          resolve(genChildrenData(node ? 2 : 5).data)
        }, 1000)
      }
    }
  },
  methods: {
    onShowLineTypeBtnClick (type) {
      this.showLineType = type
    },

    onShowLinePolylineBtnClick (polyline) {
      this.showLinePolyline = polyline
    },
    handleClick() {
      const target = this.$refs.fTree;
      const nodes = target.getTreeData()[0];
      target.updateNode(nodes.id, {...nodes, title: 999999 })
      // this.$refs.fTree.updateNode()
    }
  },
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;

  .panel {
    width: 100%;
    margin-bottom: 10px;
    border: 1px solid lightgray;
    border-radius: 5px;

    .header {
      height: 30px;
      border-bottom: 1px solid lightgray;
      padding: 10px 30px;
    }

    .body {
      display: flex;

      .interface {
        flex: 1;
        padding: 10px 30px;
        border-right: 1px solid lightgray;
      }

      .desc {
        flex: 1;
        padding: 10px 30px;

        .desc-block {
          padding: 5px 0;
          margin-bottom: 10px;
          border-bottom: 1px solid lightgray;

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }
  }
}
</style>
