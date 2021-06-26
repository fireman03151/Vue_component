import type { ExtractPropTypes } from 'vue';
import { defineComponent } from 'vue';
import PropTypes from '../_util/vue-types';

const widthUnit = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

export const skeletonParagraphProps = {
  prefixCls: PropTypes.string,
  width: PropTypes.oneOfType([widthUnit, PropTypes.arrayOf(widthUnit)]),
  rows: PropTypes.number,
};

export type SkeletonParagraphProps = Partial<ExtractPropTypes<typeof skeletonParagraphProps>>;

const SkeletonParagraph = defineComponent({
  name: 'SkeletonParagraph',
  props: skeletonParagraphProps,
  setup(props) {
    const getWidth = (index: number) => {
      const { width, rows = 2 } = props;
      if (Array.isArray(width)) {
        return width[index];
      }
      // last paragraph
      if (rows - 1 === index) {
        return width;
      }
      return undefined;
    };
    return () => {
      const { prefixCls, rows } = props;
      const rowList = [...Array(rows)].map((_, index) => {
        const width = getWidth(index);
        return (
          <li key={index} style={{ width: typeof width === 'number' ? `${width}px` : width }} />
        );
      });
      return <ul class={prefixCls}>{rowList}</ul>;
    };
  },
});

export default SkeletonParagraph;
