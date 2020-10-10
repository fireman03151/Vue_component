/**
 * Cursor rule:
 * 1. Only `showSearch` enabled
 * 2. Only `open` is `true`
 * 3. When typing, set `open` to `true` which hit rule of 2
 *
 * Accessibility:
 * - https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html
 */

import KeyCode from '../../_util/KeyCode';
import MultipleSelector from './MultipleSelector';
import SingleSelector from './SingleSelector';
import { LabelValueType, RawValueType, CustomTagProps } from '../interface/generator';
import { RenderNode, Mode } from '../interface';
import useLock from '../hooks/useLock';
import { defineComponent, VNode, VNodeChild } from 'vue';
import createRef, { RefObject } from '../../_util/createRef';
import PropTypes from '../../_util/vue-types copy';

export interface InnerSelectorProps {
  prefixCls: string;
  id: string;
  mode: Mode;
  inputRef: RefObject;
  placeholder?: VNodeChild;
  disabled?: boolean;
  autofocus?: boolean;
  autocomplete?: string;
  values: LabelValueType[];
  showSearch?: boolean;
  searchValue: string;
  accessibilityIndex: number;
  open: boolean;
  tabindex?: number;
  onInputKeyDown: EventHandlerNonNull;
  onInputMouseDown: EventHandlerNonNull;
  onInputChange: EventHandlerNonNull;
  onInputPaste: EventHandlerNonNull;
  onInputCompositionStart: EventHandlerNonNull;
  onInputCompositionEnd: EventHandlerNonNull;
}

export interface SelectorProps {
  id: string;
  prefixCls: string;
  showSearch?: boolean;
  open: boolean;
  /** Display in the Selector value, it's not same as `value` prop */
  values: LabelValueType[];
  multiple: boolean;
  mode: Mode;
  searchValue: string;
  activeValue: string;
  inputElement: JSX.Element;

  autofocus?: boolean;
  accessibilityIndex: number;
  tabindex?: number;
  disabled?: boolean;
  placeholder?: VNodeChild;
  removeIcon?: RenderNode;

  // Tags
  maxTagCount?: number;
  maxTagTextLength?: number;
  maxTagPlaceholder?: VNodeChild;
  tagRender?: (props: CustomTagProps) => VNodeChild;

  /** Check if `tokenSeparators` contains `\n` or `\r\n` */
  tokenWithEnter?: boolean;

  // Motion
  choiceTransitionName?: string;

  onToggleOpen: (open?: boolean) => void;
  /** `onSearch` returns go next step boolean to check if need do toggle open */
  onSearch: (searchText: string, fromTyping: boolean, isCompositing: boolean) => boolean;
  onSearchSubmit: (searchText: string) => void;
  onSelect: (value: RawValueType, option: { selected: boolean }) => void;
  onInputKeyDown?: EventHandlerNonNull;

  /**
   * @private get real dom for trigger align.
   * This may be removed after React provides replacement of `findDOMNode`
   */
  domRef: () => HTMLDivElement;
}

