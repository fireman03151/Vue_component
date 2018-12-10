
import PropTypes from '../_util/vue-types'
import { getOptionProps, getComponentFromProp } from '../_util/props-util'
import VcSwitch from '../vc-switch'
import Wave from '../_util/wave'
import Icon from '../icon'

const Switch = {
  name: 'ASwitch',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    prefixCls: PropTypes.string.def('ant-switch'),
    // size=default and size=large are the same
    size: PropTypes.oneOf(['small', 'default', 'large']),
    disabled: PropTypes.bool,
    checkedChildren: PropTypes.any,
    unCheckedChildren: PropTypes.any,
    tabIndex: PropTypes.number,
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    autoFocus: PropTypes.bool,
    loading: PropTypes.bool,
  },
  methods: {
    focus () {
      this.$refs.refSwitchNode.focus()
    },
    blur () {
      this.$refs.refSwitchNode.blur()
    },
  },

  render () {
    const { prefixCls, size, loading, ...restProps } = getOptionProps(this)
    const classes = {
      [`${prefixCls}-small`]: size === 'small',
      [`${prefixCls}-loading`]: loading,
    }
    const loadingIcon = loading ? (
      <Icon
        type='loading'
        class={`${prefixCls}-loading-icon`}
      />
    ) : null
    const switchProps = {
      props: {
        ...restProps,
        prefixCls,
        loadingIcon,
        checkedChildren: getComponentFromProp(this, 'checkedChildren'),
        unCheckedChildren: getComponentFromProp(this, 'unCheckedChildren'),
      },
      on: this.$listeners,
      class: classes,
      ref: 'refSwitchNode',
    }
    return (
      <Wave insertExtraNode>
        <VcSwitch
          {...switchProps}
        />
      </Wave>
    )
  },
}

/* istanbul ignore next */
Switch.install = function (Vue) {
  Vue.component(Switch.name, Switch)
}

export default Switch
