import { reactive } from 'vue';

export default {
  name: 'comp',
  setup() {
    const state = reactive({
      msg: 'ssssss',
    });
    const handleClick = () => {
      state.msg = '啊实打实多';
    };
    return {
      state,
      handleClick,
    };
  },
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>点击</button>
        {this.state.msg}
      </div>
    );
  },
};
