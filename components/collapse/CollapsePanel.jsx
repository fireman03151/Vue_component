import { getOptionProps, getComponentFromProp } from '../_util/props-util';
import VcCollapse, { panelProps } from '../vc-collapse';
import { ConfigConsumerProps } from '../config-provider';

export default {
  name: 'ACollapsePanel',
  props: {
    ...panelProps(),
  },
  inject: {
    configProvider: { default: () => ({}) },
  },
  render() {
    const { prefixCls: customizePrefixCls, showArrow = true, $listeners } = this;
    const getPrefixCls = this.configProvider.getPrefixCls || ConfigConsumerProps.getPrefixCls;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);

    const collapsePanelClassName = {
      [`${prefixCls}-no-arrow`]: !showArrow,
    };
    const rcCollapePanelProps = {
      props: {
        ...getOptionProps(this),
        prefixCls,
      },
      class: collapsePanelClassName,
      on: $listeners,
    };
    const header = getComponentFromProp(this, 'header');
    return (
      <VcCollapse.Panel {...rcCollapePanelProps}>
        {this.$slots.default}
        {header ? <template slot="header">{header}</template> : null}
      </VcCollapse.Panel>
    );
  },
};
