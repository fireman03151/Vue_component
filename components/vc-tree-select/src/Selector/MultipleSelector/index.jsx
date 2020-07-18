import { inject, TransitionGroup } from 'vue';
import PropTypes from '../../../../_util/vue-types';
import { createRef } from '../../util';
import generateSelector, { selectorPropTypes } from '../../Base/BaseSelector';
import SearchInput from '../../SearchInput';
import Selection from './Selection';
import { getComponent, getSlot } from '../../../../_util/props-util';
import getTransitionProps from '../../../../_util/getTransitionProps';
import BaseMixin from '../../../../_util/BaseMixin';
const TREE_SELECT_EMPTY_VALUE_KEY = 'RC_TREE_SELECT_EMPTY_VALUE_KEY';

const Selector = generateSelector('multiple');

// export const multipleSelectorContextTypes = {
//   onMultipleSelectorRemove: PropTypes.func.isRequired,
// }

const MultipleSelector = {
  name: 'MultipleSelector',
  mixins: [BaseMixin],
  inheritAttrs: false,
  props: {
    ...selectorPropTypes(),
    ...SearchInput.props,
    selectorValueList: PropTypes.array,
    disabled: PropTypes.bool,
    searchValue: PropTypes.string,
    labelInValue: PropTypes.bool,
    maxTagCount: PropTypes.number,
    maxTagPlaceholder: PropTypes.any,

    // onChoiceAnimationLeave: PropTypes.func,
  },
  setup() {
    return {
      vcTreeSelect: inject('vcTreeSelect', {}),
    };
  },
  created() {
    this.inputRef = createRef();
  },
  methods: {
    onPlaceholderClick() {
      this.inputRef.current.focus();
    },

    focus() {
      this.inputRef.current.focus();
    },
    blur() {
      this.inputRef.current.blur();
    },

    _renderPlaceholder() {
      const {
        prefixCls,
        placeholder,
        searchPlaceholder,
        searchValue,
        selectorValueList,
      } = this.$props;

      const currentPlaceholder = placeholder || searchPlaceholder;

      if (!currentPlaceholder) return null;

      const hidden = searchValue || selectorValueList.length;

      // [Legacy] Not remove the placeholder
      return (
        <span
          style={{
            display: hidden ? 'none' : 'block',
          }}
          onClick={this.onPlaceholderClick}
          class={`${prefixCls}-search__field__placeholder`}
        >
          {currentPlaceholder}
        </span>
      );
    },
    onChoiceAnimationLeave(...args) {
      this.__emit('choiceAnimationLeave', ...args);
    },
    renderSelection() {
      const {
        selectorValueList,
        choiceTransitionName,
        prefixCls,
        labelInValue,
        maxTagCount,
      } = this.$props;
      const children = getSlot(this);
      const {
        vcTreeSelect: { onMultipleSelectorRemove },
      } = this;
      // Check if `maxTagCount` is set
      let myValueList = selectorValueList;
      if (maxTagCount >= 0) {
        myValueList = selectorValueList.slice(0, maxTagCount);
      }
      // Selector node list
      const selectedValueNodes = myValueList.map(({ label, value }) => (
        <Selection
          {...{
            ...this.$props,
            label,
            value,
            onRemove: onMultipleSelectorRemove,
          }}
          key={value || TREE_SELECT_EMPTY_VALUE_KEY}
        >
          {children}
        </Selection>
      ));

      // Rest node count
      if (maxTagCount >= 0 && maxTagCount < selectorValueList.length) {
        let content = `+ ${selectorValueList.length - maxTagCount} ...`;
        const maxTagPlaceholder = getComponent(this, 'maxTagPlaceholder', {}, false);
        if (typeof maxTagPlaceholder === 'string') {
          content = maxTagPlaceholder;
        } else if (typeof maxTagPlaceholder === 'function') {
          const restValueList = selectorValueList.slice(maxTagCount);
          content = maxTagPlaceholder(
            labelInValue ? restValueList : restValueList.map(({ value }) => value),
          );
        }

        const restNodeSelect = (
          <Selection
            {...{
              ...this.$props,
              label: content,
              value: null,
            }}
            key="rc-tree-select-internal-max-tag-counter"
          >
            {children}
          </Selection>
        );

        selectedValueNodes.push(restNodeSelect);
      }

      selectedValueNodes.push(
        <li class={`${prefixCls}-search ${prefixCls}-search--inline`} key="__input">
          <SearchInput
            {...{
              ...this.$props,
              ...this.$attrs,
              needAlign: true,
            }}
            ref={this.inputRef}
          >
            {children}
          </SearchInput>
        </li>,
      );
      const className = `${prefixCls}-selection__rendered`;
      if (choiceTransitionName) {
        const transitionProps = getTransitionProps(choiceTransitionName, {
          tag: 'ul',
          onAfterLeave: this.onChoiceAnimationLeave,
        });
        return (
          <TransitionGroup class={className} {...transitionProps}>
            {selectedValueNodes}
          </TransitionGroup>
        );
      }
      return (
        <ul class={className} role="menubar">
          {selectedValueNodes}
        </ul>
      );
    },
  },

  render() {
    return (
      <Selector
        {...{
          ...this.$props,
          ...this.$attrs,
          tabindex: -1,
          showArrow: false,
          renderSelection: this.renderSelection,
          renderPlaceholder: this._renderPlaceholder,
        }}
      >
        {getSlot(this)}
      </Selector>
    );
  },
};

export default MultipleSelector;
