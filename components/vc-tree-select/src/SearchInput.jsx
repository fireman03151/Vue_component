/**
 * Since search box is in different position with different mode.
 * - Single: in the popup box
 * - multiple: in the selector
 * Move the code as a SearchInput for easy management.
 */
import { inject, withDirectives, ref, onMounted, computed, watch } from 'vue';
import antInput from '../../_util/antInputDirective';
import PropTypes from '../../_util/vue-types';
import { createRef } from './util';

const SearchInput = {
  name: 'SearchInput',
  inheritAttrs: false,
  props: {
    open: PropTypes.looseBool,
    searchValue: PropTypes.string,
    prefixCls: PropTypes.string,
    disabled: PropTypes.looseBool,
    renderPlaceholder: PropTypes.func,
    needAlign: PropTypes.looseBool,
    ariaId: PropTypes.string,
    isMultiple: PropTypes.looseBool.def(true),
  },
  setup(props) {
    const measureRef = ref();
    const inputWidth = ref(0);
    // We measure width and set to the input immediately
    onMounted(() => {
      if(props.isMultiple) {
        watch(
          computed(()=>props.searchValue),
          () => {
            inputWidth.value = measureRef.value.scrollWidth;
          },
          { flush: 'post', immediate: true },
        );
      }

    });
    return {
      measureRef,
      inputWidth,
      vcTreeSelect: inject('vcTreeSelect', {}),
    };
  },
  data() {
    return {
      mirrorSearchValue: this.searchValue,
    };
  },
  watch: {
    searchValue(val) {
      this.mirrorSearchValue = val;
    },
  },
  created() {
    this.inputRef = createRef();
    this.prevProps = { ...this.$props };
  },
  mounted() {
    this.$nextTick(() => {
      const { open } = this.$props;

      if (open) {
        this.focus(true);
      }
    });
  },

  updated() {
    const { open } = this.$props;
    const { prevProps } = this;
    this.$nextTick(() => {
      if (open && prevProps.open !== open) {
        this.focus();
      }

      this.prevProps = { ...this.$props };
    });
  },
  methods: {

    /**
     * Need additional timeout for focus cause parent dom is not ready when didMount trigger
     */
    focus(isDidMount) {
      if (this.inputRef.current) {
        if (isDidMount) {
          setTimeout(() => {
            this.inputRef.current.focus();
          }, 0);
        } else {
          // set it into else, Avoid scrolling when focus
          this.inputRef.current.focus();
        }
      }
    },

    blur() {
      if (this.inputRef.current) {
        this.inputRef.current.blur();
      }
    },
    handleInputChange(e) {
      const { value, composing } = e.target;
      const { searchValue = '' } = this;
      if (e.isComposing || composing || searchValue === value) {
        this.mirrorSearchValue = value;
        return;
      }
      this.vcTreeSelect.onSearchInputChange(e);
    },
  },

  render() {
    const { searchValue, prefixCls, disabled, renderPlaceholder, open, ariaId, isMultiple } = this.$props;
    const {
      vcTreeSelect: { onSearchInputKeyDown },
      handleInputChange,
      mirrorSearchValue,
      inputWidth,
    } = this;
    return (
      <>
        <span class={`${prefixCls}-selection-search`} style={isMultiple ? { width: inputWidth + 'px' }:{}}>
          {withDirectives(
            <input
              type="text"
              ref={this.inputRef}
              onInput={handleInputChange}
              onChange={handleInputChange}
              onKeydown={onSearchInputKeyDown}
              value={searchValue}
              disabled={disabled}
              class={`${prefixCls}-selection-search-input`}
              aria-label="filter select"
              aria-autocomplete="list"
              aria-controls={open ? ariaId : undefined}
              aria-multiline="false"
            />,
            [[antInput]],
          )}
          {isMultiple ? <span ref="measureRef" class={`${prefixCls}-selection-search-mirror`} aria-hidden>
            {mirrorSearchValue}&nbsp;
          </span> : null}
        </span>
        {renderPlaceholder && !mirrorSearchValue ? renderPlaceholder() : null}
      </>
    );
  },
};

export default SearchInput;
