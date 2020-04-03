import LoadingOutlined from '@ant-design/icons-vue/LoadingOutlined';
import PropTypes from '../_util/vue-types';
import hasProp, { getOptionProps, getComponentFromProp, getListeners } from '../_util/props-util';
import VcSwitch from '../vc-switch';
import Wave from '../_util/wave';
import { ConfigConsumerProps } from '../config-provider';
import Base from '../base';
import warning from '../_util/warning';

const Switch = {
  name: 'ASwitch',
  __ANT_SWITCH: true,
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    prefixCls: PropTypes.string,
    // size=default and size=large are the same
    size: PropTypes.oneOf(['small', 'default', 'large']),
    disabled: PropTypes.bool,
    checkedChildren: PropTypes.any,
    unCheckedChildren: PropTypes.any,
    tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    autoFocus: PropTypes.bool,
    loading: PropTypes.bool,
  },
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  methods: {
    focus() {
      this.$refs.refSwitchNode.focus();
    },
    blur() {
      this.$refs.refSwitchNode.blur();
    },
  },
  created() {
    warning(
      hasProp(this, 'checked') || !hasProp(this, 'value'),
      'Switch',
      '`value` is not validate prop, do you mean `checked`?',
    );
  },

  render() {
    const { prefixCls: customizePrefixCls, size, loading, disabled, ...restProps } = getOptionProps(
      this,
    );
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('switch', customizePrefixCls);

    const classes = {
      [`${prefixCls}-small`]: size === 'small',
      [`${prefixCls}-loading`]: loading,
    };
    const loadingIcon = loading ? (
      <LoadingOutlined class={`${prefixCls}-loading-icon`} />
    ) : null;
    const switchProps = {
      props: {
        ...restProps,
        prefixCls,
        loadingIcon,
        checkedChildren: getComponentFromProp(this, 'checkedChildren'),
        unCheckedChildren: getComponentFromProp(this, 'unCheckedChildren'),
        disabled: disabled || loading,
      },
      on: getListeners(this),
      class: classes,
      ref: 'refSwitchNode',
    };
    return (
      <Wave insertExtraNode>
        <VcSwitch {...switchProps} />
      </Wave>
    );
  },
};

/* istanbul ignore next */
Switch.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Switch.name, Switch);
};

export default Switch;
