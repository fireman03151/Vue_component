import { filterEmpty } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';

export default {
  name: 'AInputGroup',
  props: {
    prefixCls: {
      type: String,
    },
    size: {
      validator(value) {
        return ['small', 'large', 'default'].includes(value);
      },
    },
    compact: Boolean,
  },
  inject: {
    configProvider: { default: () => ({}) },
  },
  computed: {
    classes() {
      const { prefixCls: customizePrefixCls, size, compact = false } = this;
      const getPrefixCls = this.configProvider.getPrefixCls || ConfigConsumerProps.getPrefixCls;
      const prefixCls = getPrefixCls('input-group', customizePrefixCls);

      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-sm`]: size === 'small',
        [`${prefixCls}-compact`]: compact,
      };
    },
  },
  methods: {},
  render() {
    const { $listeners } = this;
    return (
      <span class={this.classes} {...{ on: $listeners }}>
        {filterEmpty(this.$slots.default)}
      </span>
    );
  },
};
