import { inject } from 'vue';
import AsyncValidator from 'async-validator';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from '../_util/vue-types';
import { ColProps } from '../grid/Col';
import {
  initDefaultProps,
  getComponent,
  getOptionProps,
  getEvents,
  isValidElement,
  getSlot,
} from '../_util/props-util';
import BaseMixin from '../_util/BaseMixin';
import { ConfigConsumerProps } from '../config-provider';
import FormItem from '../form/FormItem';
import { cloneElement } from '../_util/vnode';

function noop() {}

function getPropByPath(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');

  let keyArr = path.split('.');
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null,
  };
}
export const FormItemProps = {
  id: PropTypes.string,
  htmlFor: PropTypes.string,
  prefixCls: PropTypes.string,
  label: PropTypes.any,
  help: PropTypes.any,
  extra: PropTypes.any,
  labelCol: PropTypes.shape(ColProps).loose,
  wrapperCol: PropTypes.shape(ColProps).loose,
  hasFeedback: PropTypes.bool,
  colon: PropTypes.bool,
  labelAlign: PropTypes.oneOf(['left', 'right']),
  prop: PropTypes.string,
  rules: PropTypes.oneOfType([Array, Object]),
  autoLink: PropTypes.bool,
  required: PropTypes.bool,
  validateFirst: PropTypes.bool,
  validateStatus: PropTypes.oneOf(['', 'success', 'warning', 'error', 'validating']),
};

export default {
  name: 'AFormModelItem',
  mixins: [BaseMixin],
  inheritAttrs: false,
  __ANT_NEW_FORM_ITEM: true,
  props: initDefaultProps(FormItemProps, {
    hasFeedback: false,
    autoLink: true,
  }),
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
      FormContext: inject('FormContext', {}),
    };
  },
  data() {
    return {
      validateState: this.validateStatus,
      validateMessage: '',
      validateDisabled: false,
      validator: {},
    };
  },

  computed: {
    fieldValue() {
      const model = this.FormContext.model;
      if (!model || !this.prop) {
        return;
      }
      let path = this.prop;
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/g, '.');
      }
      return getPropByPath(model, path, true).v;
    },
    isRequired() {
      let rules = this.getRules();
      let isRequired = false;
      if (rules && rules.length) {
        rules.every(rule => {
          if (rule.required) {
            isRequired = true;
            return false;
          }
          return true;
        });
      }
      return isRequired;
    },
  },
  watch: {
    validateStatus(val) {
      this.validateState = val;
    },
  },
  mounted() {
    if (this.prop) {
      const { addField } = this.FormContext;
      addField && addField(this);
      this.initialValue = cloneDeep(this.fieldValue);
    }
  },
  beforeUnmount() {
    const { removeField } = this.FormContext;
    removeField && removeField(this);
  },
  methods: {
    validate(trigger, callback = noop) {
      this.validateDisabled = false;
      const rules = this.getFilteredRule(trigger);
      if (!rules || rules.length === 0) {
        callback();
        return true;
      }
      this.validateState = 'validating';
      const descriptor = {};
      if (rules && rules.length > 0) {
        rules.forEach(rule => {
          delete rule.trigger;
        });
      }
      descriptor[this.prop] = rules;
      const validator = new AsyncValidator(descriptor);
      if (this.FormContext && this.FormContext.validateMessages) {
        validator.messages(this.FormContext.validateMessages);
      }
      const model = {};
      model[this.prop] = this.fieldValue;
      validator.validate(model, { firstFields: true }, (errors, invalidFields) => {
        this.validateState = errors ? 'error' : 'success';
        this.validateMessage = errors ? errors[0].message : '';
        callback(this.validateMessage, invalidFields);
        this.FormContext &&
          this.FormContext.$emit &&
          this.FormContext.$emit('validate', this.prop, !errors, this.validateMessage || null);
      });
    },
    getRules() {
      let formRules = this.FormContext.rules;
      const selfRules = this.rules;
      const requiredRule =
        this.required !== undefined ? { required: !!this.required, trigger: 'change' } : [];
      const prop = getPropByPath(formRules, this.prop || '');
      formRules = formRules ? prop.o[this.prop || ''] || prop.v : [];
      return [].concat(selfRules || formRules || []).concat(requiredRule);
    },
    getFilteredRule(trigger) {
      const rules = this.getRules();
      return rules
        .filter(rule => {
          if (!rule.trigger || trigger === '') return true;
          if (Array.isArray(rule.trigger)) {
            return rule.trigger.indexOf(trigger) > -1;
          } else {
            return rule.trigger === trigger;
          }
        })
        .map(rule => ({ ...rule }));
    },
    onFieldBlur() {
      this.validate('blur');
    },
    onFieldChange() {
      if (this.validateDisabled) {
        this.validateDisabled = false;
        return;
      }
      this.validate('change');
    },
    clearValidate() {
      this.validateState = '';
      this.validateMessage = '';
      this.validateDisabled = false;
    },
    resetField() {
      this.validateState = '';
      this.validateMessage = '';
      let model = this.FormContext.model || {};
      let value = this.fieldValue;
      let path = this.prop;
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.');
      }
      let prop = getPropByPath(model, path, true);
      this.validateDisabled = true;
      if (Array.isArray(value)) {
        prop.o[prop.k] = [].concat(this.initialValue);
      } else {
        prop.o[prop.k] = this.initialValue;
      }
      // reset validateDisabled after onFieldChange triggered
      this.$nextTick(() => {
        this.validateDisabled = false;
      });
    },
  },
  render() {
    const { autoLink, ...props } = getOptionProps(this);
    const label = getComponent(this, 'label');
    const extra = getComponent(this, 'extra');
    const help = getComponent(this, 'help');
    const formProps = {
      ...this.$attrs,
      ...props,
      label,
      extra,
      validateStatus: this.validateState,
      help: this.validateMessage || help,
      required: this.isRequired || props.required,
    };
    const children = getSlot(this);
    let firstChildren = children[0];
    if (this.prop && autoLink && isValidElement(firstChildren)) {
      const originalEvents = getEvents(firstChildren);
      const originalBlur = originalEvents.onBlur;
      const originalChange = originalEvents.onChange;
      firstChildren = cloneElement(firstChildren, {
        onBlur: (...args) => {
          originalBlur && originalBlur(...args);
          this.onFieldBlur();
        },
        onChange: (...args) => {
          if (Array.isArray(originalChange)) {
            for (let i = 0, l = originalChange.length; i < l; i++) {
              originalChange[i](...args);
            }
          } else if (originalChange) {
            originalChange(...args);
          }
          this.onFieldChange();
        },
      });
    }
    return (
      <FormItem {...formProps}>
        {firstChildren}
        {children.slice(1)}
      </FormItem>
    );
  },
};
