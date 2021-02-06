import { inject, cloneVNode, defineComponent, ref, ExtractPropTypes } from 'vue';
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons-vue/CheckCircleOutlined';
import ExclamationCircleOutlined from '@ant-design/icons-vue/ExclamationCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons-vue/InfoCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons-vue/CloseCircleOutlined';
import CheckCircleFilled from '@ant-design/icons-vue/CheckCircleFilled';
import ExclamationCircleFilled from '@ant-design/icons-vue/ExclamationCircleFilled';
import InfoCircleFilled from '@ant-design/icons-vue/InfoCircleFilled';
import CloseCircleFilled from '@ant-design/icons-vue/CloseCircleFilled';
import classNames from '../_util/classNames';
import PropTypes from '../_util/vue-types';
import { getTransitionProps, Transition } from '../_util/transition';
import { isValidElement } from '../_util/props-util';
import { defaultConfigProvider } from '../config-provider';
import { tuple, withInstall } from '../_util/type';

function noop() {}

function getDefaultSlot(slots: Record<string, any>, props: Record<string, any>, prop: string) {
  return slots[prop]?.() ?? props[prop];
}

const iconMapFilled = {
  success: CheckCircleFilled,
  info: InfoCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
};

const iconMapOutlined = {
  success: CheckCircleOutlined,
  info: InfoCircleOutlined,
  error: CloseCircleOutlined,
  warning: ExclamationCircleOutlined,
};

const AlertTypes = tuple('success', 'info', 'warning', 'error');

export type AlertType = typeof AlertTypes[number];

const alertProps = () => ({
  /**
   * Type of Alert styles, options: `success`, `info`, `warning`, `error`
   */
  type: PropTypes.oneOf(AlertTypes),
  /** Whether Alert can be closed */
  closable: PropTypes.looseBool,
  /** Close text to show */
  closeText: PropTypes.VNodeChild,
  /** Content of Alert */
  message: PropTypes.VNodeChild,
  /** Additional content of Alert */
  description: PropTypes.VNodeChild,
  /** Callback when close Alert */
  // onClose?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Trigger when animation ending of Alert */
  afterClose: PropTypes.func.def(noop),
  /** Whether to show icon */
  showIcon: PropTypes.looseBool,
  prefixCls: PropTypes.string,
  banner: PropTypes.looseBool,
  icon: PropTypes.VNodeChild,
  onClose: PropTypes.VNodeChild,
});

export type AlertProps = Partial<ExtractPropTypes<ReturnType<typeof alertProps>>>;

const Alert = defineComponent({
  name: 'AAlert',
  props: alertProps(),
  inheritAttrs: false,
  emits: ['close'],
  setup(props, { slots, emit, attrs }) {
    const configProvider = inject('configProvider', defaultConfigProvider);
    const closing = ref(false);
    const closed = ref(false);
    const alertNode = ref();

    const handleClose = (e: MouseEvent) => {
      e.preventDefault();

      const dom = alertNode.value;

      dom.style.height = `${dom.offsetHeight}px`;
      // Magic code
      // 重复一次后才能正确设置 height
      dom.style.height = `${dom.offsetHeight}px`;

      closing.value = true;
      emit('close', e);
    };

    const animationEnd = () => {
      closing.value = false;
      closed.value = true;
      props.afterClose?.();
    };

    return () => {
      const { prefixCls: customizePrefixCls, banner } = props;
      const { getPrefixCls } = configProvider;
      const prefixCls = getPrefixCls('alert', customizePrefixCls);

      let { closable, type, showIcon } = props;

      const closeText = getDefaultSlot(slots, props, 'closeText');
      const description = getDefaultSlot(slots, props, 'description');
      const message = getDefaultSlot(slots, props, 'message');
      const icon = getDefaultSlot(slots, props, 'icon');

      // banner模式默认有 Icon
      showIcon = banner && showIcon === undefined ? true : showIcon;
      // banner模式默认为警告
      type = banner && type === undefined ? 'warning' : type || 'info';

      const IconType = (description ? iconMapOutlined : iconMapFilled)[type] || null;

      // closeable when closeText is assigned
      if (closeText) {
        closable = true;
      }

      const alertCls = classNames(prefixCls, {
        [`${prefixCls}-${type}`]: true,
        [`${prefixCls}-closing`]: closing.value,
        [`${prefixCls}-with-description`]: !!description,
        [`${prefixCls}-no-icon`]: !showIcon,
        [`${prefixCls}-banner`]: !!banner,
        [`${prefixCls}-closable`]: closable,
      });

      const closeIcon = closable ? (
        <button type="button" onClick={handleClose} class={`${prefixCls}-close-icon`} tabindex={0}>
          {closeText ? (
            <span class={`${prefixCls}-close-text`}>{closeText}</span>
          ) : (
            <CloseOutlined />
          )}
        </button>
      ) : null;

      const iconNode = (icon &&
        (isValidElement(icon) ? (
          cloneVNode(icon, {
            class: `${prefixCls}-icon`,
          })
        ) : (
          <span class={`${prefixCls}-icon`}>{icon}</span>
        ))) || <IconType class={`${prefixCls}-icon`} />;

      const transitionProps = getTransitionProps(`${prefixCls}-slide-up`, {
        appear: false,
        onAfterLeave: animationEnd,
      });
      return closed.value ? null : (
        <Transition {...transitionProps}>
          <div
            {...attrs}
            v-show={!closing.value}
            class={[attrs.class, alertCls]}
            data-show={!closing.value}
            ref={alertNode}
          >
            {showIcon ? iconNode : null}
            <span class={`${prefixCls}-message`}>{message}</span>
            <span class={`${prefixCls}-description`}>{description}</span>
            {closeIcon}
          </div>
        </Transition>
      );
    };
  },
});

export default withInstall(Alert);
