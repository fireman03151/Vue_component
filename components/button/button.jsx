import Wave from '../_util/wave';
import LoadingOutlined from '@ant-design/icons-vue/LoadingOutlined';
import buttonTypes from './buttonTypes';
import { filterEmpty, getListeners } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';
// eslint-disable-next-line no-console
const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
const props = buttonTypes();
export default {
  name: 'AButton',
  inheritAttrs: false,
  __ANT_BUTTON: true,
  props,
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  data() {
    return {
      sizeMap: {
        large: 'lg',
        small: 'sm',
      },
      sLoading: !!this.loading,
      hasTwoCNChar: false,
    };
  },
  watch: {
    loading(val, preVal) {
      if (preVal && typeof preVal !== 'boolean') {
        clearTimeout(this.delayTimeout);
      }
      if (val && typeof val !== 'boolean' && val.delay) {
        this.delayTimeout = setTimeout(() => {
          this.sLoading = !!val;
        }, val.delay);
      } else {
        this.sLoading = !!val;
      }
    },
  },
  mounted() {
    this.fixTwoCNChar();
  },
  updated() {
    this.fixTwoCNChar();
  },
  beforeDestroy() {
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  },
  methods: {
    getClasses() {
      const {
        prefixCls: customizePrefixCls,
        type,
        shape,
        size,
        hasTwoCNChar,
        sLoading,
        ghost,
        block,
        icon,
        $slots,
      } = this;
      const getPrefixCls = this.configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('btn', customizePrefixCls);
      const autoInsertSpace = this.configProvider.autoInsertSpaceInButton !== false;

      // large => lg
      // small => sm
      let sizeCls = '';
      switch (size) {
        case 'large':
          sizeCls = 'lg';
          break;
        case 'small':
          sizeCls = 'sm';
          break;
        default:
          break;
      }
      const iconType = sLoading ? 'loading' : icon;
      const children = filterEmpty($slots.default);
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-${type}`]: type,
        [`${prefixCls}-${shape}`]: shape,
        [`${prefixCls}-${sizeCls}`]: sizeCls,
        [`${prefixCls}-icon-only`]: children.length === 0 && iconType,
        [`${prefixCls}-loading`]: sLoading,
        [`${prefixCls}-background-ghost`]: ghost || type === 'ghost',
        [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace,
        [`${prefixCls}-block`]: block,
      };
    },
    fixTwoCNChar() {
      // Fix for HOC usage like <FormatMessage />
      const node = this.$refs.buttonNode;
      if (!node) {
        return;
      }
      const buttonText = node.textContent;
      if (this.isNeedInserted() && isTwoCNChar(buttonText)) {
        if (!this.hasTwoCNChar) {
          this.hasTwoCNChar = true;
        }
      } else if (this.hasTwoCNChar) {
        this.hasTwoCNChar = false;
      }
    },
    handleClick(event) {
      const { sLoading } = this.$data;
      if (sLoading) {
        return;
      }
      this.$emit('click', event);
    },
    insertSpace(child, needInserted) {
      const SPACE = needInserted ? ' ' : '';
      if (typeof child.text === 'string') {
        let text = child.text.trim();
        if (isTwoCNChar(text)) {
          text = text.split('').join(SPACE);
        }
        return <span>{text}</span>;
      }
      return child;
    },
    isNeedInserted() {
      const { icon, $slots, type } = this;
      return $slots.default && $slots.default.length === 1 && !icon && type !== 'link';
    },
  },
  render() {
    this.icon = this.$scopedSlots.icon && this.$scopedSlots.icon();
    const classes = this.getClasses();
    const { type, htmlType, icon, disabled, handleClick, sLoading, $slots, $attrs } = this;
    const buttonProps = {
      attrs: {
        ...$attrs,
        disabled,
      },
      class: classes,
      on: {
        ...getListeners(this),
        click: handleClick,
      },
    };
    const iconNode = sLoading ? <LoadingOutlined /> : icon || null;
    const children = filterEmpty($slots.default);
    const autoInsertSpace = this.configProvider.autoInsertSpaceInButton !== false;
    const kids = children.map(child =>
      this.insertSpace(child, this.isNeedInserted() && autoInsertSpace),
    );

    if ($attrs.href !== undefined) {
      return (
        <a {...buttonProps} ref="buttonNode">
          {iconNode}
          {kids}
        </a>
      );
    }

    const buttonNode = (
      <button {...buttonProps} ref="buttonNode" type={htmlType || 'button'}>
        {iconNode}
        {kids}
      </button>
    );

    if (type === 'link') {
      return buttonNode;
    }

    return <Wave>{buttonNode}</Wave>;
  },
};
