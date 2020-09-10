import { inject } from 'vue';
import classNames from '../_util/classNames';
import Dialog from '../vc-dialog';
import PropTypes from '../_util/vue-types';
import addEventListener from '../vc-util/Dom/addEventListener';
import { getConfirmLocale } from './locale';
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined';
import Button from '../button';
import buttonTypes from '../button/buttonTypes';
const ButtonType = buttonTypes().type;
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { initDefaultProps, getComponent, getSlot } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';
import syncWatch from '../_util/syncWatch';

let mousePosition = null;
// ref: https://github.com/ant-design/ant-design/issues/15795
const getClickPosition = e => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY,
  };
  // 100ms 内发生过点击事件，则从点击位置动画展示
  // 否则直接 zoom 展示
  // 这样可以兼容非点击方式展开
  setTimeout(() => (mousePosition = null), 100);
};

// 只有点击事件支持从鼠标位置动画展开
if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
  addEventListener(document.documentElement, 'click', getClickPosition, true);
}

function noop() {}
const modalProps = (defaultProps = {}) => {
  const props = {
    prefixCls: PropTypes.string,
    /** 对话框是否可见*/
    visible: PropTypes.bool,
    /** 确定按钮 loading*/
    confirmLoading: PropTypes.bool,
    /** 标题*/
    title: PropTypes.any,
    /** 是否显示右上角的关闭按钮*/
    closable: PropTypes.bool,
    closeIcon: PropTypes.any,
    /** 点击确定回调*/
    // onOk: (e: React.MouseEvent<any>) => void,
    /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调*/
    // onCancel: (e: React.MouseEvent<any>) => void,
    afterClose: PropTypes.func.def(noop),
    /** 垂直居中 */
    centered: PropTypes.bool,
    /** 宽度*/
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** 底部内容*/
    footer: PropTypes.any,
    /** 确认按钮文字*/
    okText: PropTypes.any,
    /** 确认按钮类型*/
    okType: ButtonType,
    /** 取消按钮文字*/
    cancelText: PropTypes.any,
    icon: PropTypes.any,
    /** 点击蒙层是否允许关闭*/
    maskClosable: PropTypes.bool,
    /** 强制渲染 Modal*/
    forceRender: PropTypes.bool,
    okButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object,
    destroyOnClose: PropTypes.bool,
    wrapClassName: PropTypes.string,
    maskTransitionName: PropTypes.string,
    transitionName: PropTypes.string,
    getContainer: PropTypes.func,
    zIndex: PropTypes.number,
    bodyStyle: PropTypes.object,
    maskStyle: PropTypes.object,
    mask: PropTypes.bool,
    keyboard: PropTypes.bool,
    wrapProps: PropTypes.object,
    focusTriggerAfterClose: PropTypes.bool,
  };
  return initDefaultProps(props, defaultProps);
};

export const destroyFns = [];

export default {
  name: 'AModal',
  inheritAttrs: false,
  model: {
    prop: 'visible',
    event: 'change',
  },
  props: modalProps({
    width: 520,
    transitionName: 'zoom',
    maskTransitionName: 'fade',
    confirmLoading: false,
    visible: false,
    okType: 'primary',
  }),
  data() {
    return {
      sVisible: !!this.visible,
    };
  },
  watch: {
    visible: syncWatch(function(val) {
      this.sVisible = val;
    }),
  },
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  // static info: ModalFunc;
  // static success: ModalFunc;
  // static error: ModalFunc;
  // static warn: ModalFunc;
  // static warning: ModalFunc;
  // static confirm: ModalFunc;
  methods: {
    handleCancel(e) {
      this.$emit('update:visible', false);
      this.$emit('cancel', e);
      this.$emit('change', false);
    },

    handleOk(e) {
      this.$emit('ok', e);
    },
    renderFooter(locale) {
      const { okType, confirmLoading } = this;
      const cancelBtnProps = { onClick: this.handleCancel, ...(this.cancelButtonProps || {}) };
      const okBtnProps = {
        onClick: this.handleOk,
        type: okType,
        loading: confirmLoading,
        ...(this.okButtonProps || {}),
      };
      return (
        <div>
          <Button {...cancelBtnProps}>
            {getComponent(this, 'cancelText') || locale.cancelText}
          </Button>
          <Button {...okBtnProps}>{getComponent(this, 'okText') || locale.okText}</Button>
        </div>
      );
    },
  },

  render() {
    const {
      prefixCls: customizePrefixCls,
      sVisible: visible,
      wrapClassName,
      centered,
      getContainer,
      $attrs,
    } = this;
    const children = getSlot(this);
    const { getPrefixCls, getPopupContainer: getContextPopupContainer } = this.configProvider;
    const prefixCls = getPrefixCls('modal', customizePrefixCls);

    const defaultFooter = (
      <LocaleReceiver
        componentName="Modal"
        defaultLocale={getConfirmLocale()}
        children={this.renderFooter}
      />
    );
    const closeIcon = getComponent(this, 'closeIcon');
    const closeIconToRender = (
      <span class={`${prefixCls}-close-x`}>
        {closeIcon || <CloseOutlined class={`${prefixCls}-close-icon`} />}
      </span>
    );
    const footer = getComponent(this, 'footer');
    const title = getComponent(this, 'title');
    const dialogProps = {
      ...this.$props,
      ...$attrs,
      getContainer: getContainer === undefined ? getContextPopupContainer : getContainer,
      prefixCls,
      wrapClassName: classNames({ [`${prefixCls}-centered`]: !!centered }, wrapClassName),
      title,
      footer: footer === undefined ? defaultFooter : footer,
      visible,
      mousePosition,
      closeIcon: closeIconToRender,
      onClose: this.handleCancel,
    };
    return <Dialog {...dialogProps}>{children}</Dialog>;
  },
};
