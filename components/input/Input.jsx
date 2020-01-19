import classNames from 'classnames';
import TextArea from './TextArea';
import omit from 'omit.js';
import inputProps from './inputProps';
import { hasProp, getComponentFromProp, getListeners } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';
import Icon from '../icon';

function noop() {}

function fixControlledValue(value) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

function hasPrefixSuffix(instance) {
  return !!(
    getComponentFromProp(instance, 'prefix') ||
    getComponentFromProp(instance, 'suffix') ||
    instance.$props.allowClear
  );
}

export default {
  name: 'AInput',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change.value',
  },
  props: {
    ...inputProps,
  },
  inject: {
    configProvider: { default: () => ConfigConsumerProps },
  },
  data() {
    const { value = '', defaultValue = '' } = this.$props;
    return {
      stateValue: !hasProp(this, 'value') ? defaultValue : value,
    };
  },
  watch: {
    value(val) {
      this.stateValue = val;
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.autoFocus) {
        this.focus();
      }
    });
  },
  methods: {
    handleKeyDown(e) {
      if (e.keyCode === 13) {
        this.$emit('pressEnter', e);
      }
      this.$emit('keydown', e);
    },

    focus() {
      this.$refs.input.focus();
    },

    blur() {
      this.$refs.input.blur();
    },
    select() {
      this.$refs.input.select();
    },

    getInputClassName(prefixCls) {
      const { size, disabled } = this.$props;
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-sm`]: size === 'small',
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-disabled`]: disabled,
      };
    },

    setValue(value, e) {
      if (this.stateValue === value) {
        return;
      }
      if (!hasProp(this, 'value')) {
        this.stateValue = value;
      } else {
        this.$forceUpdate();
      }
      this.$emit('change.value', value);
      let event = e;
      if (e.type === 'click' && this.$refs.input) {
        // click clear icon
        event = { ...e };
        event.target = this.$refs.input;
        event.currentTarget = this.$refs.input;
        const originalInputValue = this.$refs.input.value;
        // change input value cause e.target.value should be '' when clear input
        this.$refs.input.value = '';
        this.$emit('change', event);
        this.$emit('input', event);
        // reset input value
        this.$refs.input.value = originalInputValue;
        return;
      }
      this.$emit('change', e);
      this.$emit('input', e);
    },

    handleReset(e) {
      this.setValue('', e);
      this.$nextTick(() => {
        this.focus();
      });
    },

    handleChange(e) {
      const { value, composing } = e.target;
      if (composing && this.lazy) return;
      this.setValue(value, e);
    },

    renderClearIcon(prefixCls) {
      const { allowClear, disabled } = this.$props;
      const { stateValue } = this;
      if (
        !allowClear ||
        disabled ||
        stateValue === undefined ||
        stateValue === null ||
        stateValue === ''
      ) {
        return null;
      }
      return (
        <Icon
          type="close-circle"
          theme="filled"
          onClick={this.handleReset}
          class={`${prefixCls}-clear-icon`}
          role="button"
        />
      );
    },

    renderSuffix(prefixCls) {
      const { allowClear } = this.$props;
      let suffix = getComponentFromProp(this, 'suffix');
      if (suffix || allowClear) {
        return (
          <span class={`${prefixCls}-suffix`} key="suffix">
            {this.renderClearIcon(prefixCls)}
            {suffix}
          </span>
        );
      }
      return null;
    },

    renderLabeledInput(prefixCls, children) {
      const props = this.$props;
      let addonAfter = getComponentFromProp(this, 'addonAfter');
      let addonBefore = getComponentFromProp(this, 'addonBefore');
      // Not wrap when there is not addons
      if (!addonBefore && !addonAfter) {
        return children;
      }

      const wrapperClassName = `${prefixCls}-group`;
      const addonClassName = `${wrapperClassName}-addon`;
      addonBefore = addonBefore ? <span class={addonClassName}>{addonBefore}</span> : null;

      addonAfter = addonAfter ? <span class={addonClassName}>{addonAfter}</span> : null;

      const mergedWrapperClassName = {
        [`${prefixCls}-wrapper`]: true,
        [wrapperClassName]: addonBefore || addonAfter,
      };

      const mergedGroupClassName = classNames(`${prefixCls}-group-wrapper`, {
        [`${prefixCls}-group-wrapper-sm`]: props.size === 'small',
        [`${prefixCls}-group-wrapper-lg`]: props.size === 'large',
      });
      return (
        <span class={mergedGroupClassName}>
          <span class={mergedWrapperClassName}>
            {addonBefore}
            {children}
            {addonAfter}
          </span>
        </span>
      );
    },
    renderLabeledIcon(prefixCls, children) {
      const { size } = this.$props;
      let suffix = this.renderSuffix(prefixCls);
      if (!hasPrefixSuffix(this)) {
        return children;
      }
      let prefix = getComponentFromProp(this, 'prefix');
      prefix = prefix ? (
        <span class={`${prefixCls}-prefix`} key="prefix">
          {prefix}
        </span>
      ) : null;

      const affixWrapperCls = classNames(`${prefixCls}-affix-wrapper`, {
        [`${prefixCls}-affix-wrapper-sm`]: size === 'small',
        [`${prefixCls}-affix-wrapper-lg`]: size === 'large',
      });
      return (
        <span class={affixWrapperCls} key="affix">
          {prefix}
          {children}
          {suffix}
        </span>
      );
    },

    renderInput(prefixCls) {
      const otherProps = omit(this.$props, [
        'prefixCls',
        'addonBefore',
        'addonAfter',
        'prefix',
        'suffix',
        'allowClear',
        'value',
        'defaultValue',
        'lazy',
      ]);
      const { stateValue, getInputClassName, handleKeyDown, handleChange } = this;
      const inputProps = {
        directives: [{ name: 'ant-input' }],
        domProps: {
          value: fixControlledValue(stateValue),
        },
        attrs: { ...otherProps, ...this.$attrs },
        on: {
          ...getListeners(this),
          keydown: handleKeyDown,
          input: handleChange,
          change: noop,
        },
        class: getInputClassName(prefixCls),
        ref: 'input',
        key: 'ant-input',
      };
      return this.renderLabeledIcon(prefixCls, <input {...inputProps} />);
    },
  },
  render() {
    if (this.$props.type === 'textarea') {
      const textareaProps = {
        props: this.$props,
        attrs: this.$attrs,
        on: {
          ...getListeners(this),
          input: this.handleChange,
          keydown: this.handleKeyDown,
          change: noop,
        },
        directives: [
          {
            name: 'ant-input',
          },
        ],
      };
      return <TextArea {...textareaProps} ref="input" />;
    }
    const { prefixCls: customizePrefixCls } = this.$props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    return this.renderLabeledInput(prefixCls, this.renderInput(prefixCls));
  },
};
