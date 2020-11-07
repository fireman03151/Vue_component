import { defineComponent, PropType, reactive } from 'vue';
import classNames from '../_util/classNames';
import createRef from '../_util/createRef';
import raf from '../_util/raf';
import PropTypes from '../_util/vue-types';

const MIN_SIZE = 20;

interface ScrollBarState {
  dragging: boolean;
  pageY: number | null;
  startTop: number | null;
  visible: boolean;
}

function getPageY(e: MouseEvent | TouchEvent) {
  return 'touches' in e ? e.touches[0].pageY : e.pageY;
}

export default defineComponent({
  name: 'ScrollBar',
  inheritAttrs: false,
  props: {
    prefixCls: PropTypes.string,
    scrollTop: PropTypes.number,
    scrollHeight: PropTypes.number,
    height: PropTypes.number,
    count: PropTypes.number,
    onScroll: {
      type: Function as PropType<(scrollTop: number) => void>,
    },
    onStartMove: {
      type: Function as PropType<() => void>,
    },
    onStopMove: {
      type: Function as PropType<() => void>,
    },
  },
  setup() {
    return {
      moveRaf: null,
      scrollbarRef: createRef(),
      thumbRef: createRef(),
      visibleTimeout: null,
      state: reactive<ScrollBarState>({
        dragging: false,
        pageY: null,
        startTop: null,
        visible: false,
      }),
    };
  },
  watch: {
    scrollTop: {
      handler() {
        this.delayHidden();
      },
      flush: 'post',
    },
  },

  mounted() {
    this.scrollbarRef.current.addEventListener('touchstart', this.onScrollbarTouchStart);
    this.thumbRef.current.addEventListener('touchstart', this.onMouseDown);
  },

  beforeUnmount() {
    this.removeEvents();
    clearTimeout(this.visibleTimeout);
  },
  methods: {
    delayHidden() {
      clearTimeout(this.visibleTimeout);
      this.state.visible = true;

      this.visibleTimeout = setTimeout(() => {
        this.state.visible = false;
      }, 2000);
    },

    onScrollbarTouchStart(e: TouchEvent) {
      e.preventDefault();
    },

    onContainerMouseDown(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();
    },

    // ======================= Clean =======================
    patchEvents() {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);

      this.thumbRef.current.addEventListener('touchmove', this.onMouseMove);
      this.thumbRef.current.addEventListener('touchend', this.onMouseUp);
    },

    removeEvents() {
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);

      this.scrollbarRef.current.removeEventListener('touchstart', this.onScrollbarTouchStart);
      this.thumbRef.current.removeEventListener('touchstart', this.onMouseDown);
      this.thumbRef.current.removeEventListener('touchmove', this.onMouseMove);
      this.thumbRef.current.removeEventListener('touchend', this.onMouseUp);

      raf.cancel(this.moveRaf);
    },

    // ======================= Thumb =======================
    onMouseDown(e: MouseEvent | TouchEvent) {
      const { onStartMove } = this.$props;

      Object.assign(this.state, {
        dragging: true,
        pageY: getPageY(e),
        startTop: this.getTop(),
      });

      onStartMove();
      this.patchEvents();
      e.stopPropagation();
      e.preventDefault();
    },

    onMouseMove(e: MouseEvent | TouchEvent) {
      const { dragging, pageY, startTop } = this.state;
      const { onScroll } = this.$props;

      raf.cancel(this.moveRaf);

      if (dragging) {
        const offsetY = getPageY(e) - pageY;
        const newTop = startTop + offsetY;

        const enableScrollRange = this.getEnableScrollRange();
        const enableHeightRange = this.getEnableHeightRange();

        const ptg = enableHeightRange ? newTop / enableHeightRange : 0;
        const newScrollTop = Math.ceil(ptg * enableScrollRange);
        this.moveRaf = raf(() => {
          onScroll(newScrollTop);
        });
      }
    },

    onMouseUp() {
      const { onStopMove } = this.$props;
      this.state.dragging = false;

      onStopMove();
      this.removeEvents();
    },

    // ===================== Calculate =====================
    getSpinHeight() {
      const { height, count } = this.$props;
      let baseHeight = (height / count) * 10;
      baseHeight = Math.max(baseHeight, MIN_SIZE);
      baseHeight = Math.min(baseHeight, height / 2);
      return Math.floor(baseHeight);
    },

    getEnableScrollRange() {
      const { scrollHeight, height } = this.$props;
      return scrollHeight - height || 0;
    },

    getEnableHeightRange() {
      const { height } = this.$props;
      const spinHeight = this.getSpinHeight();
      return height - spinHeight || 0;
    },

    getTop() {
      const { scrollTop } = this.$props;
      const enableScrollRange = this.getEnableScrollRange();
      const enableHeightRange = this.getEnableHeightRange();
      if (scrollTop === 0 || enableScrollRange === 0) {
        return 0;
      }
      const ptg = scrollTop / enableScrollRange;
      return ptg * enableHeightRange;
    },
    // Not show scrollbar when height is large thane scrollHeight
    getVisible() {
      const { visible } = this.state;
      const { height, scrollHeight } = this.$props;

      if (height >= scrollHeight) {
        return false;
      }

      return visible;
    },
  },

  render() {
    // eslint-disable-next-line no-unused-vars
    const { dragging } = this.state;
    const { prefixCls } = this.$props;
    const spinHeight = this.getSpinHeight() + 'px';
    const top = this.getTop() + 'px';
    const visible = this.getVisible();
    return (
      <div
        ref={this.scrollbarRef}
        class={`${prefixCls}-scrollbar`}
        style={{
          width: '8px',
          top: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: visible ? undefined : 'none',
        }}
        onMousedown={this.onContainerMouseDown}
        onMousemove={this.delayHidden}
      >
        <div
          ref={this.thumbRef}
          class={classNames(`${prefixCls}-scrollbar-thumb`, {
            [`${prefixCls}-scrollbar-thumb-moving`]: dragging,
          })}
          style={{
            width: '100%',
            height: spinHeight,
            top,
            left: 0,
            position: 'absolute',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '99px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onMousedown={this.onMouseDown}
        />
      </div>
    );
  },
});
