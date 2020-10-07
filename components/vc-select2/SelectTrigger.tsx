import Trigger from '../vc-trigger';
import PropTypes from '../_util/vue-types';
import { getSlot } from '../_util/props-util';
import classNames from '../_util/classNames';
import createRef from '../_util/createRef';
import { CSSProperties, defineComponent, VNodeChild } from 'vue';
import { RenderDOMFunc } from './interface';

const getBuiltInPlacements = (dropdownMatchSelectWidth: number | boolean) => {
  // Enable horizontal overflow auto-adjustment when a custom dropdown width is provided
  const adjustX = typeof dropdownMatchSelectWidth !== 'number' ? 0 : 1;

  return {
    bottomLeft: {
      points: ['tl', 'bl'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
    },
    bottomRight: {
      points: ['tr', 'br'],
      offset: [0, 4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
    },
    topLeft: {
      points: ['bl', 'tl'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
    },
    topRight: {
      points: ['br', 'tr'],
      offset: [0, -4],
      overflow: {
        adjustX,
        adjustY: 1,
      },
    },
  };
};
export interface SelectTriggerProps {
  prefixCls: string;
  disabled: boolean;
  visible: boolean;
  popupElement: VNodeChild | JSX.Element;
  animation?: string;
  transitionName?: string;
  containerWidth: number;
  dropdownStyle: CSSProperties;
  dropdownClassName: string;
  direction: string;
  dropdownMatchSelectWidth?: boolean | number;
  dropdownRender?: (menu: VNodeChild) => VNodeChild;
  getPopupContainer?: RenderDOMFunc;
  dropdownAlign: object;
  empty: boolean;
  getTriggerDOMNode: () => any;
}
const SelectTrigger = defineComponent<SelectTriggerProps>({
  name: 'SelectTrigger',
  inheritAttrs: false,
  created() {
    this.popupRef = createRef();
  },

  methods: {
    getDropdownTransitionName() {
      const props = this.$props;
      let transitionName = props.transitionName;
      if (!transitionName && props.animation) {
        transitionName = `${this.getDropdownPrefixCls()}-${props.animation}`;
      }
      return transitionName;
    },
    getPopupElement() {
      return this.popupRef.current;
    },
  },

  render() {
    const { empty = false, ...props } = { ...this.$props, ...this.$attrs };
    const {
      visible,
      dropdownAlign,
      prefixCls,
      popupElement,
      dropdownClassName,
      dropdownStyle,
      dropdownMatchSelectWidth,
      containerWidth,
      dropdownRender,
    } = props;
    const dropdownPrefixCls = `${prefixCls}-dropdown`;

    let popupNode = popupElement;
    if (dropdownRender) {
      popupNode = dropdownRender({ menuNode: popupElement, props });
    }

    const builtInPlacements = getBuiltInPlacements(dropdownMatchSelectWidth);
    const popupStyle = { minWidth: containerWidth, ...dropdownStyle };

    if (typeof dropdownMatchSelectWidth === 'number') {
      popupStyle.width = `${dropdownMatchSelectWidth}px`;
    } else if (dropdownMatchSelectWidth) {
      popupStyle.width = `${containerWidth}px`;
    }
    return (
      <Trigger
        {...props}
        showAction={[]}
        hideAction={[]}
        popupPlacement={this.direction === 'rtl' ? 'bottomRight' : 'bottomLeft'}
        builtinPlacements={builtInPlacements}
        prefixCls={dropdownPrefixCls}
        popupTransitionName={this.getDropdownTransitionName()}
        onPopupVisibleChange={props.onDropdownVisibleChange}
        popup={<div ref={this.popupRef}>{popupNode}</div>}
        popupAlign={dropdownAlign}
        popupVisible={visible}
        getPopupContainer={props.getPopupContainer}
        popupClassName={classNames(dropdownClassName, {
          [`${dropdownPrefixCls}-empty`]: empty,
        })}
        popupStyle={popupStyle}
        getTriggerDOMNode={this.getTriggerDOMNode}
      >
        {getSlot(this)[0]}
      </Trigger>
    );
  },
});
SelectTrigger.props = {
  dropdownAlign: PropTypes.object,
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  dropdownClassName: PropTypes.string,
  dropdownStyle: PropTypes.object,
  empty: PropTypes.bool,
  prefixCls: PropTypes.string,
  popupClassName: PropTypes.string,
  animation: PropTypes.string,
  transitionName: PropTypes.string,
  getPopupContainer: PropTypes.func,
  dropdownRender: PropTypes.func,
  containerWidth: PropTypes.number,
  dropdownMatchSelectWidth: PropTypes.oneOfType([Number, Boolean]).def(true),
  popupElement: PropTypes.any,
  direction: PropTypes.string,
  getTriggerDOMNode: PropTypes.func,
};
export default SelectTrigger;