const Selector = defineComponent<SelectorProps>({
  name: 'Selector',
  setup(props) {
    const inputRef = createRef();
    let compositionStatus = false;

    // ====================== Input ======================
    const [getInputMouseDown, setInputMouseDown] = useLock(0);

    const onInternalInputKeyDown = (event: KeyboardEvent) => {
      const { which } = event;

      if (which === KeyCode.UP || which === KeyCode.DOWN) {
        event.preventDefault();
      }

      if (props.onInputKeyDown) {
        props.onInputKeyDown(event);
      }

      if (which === KeyCode.ENTER && props.mode === 'tags' && !compositionStatus && !props.open) {
        // When menu isn't open, OptionList won't trigger a value change
        // So when enter is pressed, the tag's input value should be emitted here to let selector know
        props.onSearchSubmit((event.target as HTMLInputElement).value);
      }

      if (![KeyCode.SHIFT, KeyCode.TAB, KeyCode.BACKSPACE, KeyCode.ESC].includes(which)) {
        props.onToggleOpen(true);
      }
    };

    /**
     * We can not use `findDOMNode` sine it will get warning,
     * have to use timer to check if is input element.
     */
    const onInternalInputMouseDown = () => {
      setInputMouseDown(true);
    };

    // When paste come, ignore next onChange
    let pastedText = null;

    const triggerOnSearch = (value: string) => {
      if (props.onSearch(value, true, compositionStatus) !== false) {
        props.onToggleOpen(true);
      }
    };

    const onInputCompositionStart = () => {
      compositionStatus = true;
    };

    const onInputCompositionEnd = () => {
      compositionStatus = false;
    };

    const onInputChange = (event: { target: { value: any } }) => {
      let {
        target: { value },
      } = event;

      // Pasted text should replace back to origin content
      if (props.tokenWithEnter && pastedText && /[\r\n]/.test(pastedText)) {
        // CRLF will be treated as a single space for input element
        const replacedText = pastedText.replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
        value = value.replace(replacedText, pastedText);
      }

      pastedText = null;

      triggerOnSearch(value);
    };

    const onInputPaste = (e: ClipboardEvent) => {
      const { clipboardData } = e;
      const value = clipboardData.getData('text');

      pastedText = value;
    };

    const onClick = ({ target }) => {
      if (target !== inputRef.current) {
        // Should focus input if click the selector
        const isIE = (document.body.style as any).msTouchAction !== undefined;
        if (isIE) {
          setTimeout(() => {
            inputRef.current.focus();
          });
        } else {
          inputRef.current.focus();
        }
      }
    };

    const onMousedown = (event: MouseEvent) => {
      const inputMouseDown = getInputMouseDown();
      if (event.target !== inputRef.current && !inputMouseDown) {
        event.preventDefault();
      }

      if ((props.mode !== 'combobox' && (!props.showSearch || !inputMouseDown)) || !props.open) {
        if (props.open) {
          props.onSearch('', true, false);
        }
        props.onToggleOpen();
      }
    };

    return {
      focus: () => {
        inputRef.current.focus();
      },
      blur: () => {
        inputRef.current.blur();
      },
      onMousedown,
      onClick,
      onInputPaste,
      inputRef,
      onInternalInputKeyDown,
      onInternalInputMouseDown,
      onInputChange,
      onInputCompositionEnd,
      onInputCompositionStart,
    };
  },
  render() {
    const { prefixCls, domRef, multiple } = this.$props as SelectorProps;
    const {
      onMousedown,
      onClick,
      inputRef,
      onInputPaste,
      onInternalInputKeyDown,
      onInternalInputMouseDown,
      onInputChange,
      onInputCompositionStart,
      onInputCompositionEnd,
    } = this as any;
    const sharedProps = {
      inputRef,
      onInputKeyDown: onInternalInputKeyDown,
      onInputMouseDown: onInternalInputMouseDown,
      onInputChange,
      onInputPaste,
      onInputCompositionStart,
      onInputCompositionEnd,
    };
    const selectNode = multiple ? (
      <MultipleSelector {...this.$props} {...sharedProps} />
    ) : (
      <SingleSelector {...this.$props} {...sharedProps} />
    );
    return (
      <div ref={domRef} class={`${prefixCls}-selector`} onClick={onClick} onMousedown={onMousedown}>
        {selectNode}
      </div>
    );
  },
});

Selector.inheritAttrs = false;
Selector.props = {
  id: PropTypes.string,
  prefixCls: PropTypes.string,
  showSearch: { type: Boolean, default: undefined },
  open: { type: Boolean, default: undefined },
  /** Display in the Selector value, it's not same as `value` prop */
  values: PropTypes.array,
  multiple: { type: Boolean, default: undefined },
  mode: PropTypes.string,
  searchValue: PropTypes.string,
  activeValue: PropTypes.string,
  inputElement: PropTypes.any,

  autofocus: { type: Boolean, default: undefined },
  accessibilityIndex: PropTypes.number,
  tabindex: PropTypes.number,
  disabled: { type: Boolean, default: undefined },
  placeholder: PropTypes.any,
  removeIcon: PropTypes.any,

  // Tags
  maxTagCount: PropTypes.number,
  maxTagTextLength: PropTypes.number,
  maxTagPlaceholder: PropTypes.any,
  tagRender: PropTypes.func,

  /** Check if `tokenSeparators` contains `\n` or `\r\n` */
  tokenWithEnter: { type: Boolean, default: undefined },

  // Motion
  choiceTransitionName: PropTypes.string,

  onToggleOpen: PropTypes.func,
  /** `onSearch` returns go next step boolean to check if need do toggle open */
  onSearch: PropTypes.func,
  onSearchSubmit: PropTypes.func,
  onSelect: PropTypes.func,
  onInputKeyDown: PropTypes.func,

  /**
   * @private get real dom for trigger align.
   * This may be removed after React provides replacement of `findDOMNode`
   */
  domRef: PropTypes.func,
};

export default Selector;
