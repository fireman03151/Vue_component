import Checkbox from '../checkbox';
import Radio from '../radio';
import { SelectionBoxProps } from './interface';
import BaseMixin from '../_util/BaseMixin';
import { getOptionProps, getListeners } from '../_util/props-util';

export default {
  name: 'SelectionBox',
  mixins: [BaseMixin],
  props: SelectionBoxProps,
  data() {
    return {
      checked: this.getCheckState(this.$props),
    };
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
    getCheckState(props) {
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
    const { type, rowIndex, ...rest } = getOptionProps(this);
    const { checked } = this;
    const checkboxProps = {
      props: {
        checked,
        ...rest,
      },
      on: getListeners(this),
    };
    if (type === 'radio') {
      checkboxProps.props.value = rowIndex;
      return <Radio {...checkboxProps} />;
    }
    return <Checkbox {...checkboxProps} />;
  },
};
