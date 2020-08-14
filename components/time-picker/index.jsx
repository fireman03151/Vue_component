import omit from 'omit.js';
import { inject, provide } from 'vue';
import VcTimePicker from '../vc-time-picker';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import BaseMixin from '../_util/BaseMixin';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import ClockCircleOutlined from '@ant-design/icons-vue/ClockCircleOutlined';
import CloseCircleFilled from '@ant-design/icons-vue/CloseCircleFilled';
import enUS from './locale/en_US';
import {
  initDefaultProps,
  hasProp,
  getOptionProps,
  getComponent,
  isValidElement,
} from '../_util/props-util';
import { cloneElement } from '../_util/vnode';
import { ConfigConsumerProps } from '../config-provider';
import {
  checkValidate,
  stringToMoment,
  momentToString,
  TimeOrTimesType,
} from '../_util/moment-util';

export function generateShowHourMinuteSecond(format) {
  // Ref: http://momentjs.com/docs/#/parsing/string-format/
  return {
    showHour: format.indexOf('H') > -1 || format.indexOf('h') > -1 || format.indexOf('k') > -1,
    showMinute: format.indexOf('m') > -1,
    showSecond: format.indexOf('s') > -1,
  };
}

export const TimePickerProps = () => ({
  size: PropTypes.oneOf(['large', 'default', 'small']),
  value: TimeOrTimesType,
  defaultValue: TimeOrTimesType,
  open: PropTypes.bool,
  format: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  prefixCls: PropTypes.string,
  hideDisabledOptions: PropTypes.bool,
  disabledHours: PropTypes.func,
  disabledMinutes: PropTypes.func,
  disabledSeconds: PropTypes.func,
  getPopupContainer: PropTypes.func,
  use12Hours: PropTypes.bool,
  focusOnOpen: PropTypes.bool,
  hourStep: PropTypes.number,
  minuteStep: PropTypes.number,
  secondStep: PropTypes.number,
  allowEmpty: PropTypes.bool,
  allowClear: PropTypes.bool,
  inputReadOnly: PropTypes.bool,
  clearText: PropTypes.string,
  defaultOpenValue: PropTypes.object,
  popupClassName: PropTypes.string,
  popupStyle: PropTypes.object,
  suffixIcon: PropTypes.any,
  align: PropTypes.object,
  placement: PropTypes.any,
  transitionName: PropTypes.string,
  autofocus: PropTypes.bool,
  addon: PropTypes.any,
  clearIcon: PropTypes.any,
  locale: PropTypes.object,
  valueFormat: PropTypes.string,
  onChange: PropTypes.func,
  onAmPmChange: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeydown: PropTypes.func,
  onOpenChange: PropTypes.func,
  'onUpdate:value': PropTypes.func,
  'onUpdate:open': PropTypes.func,
});

