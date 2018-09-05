
import PropTypes from '../_util/vue-types'
import Align from '../align'
import PopupInner from './PopupInner'
import LazyRenderBox from './LazyRenderBox'
import { noop } from './utils'
import animate from '../_util/css-animation'

export default {
  props: {
    visible: PropTypes.bool,
    getClassNameFromAlign: PropTypes.func,
    getRootDomNode: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    prefixCls: PropTypes.string,
    getContainer: PropTypes.func,
    transitionName: PropTypes.string,
    animation: PropTypes.any,
    maskAnimation: PropTypes.string,
    maskTransitionName: PropTypes.string,
    mask: PropTypes.bool,
    zIndex: PropTypes.number,
    popupClassName: PropTypes.any,
    popupStyle: PropTypes.object.def({}),
    stretch: PropTypes.string,
    point: PropTypes.shape({
      pageX: PropTypes.number,
      pageY: PropTypes.number,
    }),
  },
  data () {
    return {
      // Used for stretch
      stretchChecked: false,
      targetWidth: undefined,
      targetHeight: undefined,
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.rootNode = this.getPopupDomNode()
      this.setStretchSize()
    })
  },
  updated () {
    this.$nextTick(() => {
      this.setStretchSize()
    })
  },
  beforeDestroy () {
    this.$el.remove()
  },
  methods: {
    onAlign (popupDomNode, align) {
      const props = this.$props
      const currentAlignClassName = props.getClassNameFromAlign(align)
      // FIX: https://github.com/react-component/trigger/issues/56
      // FIX: https://github.com/react-component/tooltip/issues/79
      if (this.currentAlignClassName !== currentAlignClassName) {
        this.currentAlignClassName = currentAlignClassName
        popupDomNode.className = this.getClassName(currentAlignClassName)
      }
      this.$listeners.align && this.$listeners.align(popupDomNode, align)
    },

    // Record size if stretch needed
    setStretchSize  () {
      const { stretch, getRootDomNode, visible } = this.$props
      const { stretchChecked, targetHeight, targetWidth } = this.$data

      if (!stretch || !visible) {
        if (stretchChecked) {
          this.setState({ stretchChecked: false })
        }
        return
      }

      const $ele = getRootDomNode()
      if (!$ele) return

      const height = $ele.offsetHeight
      const width = $ele.offsetWidth

      if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
        this.setState({
          stretchChecked: true,
          targetHeight: height,
          targetWidth: width,
        })
      }
    },

    getPopupDomNode () {
      return this.$refs.popupInstance ? this.$refs.popupInstance.$el : null
    },

    getTargetElement () {
      return this.$props.getRootDomNode()
    },

    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    // ref: https://www.npmjs.com/package/rc-align
    getAlignTarget  () {
      const { point } = this.$props
      if (point) {
        return point
      }
      return this.getTargetElement
    },

    getMaskTransitionName () {
      const props = this.$props
      let transitionName = props.maskTransitionName
      const animation = props.maskAnimation
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`
      }
      return transitionName
    },

    getTransitionName () {
      const props = this.$props
      let transitionName = props.transitionName
      const animation = props.animation
      if (!transitionName) {
        if (typeof animation === 'string') {
          transitionName = `${animation}`
        } else if (animation && animation.props && animation.props.name) {
          transitionName = animation.props.name
        }
      }
      return transitionName
    },

    getClassName (currentAlignClassName) {
      return `${this.$props.prefixCls} ${this.$props.popupClassName} ${currentAlignClassName}`
    },
    getPopupElement () {
      const { $props: props, $slots, $listeners, getTransitionName } = this
      const { stretchChecked, targetHeight, targetWidth } = this.$data

      const { align, visible, prefixCls, animation, popupStyle, getClassNameFromAlign,
        destroyPopupOnHide, stretch,
      } = props
      const { mouseenter, mouseleave } = $listeners
      const className = this.getClassName(this.currentAlignClassName ||
        getClassNameFromAlign(align))
      // const hiddenClassName = `${prefixCls}-hidden`
      if (!visible) {
        this.currentAlignClassName = null
      }
      const sizeStyle = {}
      if (stretch) {
      // Stretch with target
        if (stretch.indexOf('height') !== -1) {
          sizeStyle.height = typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight
        } else if (stretch.indexOf('minHeight') !== -1) {
          sizeStyle.minHeight = typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight
        }
        if (stretch.indexOf('width') !== -1) {
          sizeStyle.width = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth
        } else if (stretch.indexOf('minWidth') !== -1) {
          sizeStyle.minWidth = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth
        }

        // Delay force align to makes ui smooth
        if (!stretchChecked) {
          sizeStyle.visibility = 'hidden'
          setTimeout(() => {
            if (this.$refs.alignInstance) {
              this.$refs.alignInstance.forceAlign()
            }
          }, 0)
        }
      }
      const popupInnerProps = {
        props: {
          prefixCls,
          visible,
          // hiddenClassName,
        },
        class: className,
        on: {
          mouseenter: mouseenter || noop,
          mouseleave: mouseleave || noop,
        },
        ref: 'popupInstance',
        style: { ...sizeStyle, ...popupStyle, ...this.getZIndexStyle() },
      }
      let transitionProps = {
        props: Object.assign({
          appear: true,
          css: false,
        }),
      }
      const transitionName = getTransitionName()
      let useTransition = !!transitionName
      const transitionEvent = {
        beforeEnter: (el) => {
          // el.style.display = el.__vOriginalDisplay
          // this.$refs.alignInstance.forceAlign()
        },
        enter: (el, done) => {
          // align updated后执行动画
          this.$nextTick(() => {
            this.$refs.alignInstance.$nextTick(() => {
              animate(el, `${transitionName}-enter`, done)
            })
          })
        },
        leave: (el, done) => {
          animate(el, `${transitionName}-leave`, done)
        },
      }

      if (typeof animation === 'object') {
        useTransition = true
        const { on = {}, props = {}} = animation
        transitionProps.props = { ...transitionProps.props, ...props }
        transitionProps.on = { ...transitionEvent, ...on }
      } else {
        transitionProps.on = transitionEvent
      }
      if (!useTransition) {
        transitionProps = {}
      }
      if (destroyPopupOnHide) {
        return (<transition
          {...transitionProps}
        >
          {visible
            ? <Align
              target={this.getAlignTarget()}
              key='popup'
              ref='alignInstance'
              monitorWindowResize
              align={align}
              onAlign={this.onAlign}
              visible={visible}
            >
              <PopupInner
                {...popupInnerProps}
              >
                {$slots.default}
              </PopupInner>
            </Align> : null}
        </transition>)
      }
      return (<transition
        {...transitionProps}
      >
        <Align
          v-show={visible}
          target={this.getAlignTarget()}
          key='popup'
          ref='alignInstance'
          monitorWindowResize
          align={align}
          onAlign={this.onAlign}
          visible={visible}
        >
          <PopupInner
            {...popupInnerProps}
          >
            {$slots.default}
          </PopupInner>
        </Align>
      </transition>)
    },

    getZIndexStyle () {
      const style = {}
      const props = this.$props
      if (props.zIndex !== undefined) {
        style.zIndex = props.zIndex
      }
      return style
    },

    getMaskElement () {
      const props = this.$props
      let maskElement = null
      if (props.mask) {
        const maskTransition = this.getMaskTransitionName()
        maskElement = (
          <LazyRenderBox
            v-show={props.visible}
            style={this.getZIndexStyle()}
            key='mask'
            class={`${props.prefixCls}-mask`}
            visible={props.visible}
          />
        )
        if (maskTransition) {
          maskElement = (
            <transition
              appear
              name={maskTransition}
            >
              {maskElement}
            </transition>
          )
        }
      }
      return maskElement
    },
  },

  render () {
    const { getMaskElement, getPopupElement } = this
    return (
      <div>
        {getMaskElement()}
        {getPopupElement()}
      </div>
    )
  },
}

