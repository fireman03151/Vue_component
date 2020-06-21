import { provide, inject } from 'vue';
import Button from '../button';
import buttonTypes from '../button/buttonTypes';
import { ButtonGroupProps } from '../button/button-group';
import Dropdown from './dropdown';
import PropTypes from '../_util/vue-types';
import { hasProp, getComponent, getSlot } from '../_util/props-util';
import getDropdownProps from './getDropdownProps';
import { ConfigConsumerProps } from '../config-provider';
import EllipsisOutlined from '@ant-design/icons-vue/EllipsisOutlined';

const ButtonTypesProps = buttonTypes();
const DropdownProps = getDropdownProps();
const ButtonGroup = Button.Group;
const DropdownButtonProps = {
  ...ButtonGroupProps,
  ...DropdownProps,
  type: PropTypes.oneOf(['primary', 'ghost', 'dashed', 'danger', 'default']).def('default'),
  size: PropTypes.oneOf(['small', 'large', 'default']).def('default'),
  htmlType: ButtonTypesProps.htmlType,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  prefixCls: PropTypes.string,
  placement: DropdownProps.placement.def('bottomRight'),
  icon: PropTypes.any,
  title: PropTypes.string,
};
export { DropdownButtonProps };
export default {
  name: 'ADropdownButton',
  props: DropdownButtonProps,
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  created() {
    provide('savePopupRef', this.savePopupRef);
  },
  methods: {
    savePopupRef(ref) {
      this.popupRef = ref;
    },
    onClick(e) {
      this.$emit('click', e);
    },
    onVisibleChange(val) {
      this.$emit('update:visible', val);
      this.$emit('visibleChange', val);
    },
  },
  render() {
    const {
      type,
      disabled,
      htmlType,
      prefixCls: customizePrefixCls,
      trigger,
      align,
      visible,
      placement,
      getPopupContainer,
      href,
      title,
      ...restProps
    } = this.$props;
    const icon = getComponent(this, 'icon') || <EllipsisOutlined />;
    const { getPopupContainer: getContextPopupContainer } = this.configProvider;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('dropdown-button', customizePrefixCls);
    const dropdownProps = {
      align,
      disabled,
      trigger: disabled ? [] : trigger,
      placement,
      getPopupContainer: getPopupContainer || getContextPopupContainer,
      onVisibleChange: this.onVisibleChange,
    };
    if (hasProp(this, 'visible')) {
      dropdownProps.visible = visible;
    }

    const buttonGroupProps = {
      ...restProps,
      class: prefixCls,
    };

    return (
      <ButtonGroup {...buttonGroupProps}>
        <Button
          type={type}
          disabled={disabled}
          onClick={this.onClick}
          htmlType={htmlType}
          href={href}
          title={title}
        >
          {getSlot(this)}
        </Button>
        <Dropdown {...dropdownProps} overlay={getComponent(this, 'overlay')}>
          <Button type={type}>{icon}</Button>
        </Dropdown>
      </ButtonGroup>
    );
  },
};
