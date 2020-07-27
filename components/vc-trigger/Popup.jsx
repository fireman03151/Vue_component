import { Transition } from 'vue';
import PropTypes from '../_util/vue-types';
import Align from '../vc-align';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';
import animate from '../_util/css-animation';
import BaseMixin from '../_util/BaseMixin';
import { saveRef } from './utils';
import { splitAttrs, findDOMNode } from '../_util/props-util';

export default {
  name: 'VCTriggerPopup',
  mixins: [BaseMixin],
  inheritAttrs: false,
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
    popupStyle: PropTypes.object.def(() => ({})),
    stretch: PropTypes.string,
    point: PropTypes.shape({
      pageX: PropTypes.number,
      pageY: PropTypes.number,
    }),
  },
  data() {
    this.domEl = null;
    this.currentAlignClassName = undefined;
    this.savePopupRef = saveRef.bind(this, 'popupInstance');
    this.saveAlignRef = saveRef.bind(this, 'alignInstance');
    return {
      // Used for stretch
      stretchChecked: false,
      targetWidth: undefined,
      targetHeight: undefined,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.rootNode = this.getPopupDomNode();
      this.setStretchSize();
    });
  },
  // 如添加会导致动画失效，如放开会导致快速输入时闪动 https://github.com/vueComponent/ant-design-vue/issues/1327，
  // 目前方案是保留动画，闪动问题(动画多次执行)进一步定位
  // beforeUpdate() {
  //   if (this.domEl && this.domEl.rcEndListener) {
  //     this.domEl.rcEndListener();
  //     this.domEl = null;
  //   }
  // },
  updated() {
    this.$nextTick(() => {
      this.setStretchSize();
    });
  },
  methods: {
    onAlign(popupDomNode, align) {
      const props = this.$props;
      const currentAlignClassName = props.getClassNameFromAlign(align);
      // FIX: https://github.com/react-component/trigger/issues/56
      // FIX: https://github.com/react-component/tooltip/issues/79
      if (this.currentAlignClassName !== currentAlignClassName) {
        this.currentAlignClassName = currentAlignClassName;
        popupDomNode.className = this.getClassName(currentAlignClassName);
      }
      const { onaAlign } = this.$attrs;
      onaAlign && onaAlign(popupDomNode, align);
    },

    // Record size if stretch needed
    setStretchSize() {
      const { stretch, getRootDomNode, visible } = this.$props;
      const { stretchChecked, targetHeight, targetWidth } = this.$data;

      if (!stretch || !visible) {
        if (stretchChecked) {
          this.setState({ stretchChecked: false });
        }
        return;
      }

      const $ele = getRootDomNode();
      if (!$ele) return;

      const height = $ele.offsetHeight;
      const width = $ele.offsetWidth;

      if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
        this.setState({
          stretchChecked: true,
          targetHeight: height,
          targetWidth: width,
        });
      }
    },

    getPopupDomNode() {
      return findDOMNode(this.popupInstance);
    },

    getTargetElement() {
      return this.$props.getRootDomNode();
    },

    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    // ref: https://www.npmjs.com/package/rc-align
    getAlignTarget() {
      const { point } = this.$props;
      if (point) {
        return point;
      }
      return this.getTargetElement;
    },

    getMaskTransitionName() {
      const props = this.$props;
      let transitionName = props.maskTransitionName;
      const animation = props.maskAnimation;
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`;
      }
      return transitionName;
    },

    getTransitionName() {
      const props = this.$props;
      let transitionName = props.transitionName;
      const animation = props.animation;
      if (!transitionName) {
        if (typeof animation === 'string') {
          transitionName = `${animation}`;
        } else if (animation && animation.props && animation.props.name) {
          transitionName = animation.props.name;
        }
      }
      return transitionName;
    },

    getClassName(currentAlignClassName) {
      return `${this.$props.prefixCls} ${this.$attrs.class || ''} ${
        this.$props.popupClassName
      } ${currentAlignClassName}`;
    },
    getPopupElement() {
      const { savePopupRef } = this;
      const { $props: props, $attrs, $slots, getTransitionName } = this;
      const { stretchChecked, targetHeight, targetWidth } = this.$data;
      const { style = {} } = $attrs;
      const onEvents = splitAttrs($attrs).onEvents;
      const {
        align,
        visible,
        prefixCls,
        animation,
        popupStyle,
        getClassNameFromAlign,
        destroyPopupOnHide,
        stretch,
      } = props;
      const className = this.getClassName(
        this.currentAlignClassName || getClassNameFromAlign(align),
      );
      // const hiddenClassName = `${prefixCls}-hidden`
      if (!visible) {
        this.currentAlignClassName = null;
      }
      const sizeStyle = {};
      if (stretch) {
        // Stretch with target
        if (stretch.indexOf('height') !== -1) {
          sizeStyle.height = typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight;
        } else if (stretch.indexOf('minHeight') !== -1) {
          sizeStyle.minHeight =
            typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight;
        }
        if (stretch.indexOf('width') !== -1) {
          sizeStyle.width = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth;
        } else if (stretch.indexOf('minWidth') !== -1) {
          sizeStyle.minWidth = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth;
        }
        // Delay force align to makes ui smooth
        if (!stretchChecked) {
          // sizeStyle.visibility = 'hidden'
          setTimeout(() => {
            if (this.alignInstance) {
              this.alignInstance.forceAlign();
            }
          }, 0);
        }
      }
      const popupInnerProps = {
        prefixCls,
        visible,
        // hiddenClassName,
        class: className,
        ...onEvents,
        ref: savePopupRef,
        style: { ...sizeStyle, ...popupStyle, ...style, ...this.getZIndexStyle() },
      };
      let transitionProps = {
        appear: true,
        css: false,
      };
      const transitionName = getTransitionName();
      let useTransition = !!transitionName;
      const transitionEvent = {
        onBeforeEnter: () => {
          // el.style.display = el.__vOriginalDisplay
          // this.alignInstance.forceAlign();
        },
        onEnter: (el, done) => {
          // render 后 vue 会移除通过animate动态添加的 class导致动画闪动，延迟两帧添加动画class，可以进一步定位或者重写 transition 组件
          this.$nextTick(() => {
            if (this.alignInstance) {
              this.alignInstance.$nextTick(() => {
                this.domEl = el;
                animate(el, `${transitionName}-enter`, done);
              });
            } else {
              done();
            }
          });
        },
        onBeforeLeave: () => {
          this.domEl = null;
        },
        onLeave: (el, done) => {
          animate(el, `${transitionName}-leave`, done);
        },
      };
      transitionProps = { ...transitionProps, ...transitionEvent };
      if (typeof animation === 'object') {
        useTransition = true;
        transitionProps = { ...transitionProps, ...animation };
      }
      if (!useTransition) {
        transitionProps = {};
      }
      if (destroyPopupOnHide) {
        return (
          <Transition {...transitionProps}>
            {visible ? (
              <Align
                target={this.getAlignTarget()}
                key="popup"
                ref={this.saveAlignRef}
                monitorWindowResize
                align={align}
                onAlign={this.onAlign}
              >
                <PopupInner {...popupInnerProps}>{$slots.default && $slots.default()}</PopupInner>
              </Align>
            ) : null}
          </Transition>
        );
      }
      return (
        <Transition {...transitionProps}>
          <Align
            v-show={visible}
            target={this.getAlignTarget()}
            key="popup"
            ref={this.saveAlignRef}
            monitorWindowResize
            disabled={!visible}
            align={align}
            onAlign={this.onAlign}
          >
            <PopupInner {...popupInnerProps}>{$slots.default?.()}</PopupInner>
          </Align>
        </Transition>
      );
    },

    getZIndexStyle() {
      const style = {};
      const props = this.$props;
      if (props.zIndex !== undefined) {
        style.zIndex = props.zIndex;
      }
      return style;
    },

    getMaskElement() {
      const props = this.$props;
      let maskElement = null;
      if (props.mask) {
        const maskTransition = this.getMaskTransitionName();
        maskElement = (
          <LazyRenderBox
            v-show={props.visible}
            style={this.getZIndexStyle()}
            key="mask"
            class={`${props.prefixCls}-mask`}
            visible={props.visible}
          />
        );
        if (maskTransition) {
          maskElement = (
            <Transition appear name={maskTransition}>
              {maskElement}
            </Transition>
          );
        }
      }
      return maskElement;
    },
  },

  render() {
    const { getMaskElement, getPopupElement } = this;
    return (
      <div>
        {getMaskElement()}
        {getPopupElement()}
      </div>
    );
  },
};
