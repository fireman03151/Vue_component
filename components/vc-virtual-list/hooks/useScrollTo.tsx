import { Data } from '../../_util/type';
import { Ref } from 'vue';
import raf from '../../_util/raf';
import { GetKey } from '../interface';
import { ListState } from '../List';

export default function useScrollTo(
  containerRef: Ref<Element | undefined>,
  state: ListState,
  heights: Data,
  props,
  getKey: GetKey,
  collectHeight: () => void,
  syncScrollTop: (newTop: number) => void,
) {
  let scroll: number | null = null;

  return arg => {
    raf.cancel(scroll!);
    const data = state.mergedData;
    const itemHeight = props.itemHeight;
    if (typeof arg === 'number') {
      syncScrollTop(arg);
    } else if (arg && typeof arg === 'object') {
      let index: number;
      const { align } = arg;

      if ('index' in arg) {
        ({ index } = arg);
      } else {
        index = data.findIndex((item: object) => getKey(item) === arg.key);
      }

      const { offset = 0 } = arg;

      // We will retry 3 times in case dynamic height shaking
      const syncScroll = (times: number, targetAlign?: 'top' | 'bottom') => {
        if (times < 0 || !containerRef.value) return;

        const height = containerRef.value.clientHeight;
        let needCollectHeight = false;
        let newTargetAlign = targetAlign;

        // Go to next frame if height not exist
        if (height) {
          const mergedAlign = targetAlign || align;

          // Get top & bottom
          let stackTop = 0;
          let itemTop = 0;
          let itemBottom = 0;

          for (let i = 0; i <= index; i += 1) {
            const key = getKey(data[i]);
            itemTop = stackTop;
            const cacheHeight = heights[key!];
            itemBottom = itemTop + (cacheHeight === undefined ? itemHeight : cacheHeight);

            stackTop = itemBottom;

            if (i === index && cacheHeight === undefined) {
              needCollectHeight = true;
            }
          }

          // Scroll to
          let targetTop: number | null = null;

          switch (mergedAlign) {
            case 'top':
              targetTop = itemTop - offset;
              break;
            case 'bottom':
              targetTop = itemBottom - height + offset;
              break;

            default: {
              const { scrollTop } = containerRef.value;
              const scrollBottom = scrollTop + height;
              if (itemTop < scrollTop) {
                newTargetAlign = 'top';
              } else if (itemBottom > scrollBottom) {
                newTargetAlign = 'bottom';
              }
            }
          }

          if (targetTop !== null && targetTop !== containerRef.value.scrollTop) {
            syncScrollTop(targetTop);
          }
        }

        // We will retry since element may not sync height as it described
        scroll = raf(() => {
          if (needCollectHeight) {
            collectHeight();
          }
          syncScroll(times - 1, newTargetAlign);
        });
      };

      syncScroll(3);
    }
  };
}
