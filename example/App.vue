<template>
  <div class="app">
    <Performance></Performance>
  </div>
</template>

<script>
// import Feature from './Feature.vue'
import Performance from './Performance.vue';
// import Loading from './Loading.vue'
// import Search from './Search.vue'
// // import SearchRemote from './SearchRemote'
// // import SearchRootRemote from './SearchRootRemote'
// import Drop from './Drop.vue'
// // import DropRemote from './DropRemote'
// import Drag from './Drag.vue'
// // import DropDataChange from './DropDataChange'
// import InsertRenderTree from './InsertRenderTree.vue'

// const components = {
//   Feature,
//   Performance,
//   Loading,
//   Search,
//   // SearchRemote,
//   // SearchRootRemote,
//   Drop,
//   // DropRemote,
//   Drag,
//   // DropDataChange,
//   InsertRenderTree,
// }
import comp from './comp';
export default {
  name: 'App',
  components: { comp, Performance },
  // data () {
  //   const tabList = Object.keys(components)
  //   return {
  //     currentTab: tabList[0],
  //     tabList,
  //   }
  // },
};
</script>

<style lang="less" scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .tab {
    height: 90px;
    padding: 10px 50px;
    border-bottom: 1px solid lightgray;
    button {
      cursor: pointer;
      width: 100px;
      height: 38px;
      margin-right: 30px;
      margin-bottom: 10px;
      border-radius: 5px;
      background: lightcyan;

      &:focus {
        outline: none;
      }
    }
    .active {
      background: lightblue;
    }
  }
  .tab-panel {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
