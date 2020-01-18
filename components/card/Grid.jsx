import PropTypes from '../_util/vue-types';
import { ConfigConsumerProps } from '../config-provider';
import { getListeners } from '../_util/props-util';

export default {
  name: 'ACardGrid',
  __ANT_CARD_GRID: true,
  props: {
    prefixCls: PropTypes.string,
  },
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  render() {
    const { prefixCls: customizePrefixCls } = this.$props;

    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('card', customizePrefixCls);

    const classString = {
      [`${prefixCls}-grid`]: true,
    };
    return (
      <div {...{ on: getListeners(this) }} class={classString}>
        {this.$slots.default}
      </div>
    );
  },
};
