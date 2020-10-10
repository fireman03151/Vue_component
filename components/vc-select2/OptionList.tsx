import TransBtn from './TransBtn';
import PropTypes from '../_util/vue-types';
import KeyCode from '../_util/KeyCode';
import classNames from '../_util/classNames';
import pickAttrs from '../_util/pickAttrs';
import { isValidElement } from '../_util/props-util';
import createRef from '../_util/createRef';
import { computed, defineComponent, reactive, VNodeChild, watch } from 'vue';
import List from '../vc-virtual-list/List';
import {
  OptionsType as SelectOptionsType,
  OptionData,
  RenderNode,
  OnActiveValue,
} from './interface';
import { RawValueType, FlattenOptionsType } from './interface/generator';
export interface OptionListProps {
  prefixCls: string;
  id: string;
  options: SelectOptionsType;
  flattenOptions: FlattenOptionsType<SelectOptionsType>;
  height: number;
  itemHeight: number;
  values: Set<RawValueType>;
  multiple: boolean;
  open: boolean;
  defaultActiveFirstOption?: boolean;
  notFoundContent?: VNodeChild;
  menuItemSelectedIcon?: RenderNode;
  childrenAsData: boolean;
  searchValue: string;
  virtual: boolean;

  onSelect: (value: RawValueType, option: { selected: boolean }) => void;
  onToggleOpen: (open?: boolean) => void;
  /** Tell Select that some value is now active to make accessibility work */
  onActiveValue: OnActiveValue;
  onScroll: EventHandlerNonNull;

  /** Tell Select that mouse enter the popup to force re-render */
  onMouseenter?: EventHandlerNonNull;
}

const OptionListProps = {
  prefixCls: PropTypes.string,
  id: PropTypes.string,
  options: PropTypes.array,
  flattenOptions: PropTypes.array,
  height: PropTypes.number,
  itemHeight: PropTypes.number,
  values: PropTypes.any,
  multiple: { type: Boolean, default: undefined },
  open: { type: Boolean, default: undefined },
  defaultActiveFirstOption: { type: Boolean, default: undefined },
  notFoundContent: PropTypes.any,
  menuItemSelectedIcon: PropTypes.any,
  childrenAsData: { type: Boolean, default: undefined },
  searchValue: PropTypes.string,
  virtual: { type: Boolean, default: undefined },

  onSelect: PropTypes.func,
  onToggleOpen: PropTypes.func,
  /** Tell Select that some value is now active to make accessibility work */
  onActiveValue: PropTypes.func,
  onScroll: PropTypes.func,

  /** Tell Select that mouse enter the popup to force re-render */
  onMouseenter: PropTypes.func,
};

/**
 * Using virtual list of option display.
 * Will fallback to dom if use customize render.
 */
