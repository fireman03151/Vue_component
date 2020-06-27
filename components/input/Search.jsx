import { inject } from 'vue';
import classNames from 'classnames';
import { isMobile } from 'is-mobile';
import Input from './Input';
import LoadingOutlined from '@ant-design/icons-vue/LoadingOutlined';
import SearchOutlined from '@ant-design/icons-vue/SearchOutlined';
import inputProps from './inputProps';
import Button from '../button';
import { cloneElement } from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import { getOptionProps, getComponent } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';
import isPlainObject from 'lodash/isPlainObject';

export default {
  name: 'AInputSearch',
  inheritAttrs: false,
  props: {
    ...inputProps,
    // 不能设置默认值 https://github.com/vueComponent/ant-design-vue/issues/1916
    enterButton: PropTypes.any,
  },
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  methods: {
    saveInput(node) {
      this.input = node;
    },
    onChange(e) {
      if (e && e.target && e.type === 'click') {
        this.$emit('search', e.target.value, e);
      }
      this.$emit('change', e);
    },
    onSearch(e) {
      if (this.loading || this.disabled) {
        return;
      }
      this.$emit('search', this.input.stateValue, e);
      if (!isMobile({ tablet: true })) {
        this.input.focus();
      }
    },
    focus() {
      this.input.focus();
    },

    blur() {
      this.input.blur();
    },
    renderLoading(prefixCls) {
      const { size } = this.$props;
      let enterButton = getComponent(this, 'enterButton');
      // 兼容 <a-input-search enterButton />， 因enterButton类型为 any，此类写法 enterButton 为空字符串
      enterButton = enterButton || enterButton === '';
      if (enterButton) {
        return (
          <Button class={`${prefixCls}-button`} type="primary" size={size} key="enterButton">
            <LoadingOutlined />
          </Button>
        );
      }
      return <LoadingOutlined class={`${prefixCls}-icon`} key="loadingIcon" />;
    },
    renderSuffix(prefixCls) {
      const { loading } = this;
      const suffix = getComponent(this, 'suffix');
      let enterButton = getComponent(this, 'enterButton');
      // 兼容 <a-input-search enterButton />， 因enterButton类型为 any，此类写法 enterButton 为空字符串
      enterButton = enterButton || enterButton === '';
      if (loading && !enterButton) {
        return [suffix, this.renderLoading(prefixCls)];
      }

      if (enterButton) return suffix;

      const icon = (
        <SearchOutlined class={`${prefixCls}-icon`} key="searchIcon" onClick={this.onSearch} />
      );

      if (suffix) {
        // let cloneSuffix = suffix;
        // if (isValidElement(cloneSuffix) && !cloneSuffix.key) {
        //   cloneSuffix = cloneElement(cloneSuffix, {
        //     key: 'originSuffix',
        //   });
        // }
        return [suffix, icon];
      }

      return icon;
    },
    renderAddonAfter(prefixCls) {
      const { size, disabled, loading } = this;
      const btnClassName = `${prefixCls}-button`;
      let enterButton = getComponent(this, 'enterButton');
      enterButton = enterButton || enterButton === '';
      const addonAfter = getComponent(this, 'addonAfter');
      if (loading && enterButton) {
        return [this.renderLoading(prefixCls), addonAfter];
      }
      if (!enterButton) return addonAfter;
      const enterButtonAsElement = Array.isArray(enterButton) ? enterButton[0] : enterButton;
      let button;
      const isAntdButton =
        enterButtonAsElement.type &&
        isPlainObject(enterButtonAsElement.type) &&
        enterButtonAsElement.type.__ANT_BUTTON;
      if (enterButtonAsElement.tagName === 'button' || isAntdButton) {
        button = cloneElement(enterButtonAsElement, {
          key: 'enterButton',
          class: isAntdButton ? btnClassName : '',
          ...(isAntdButton ? { size } : {}),
          onClick: this.onSearch,
        });
      } else {
        button = (
          <Button
            class={btnClassName}
            type="primary"
            size={size}
            disabled={disabled}
            key="enterButton"
            onClick={this.onSearch}
          >
            {enterButton === true || enterButton === '' ? <SearchOutlined /> : enterButton}
          </Button>
        );
      }
      if (addonAfter) {
        return [button, addonAfter];
      }

      return button;
    },
  },
  render() {
    const {
      prefixCls: customizePrefixCls,
      inputPrefixCls: customizeInputPrefixCls,
      size,
      class: className,
      ...restProps
    } = { ...getOptionProps(this), ...this.$attrs };
    delete restProps.onSearch;
    delete restProps.loading;
    delete restProps.enterButton;
    delete restProps.addonBefore;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('input-search', customizePrefixCls);
    const inputPrefixCls = getPrefixCls('input', customizeInputPrefixCls);

    let enterButton = getComponent(this, 'enterButton');
    const addonBefore = getComponent(this, 'addonBefore');
    enterButton = enterButton || enterButton === '';
    let inputClassName;
    if (enterButton) {
      inputClassName = classNames(prefixCls, className, {
        [`${prefixCls}-enter-button`]: !!enterButton,
        [`${prefixCls}-${size}`]: !!size,
      });
    } else {
      inputClassName = prefixCls;
    }

    const inputProps = {
      ...restProps,
      prefixCls: inputPrefixCls,
      size,
      suffix: this.renderSuffix(prefixCls),
      prefix: getComponent(this, 'prefix'),
      addonAfter: this.renderAddonAfter(prefixCls),
      addonBefore,
      class: inputClassName,
      onPressEnter: this.onSearch,
      onChange: this.onChange,
    };
    return <Input {...inputProps} ref={this.saveInput} />;
  },
};
