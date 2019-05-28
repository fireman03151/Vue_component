import Vue from 'vue';
import PropTypes from '../_util/vue-types';
import { filterEmpty, getComponentFromProp } from '../_util/props-util';
import defaultRenderEmpty from './renderEmpty';

function getWatch(keys = []) {
  const watch = {};
  keys.forEach(k => {
    watch[k] = function() {
      this._proxyVm._data[k] = value;
    };
  });
  return watch;
}

const ConfigProvider = {
  name: 'AConfigProvider',
  props: {
    getPopupContainer: PropTypes.func,
    prefixCls: PropTypes.string,
    renderEmpty: PropTypes.any,
    csp: PropTypes.any,
    autoInsertSpaceInButton: PropTypes.bool,
  },
  provide() {
    const _self = this;
    this._proxyVm = new Vue({
      data() {
        return {
          ..._self.$props,
          getPrefixCls: _self.getPrefixCls,
          renderEmpty: _self.renderEmptyComponent,
        };
      },
    });
    return {
      configProvider: this._proxyVm._data,
    };
  },
  watch: {
    ...getWatch(['prefixCls', 'csp', 'autoInsertSpaceInButton']),
  },
  methods: {
    renderEmptyComponent() {
      const customRender = getComponentFromProp(this, 'renderEmpty', {}, false);
      return this.$props.renderEmpty || customRender || defaultRenderEmpty;
    },
    getPrefixCls(suffixCls, customizePrefixCls) {
      const { prefixCls = 'ant' } = this.$props;
      if (customizePrefixCls) return customizePrefixCls;
      return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
    },
  },
  render() {
    return this.$slots.default ? filterEmpty(this.$slots.default) : null;
  },
};

export const ConfigConsumerProps = {
  getPrefixCls: (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) return customizePrefixCls;
    return `ant-${suffixCls}`;
  },
  renderEmpty: defaultRenderEmpty,
};

/* istanbul ignore next */
ConfigProvider.install = function(Vue) {
  Vue.component(ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider;