const TimePicker = {
  name: 'ATimePicker',
  inheritAttrs: false,
  mixins: [BaseMixin],
  props: initDefaultProps(TimePickerProps(), {
    align: {
      offset: [0, -2],
    },
    disabled: false,
    disabledHours: undefined,
    disabledMinutes: undefined,
    disabledSeconds: undefined,
    hideDisabledOptions: false,
    placement: 'bottomLeft',
    transitionName: 'slide-up',
    focusOnOpen: true,
    allowClear: true,
  }),
  created() {
    provide('savePopupRef', this.savePopupRef);
  },
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },

  data() {
    const { value, defaultValue, valueFormat } = this;

    checkValidate('TimePicker', defaultValue, 'defaultValue', valueFormat);
    checkValidate('TimePicker', value, 'value', valueFormat);
    warning(
      !hasProp(this, 'allowEmpty'),
      'TimePicker',
      '`allowEmpty` is deprecated. Please use `allowClear` instead.',
    );
    return {
      sValue: stringToMoment(value || defaultValue, valueFormat),
    };
  },
  watch: {
    value(val) {
      checkValidate('TimePicker', val, 'value', this.valueFormat);
      this.setState({ sValue: stringToMoment(val, this.valueFormat) });
    },
  },
  methods: {
    getDefaultFormat() {
      const { format, use12Hours } = this;
      if (format) {
        return format;
      } else if (use12Hours) {
        return 'h:mm:ss a';
      }
      return 'HH:mm:ss';
    },

    getAllowClear() {
      const { allowClear, allowEmpty } = this.$props;
      if (hasProp(this, 'allowClear')) {
        return allowClear;
      }
      return allowEmpty;
    },
    getDefaultLocale() {
      const defaultLocale = {
        ...enUS,
        ...this.$props.locale,
      };
      return defaultLocale;
    },
    savePopupRef(ref) {
      this.popupRef = ref;
    },
    saveTimePicker(timePickerRef) {
      this.timePickerRef = timePickerRef;
    },
    handleChange(value) {
      if (!hasProp(this, 'value')) {
        this.setState({ sValue: value });
      }
      const { format = 'HH:mm:ss' } = this;
      const val = this.valueFormat ? momentToString(value, this.valueFormat) : value;
      this.$emit('update:value', val);
      this.$emit('change', val, (value && value.format(format)) || '');
    },

    handleOpenClose({ open }) {
      this.$emit('update:open', open);
      this.$emit('openChange', open);
    },

    focus() {
      this.timePickerRef.focus();
    },

    blur() {
      this.timePickerRef.blur();
    },

    renderInputIcon(prefixCls) {
      let suffixIcon = getComponent(this, 'suffixIcon');
      suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
      const clockIcon = (suffixIcon &&
        isValidElement(suffixIcon) &&
        cloneElement(suffixIcon, {
          class: `${prefixCls}-clock-icon`,
        })) || <ClockCircleOutlined class={`${prefixCls}-clock-icon`} />;

      return <span class={`${prefixCls}-icon`}>{clockIcon}</span>;
    },

    renderClearIcon(prefixCls) {
      const clearIcon = getComponent(this, 'clearIcon');
      const clearIconPrefixCls = `${prefixCls}-clear`;

      if (clearIcon && isValidElement(clearIcon)) {
        return cloneElement(clearIcon, {
          class: clearIconPrefixCls,
        });
      }

      return <CloseCircleFilled class={clearIconPrefixCls} />;
    },

    renderTimePicker(locale) {
      let props = getOptionProps(this);
      props = omit(props, ['defaultValue', 'suffixIcon', 'allowEmpty', 'allowClear']);
      const { class: className } = this.$attrs;
      const { prefixCls: customizePrefixCls, getPopupContainer, placeholder, size } = props;
      const getPrefixCls = this.configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('time-picker', customizePrefixCls);

      const format = this.getDefaultFormat();
      const pickerClassName = {
        [className]: className,
        [`${prefixCls}-${size}`]: !!size,
      };
      const tempAddon = getComponent(this, 'addon', {}, false);
      const pickerAddon = panel => {
        return tempAddon ? (
          <div class={`${prefixCls}-panel-addon`}>
            {typeof tempAddon === 'function' ? tempAddon(panel) : tempAddon}
          </div>
        ) : null;
      };
      const inputIcon = this.renderInputIcon(prefixCls);
      const clearIcon = this.renderClearIcon(prefixCls);
      const { getPopupContainer: getContextPopupContainer } = this.configProvider;
      const timeProps = {
        ...generateShowHourMinuteSecond(format),
        ...props,
        ...this.$attrs,
        allowEmpty: this.getAllowClear(),
        prefixCls,
        getPopupContainer: getPopupContainer || getContextPopupContainer,
        format,
        value: this.sValue,
        placeholder: placeholder === undefined ? locale.placeholder : placeholder,
        addon: pickerAddon,
        inputIcon,
        clearIcon,
        class: pickerClassName,
        ref: this.saveTimePicker,
        onChange: this.handleChange,
        onOpen: this.handleOpenClose,
        onClose: this.handleOpenClose,
      };
      return <VcTimePicker {...timeProps} />;
    },
  },

  render() {
    return (
      <LocaleReceiver
        componentName="TimePicker"
        defaultLocale={this.getDefaultLocale()}
        children={this.renderTimePicker}
      />
    );
  },
};

/* istanbul ignore next */
TimePicker.install = function(app) {
  app.component(TimePicker.name, TimePicker);
};

export default TimePicker;
