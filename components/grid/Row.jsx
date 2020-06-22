import { inject, provide, reactive } from 'vue';
import PropTypes from '../_util/vue-types';
import BaseMixin from '../_util/BaseMixin';
import { ConfigConsumerProps } from '../config-provider';
import ResponsiveObserve from '../_util/responsiveObserve';
import { getSlot } from '../_util/props-util';

const RowProps = {
  gutter: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  type: PropTypes.oneOf(['flex']),
  align: PropTypes.oneOf(['top', 'middle', 'bottom', 'stretch']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'space-around', 'space-between']),
  prefixCls: PropTypes.string,
};

const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export default {
  name: 'ARow',
  mixins: [BaseMixin],
  props: {
    ...RowProps,
    gutter: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]).def(0),
  },
  setup() {
    const rowContext = reactive({
      getGutter: undefined,
    });
    provide('rowContext', rowContext);
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
      rowContext,
    };
  },
  data() {
    return {
      screens: {},
    };
  },
  created() {
    this.rowContext.getGutter = this.getGutter;
  },
  mounted() {
    this.$nextTick(() => {
      this.token = ResponsiveObserve.subscribe(screens => {
        const { gutter } = this;
        if (
          typeof gutter === 'object' ||
          (Array.isArray(gutter) &&
            (typeof gutter[0] === 'object' || typeof gutter[1] === 'object'))
        ) {
          this.screens = screens;
        }
      });
    });
  },
  beforeUnmount() {
    ResponsiveObserve.unsubscribe(this.token);
  },
  methods: {
    getGutter() {
      const results = [0, 0];
      const { gutter, screens } = this;
      const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, 0];
      normalizedGutter.forEach((g, index) => {
        if (typeof g === 'object') {
          for (let i = 0; i < responsiveArray.length; i++) {
            const breakpoint = responsiveArray[i];
            if (screens[breakpoint] && g[breakpoint] !== undefined) {
              results[index] = g[breakpoint];
              break;
            }
          }
        } else {
          results[index] = g || 0;
        }
      });
      return results;
    },
  },

  render() {
    const { type, justify, align, prefixCls: customizePrefixCls } = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('row', customizePrefixCls);

    const gutter = this.getGutter();
    const classes = {
      [prefixCls]: !type,
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${type}-${justify}`]: type && justify,
      [`${prefixCls}-${type}-${align}`]: type && align,
    };
    const rowStyle = {
      ...(gutter[0] > 0
        ? {
            marginLeft: `${gutter[0] / -2}px`,
            marginRight: `${gutter[0] / -2}px`,
          }
        : {}),
      ...(gutter[1] > 0
        ? {
            marginTop: `${gutter[1] / -2}px`,
            marginBottom: `${gutter[1] / -2}px`,
          }
        : {}),
    };
    return (
      <div class={classes} style={rowStyle}>
        {getSlot(this)}
      </div>
    );
  },
};