const OptionList = defineComponent<OptionListProps, { state: any }>({
  name: 'OptionList',
  inheritAttrs: false,
  setup(props) {
    const itemPrefixCls = computed(() => `${props.prefixCls}-item`);

    // =========================== List ===========================
    const listRef = createRef();

    const onListMouseDown: EventHandlerNonNull = event => {
      event.preventDefault();
    };

    const scrollIntoView = (index: number) => {
      if (listRef.current) {
        listRef.current.scrollTo({ index });
      }
    };

    // ========================== Active ==========================
    const getEnabledActiveIndex = (index: number, offset = 1) => {
      const len = props.flattenOptions.length;

      for (let i = 0; i < len; i += 1) {
        const current = (index + i * offset + len) % len;

        const { group, data } = props.flattenOptions[current];
        if (!group && !(data as OptionData).disabled) {
          return current;
        }
      }

      return -1;
    };
    const state = reactive({
      activeIndex: getEnabledActiveIndex(0),
    });

    const setActive = (index: number, fromKeyboard = false) => {
      state.activeIndex = index;
      const info = { source: fromKeyboard ? ('keyboard' as const) : ('mouse' as const) };

      // Trigger active event
      const flattenItem = props.flattenOptions[index];
      if (!flattenItem) {
        props.onActiveValue(null, -1, info);
        return;
      }

      props.onActiveValue(flattenItem.data.value, index, info);
    };

    // Auto active first item when list length or searchValue changed

    watch(
      computed(() => [props.flattenOptions.length, props.searchValue]),
      () => {
        setActive(props.defaultActiveFirstOption !== false ? getEnabledActiveIndex(0) : -1);
      },
      { immediate: true },
    );
    // Auto scroll to item position in single mode

    let timeoutId: number;
    watch(
      computed(() => props.open),
      () => {
        /**
         * React will skip `onChange` when component update.
         * `setActive` function will call root accessibility state update which makes re-render.
         * So we need to delay to let Input component trigger onChange first.
         */
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!props.multiple && props.open && props.values.size === 1) {
            const value = Array.from(props.values)[0];
            const index = props.flattenOptions.findIndex(({ data }) => data.value === value);
            setActive(index);
            scrollIntoView(index);
          }
        });
      },
      { immediate: true, flush: 'post' },
    );

    // ========================== Values ==========================
    const onSelectValue = (value?: RawValueType) => {
      if (value !== undefined) {
        props.onSelect(value, { selected: !props.values.has(value) });
      }

      // Single mode should always close by select
      if (!props.multiple) {
        props.onToggleOpen(false);
      }
    };

    function renderItem(index: number) {
      const item = props.flattenOptions[index];
      if (!item) return null;

      const itemData = (item.data || {}) as OptionData;
      const { value, label, children } = itemData;
      const attrs = pickAttrs(itemData, true);
      const mergedLabel = props.childrenAsData ? children : label;
      return item ? (
        <div
          aria-label={typeof mergedLabel === 'string' ? mergedLabel : undefined}
          {...attrs}
          key={index}
          role="option"
          id={`${props.id}_list_${index}`}
          aria-selected={props.values.has(value)}
        >
          {value}
        </div>
      ) : null;
    }
    return {
      renderItem,
      listRef,
      state,
      onListMouseDown,
      itemPrefixCls,
      setActive,
      onSelectValue,
      onKeydown: (event: KeyboardEvent) => {
        const { which } = event;
        switch (which) {
          // >>> Arrow keys
          case KeyCode.UP:
          case KeyCode.DOWN: {
            let offset = 0;
            if (which === KeyCode.UP) {
              offset = -1;
            } else if (which === KeyCode.DOWN) {
              offset = 1;
            }

            if (offset !== 0) {
              const nextActiveIndex = getEnabledActiveIndex(state.activeIndex + offset, offset);
              scrollIntoView(nextActiveIndex);
              setActive(nextActiveIndex, true);
            }

            break;
          }

          // >>> Select
          case KeyCode.ENTER: {
            // value
            const item = props.flattenOptions[state.activeIndex];
            if (item && !item.data.disabled) {
              onSelectValue(item.data.value);
            } else {
              onSelectValue(undefined);
            }

            if (props.open) {
              event.preventDefault();
            }

            break;
          }

          // >>> Close
          case KeyCode.ESC: {
            props.onToggleOpen(false);
          }
        }
      },
      onKeyup: () => {},

      scrollTo: (index: number) => {
        scrollIntoView(index);
      },
    };
  },
  render() {
    const {
      renderItem,
      listRef,
      onListMouseDown,
      itemPrefixCls,
      setActive,
      onSelectValue,
    } = this as any;
    const {
      id,
      childrenAsData,
      values,
      height,
      itemHeight,
      flattenOptions,
      menuItemSelectedIcon,
      notFoundContent,
      virtual,
      onScroll,
      onMouseenter,
    } = this.$props as OptionListProps;
    const { activeIndex } = this.state;
    // ========================== Render ==========================
    if (flattenOptions.length === 0) {
      return (
        <div
          role="listbox"
          id={`${id}_list`}
          class={`${itemPrefixCls}-empty`}
          onMousedown={onListMouseDown}
        >
          {notFoundContent}
        </div>
      );
    }
    return (
      <>
        <div role="listbox" id={`${id}_list`} style={{ height: 0, width: 0, overflow: 'hidden' }}>
          {renderItem(activeIndex - 1)}
          {renderItem(activeIndex)}
          {renderItem(activeIndex + 1)}
        </div>
        <List
          itemKey="key"
          ref={listRef}
          data={flattenOptions}
          height={height}
          itemHeight={itemHeight}
          fullHeight={false}
          onMousedown={onListMouseDown}
          onScroll={onScroll}
          virtual={virtual}
          onMouseenter={onMouseenter}
          children={({ group, groupOption, data }, itemIndex) => {
            const { label, key } = data;

            // Group
            if (group) {
              return (
                <div class={classNames(itemPrefixCls, `${itemPrefixCls}-group`)}>
                  {label !== undefined ? label : key}
                </div>
              );
            }

            const {
              disabled,
              value,
              title,
              children,
              style,
              class: cls,
              className,
              ...otherProps
            } = data;

            // Option
            const selected = values.has(value);

            const optionPrefixCls = `${itemPrefixCls}-option`;
            const optionClassName = classNames(itemPrefixCls, optionPrefixCls, cls, className, {
              [`${optionPrefixCls}-grouped`]: groupOption,
              [`${optionPrefixCls}-active`]: activeIndex === itemIndex && !disabled,
              [`${optionPrefixCls}-disabled`]: disabled,
              [`${optionPrefixCls}-selected`]: selected,
            });

            const mergedLabel = childrenAsData ? children : label;

            const iconVisible =
              !menuItemSelectedIcon || typeof menuItemSelectedIcon === 'function' || selected;

            const content = mergedLabel || value;
            // https://github.com/ant-design/ant-design/issues/26717
            let optionTitle =
              typeof content === 'string' || typeof content === 'number'
                ? content.toString()
                : undefined;
            if (title !== undefined) {
              optionTitle = title;
            }

            return (
              <div
                {...otherProps}
                aria-selected={selected}
                class={optionClassName}
                title={optionTitle}
                onMousemove={() => {
                  if (activeIndex === itemIndex || disabled) {
                    return;
                  }
                  setActive(itemIndex);
                }}
                onClick={() => {
                  if (!disabled) {
                    onSelectValue(value);
                  }
                }}
                style={style}
              >
                <div class={`${optionPrefixCls}-content`}>{content}</div>
                {isValidElement(menuItemSelectedIcon) || selected}
                {iconVisible && (
                  <TransBtn
                    class={`${itemPrefixCls}-option-state`}
                    customizeIcon={menuItemSelectedIcon}
                    customizeIconProps={{ isSelected: selected }}
                  >
                    {selected ? '✓' : null}
                  </TransBtn>
                )}
              </div>
            );
          }}
        ></List>
      </>
    );
  },
});

OptionList.props = OptionListProps;

export default OptionList;
