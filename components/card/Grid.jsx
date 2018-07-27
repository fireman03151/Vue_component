
import PropTypes from '../_util/vue-types'

export default {
  name: 'ACardGrid',
  props: {
    prefixCls: PropTypes.string.def('ant-card'),
  },
  render () {
    const { prefixCls = 'ant-card' } = this.$props
    const classString = {
      [`${prefixCls}-grid`]: true,
    }
    return (
      <div {...{ on: this.$listeners }} class={classString}>{this.$slots.default}</div>
    )
  },
}

