import { defineComponent } from 'vue';
import Checkbox from '../checkbox';
import Radio from '../radio';
import { SelectionBoxProps } from './interface';
import BaseMixin from '../_util/BaseMixin';
import { getOptionProps } from '../_util/props-util';

export default defineComponent({
  name: 'SelectionBox',
  mixins: [BaseMixin],
  inheritAttrs: false,
  props: SelectionBoxProps,
  data() {
    return {
      checked: false,
    };
  },

  setup() {
    return {
      unsubscribe: null,
    };
  },

  created() {
    this.checked = this.getCheckState(this.$props);
  },

  mounted() {
    this.subscribe();
  },

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    getCheckState(props): boolean {
      const { store, defaultSelection, rowIndex } = props;
      let checked = false;
      if (store.getState().selectionDirty) {
        checked = store.getState().selectedRowKeys.indexOf(rowIndex) >= 0;
      } else {
        checked =
          store.getState().selectedRowKeys.indexOf(rowIndex) >= 0 ||
          defaultSelection.indexOf(rowIndex) >= 0;
      }
      return checked;
    },
    subscribe() {
      const { store } = this;
      this.unsubscribe = store.subscribe(() => {
        const checked = this.getCheckState(this.$props);
        this.setState({ checked });
      });
    },
  },

  render() {
    const { type, rowIndex, ...rest } = { ...getOptionProps(this), ...this.$attrs } as any;
    const { checked } = this;
    const checkboxProps = {
      checked,
      ...rest,
    };
    if (type === 'radio') {
      checkboxProps.value = rowIndex;
      return <Radio {...checkboxProps} />;
    }
    return <Checkbox {...checkboxProps} />;
  },
});
