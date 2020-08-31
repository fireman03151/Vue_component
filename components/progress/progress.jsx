import { inject } from 'vue';
import classNames from '../_util/classNames';
import PropTypes from '../_util/vue-types';
import { getOptionProps, initDefaultProps } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined';
import CheckOutlined from '@ant-design/icons-vue/CheckOutlined';
import CheckCircleFilled from '@ant-design/icons-vue/CheckCircleFilled';
import CloseCircleFilled from '@ant-design/icons-vue/CloseCircleFilled';
import Line from './line';
import Circle from './circle';
import { validProgress } from './utils';

const ProgressStatuses = ['normal', 'exception', 'active', 'success'];
export const ProgressType = PropTypes.oneOf(['line', 'circle', 'dashboard']);
export const ProgressSize = PropTypes.oneOf(['default', 'small']);

export const ProgressProps = {
  prefixCls: PropTypes.string,
  type: ProgressType,
  percent: PropTypes.number,
  successPercent: PropTypes.number,
  format: PropTypes.func,
  status: PropTypes.oneOf(ProgressStatuses),
  showInfo: PropTypes.bool,
  strokeWidth: PropTypes.number,
  strokeLinecap: PropTypes.oneOf(['butt', 'round', 'square']),
  strokeColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  trailColor: PropTypes.string,
  width: PropTypes.number,
  gapDegree: PropTypes.number,
  gapPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  size: ProgressSize,
};

export default {
  name: 'AProgress',
  props: initDefaultProps(ProgressProps, {
    type: 'line',
    percent: 0,
    showInfo: true,
    trailColor: '#f3f3f3',
    size: 'default',
    gapDegree: 0,
    strokeLinecap: 'round',
  }),
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  methods: {
    getPercentNumber() {
      const { successPercent, percent = 0 } = this.$props;
      return parseInt(
        successPercent !== undefined ? successPercent.toString() : percent.toString(),
        10,
      );
    },

    getProgressStatus() {
      const { status } = this.$props;
      if (ProgressStatuses.indexOf(status) < 0 && this.getPercentNumber() >= 100) {
        return 'success';
      }
      return status || 'normal';
    },
    renderProcessInfo(prefixCls, progressStatus) {
      const { showInfo, format, type, percent, successPercent } = this.$props;
      if (!showInfo) return null;

      let text;
      const textFormatter = format || this.$slots.format || (percentNumber => `${percentNumber}%`);
      const isLineType = type === 'line';
      if (
        format ||
        this.$slots.format ||
        (progressStatus !== 'exception' && progressStatus !== 'success')
      ) {
        text = textFormatter(validProgress(percent), validProgress(successPercent));
      } else if (progressStatus === 'exception') {
        text = isLineType ? <CloseCircleFilled /> : <CloseOutlined />;
      } else if (progressStatus === 'success') {
        text = isLineType ? <CheckCircleFilled /> : <CheckOutlined />;
      }
      return (
        <span class={`${prefixCls}-text`} title={typeof text === 'string' ? text : undefined}>
          {text}
        </span>
      );
    },
  },
  render() {
    const props = getOptionProps(this);
    const { prefixCls: customizePrefixCls, size, type, showInfo } = props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('progress', customizePrefixCls);
    const progressStatus = this.getProgressStatus();
    const progressInfo = this.renderProcessInfo(prefixCls, progressStatus);

    let progress;

    // Render progress shape
    if (type === 'line') {
      const lineProps = {
        ...props,
        prefixCls,
      };
      progress = <Line {...lineProps}>{progressInfo}</Line>;
    } else if (type === 'circle' || type === 'dashboard') {
      const circleProps = {
        ...props,
        prefixCls,
        progressStatus,
      };
      progress = <Circle {...circleProps}>{progressInfo}</Circle>;
    }

    const classString = classNames(prefixCls, {
      [`${prefixCls}-${(type === 'dashboard' && 'circle') || type}`]: true,
      [`${prefixCls}-status-${progressStatus}`]: true,
      [`${prefixCls}-show-info`]: showInfo,
      [`${prefixCls}-${size}`]: size,
    });

    const progressProps = {
      class: classString,
    };
    return <div {...progressProps}>{progress}</div>;
  },
};
