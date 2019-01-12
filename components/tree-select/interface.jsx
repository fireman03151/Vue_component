import PropTypes from '../_util/vue-types';
import { AbstractSelectProps } from '../select';

export const TreeData = PropTypes.shape({
  key: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.any,
  scopedSlots: PropTypes.object,
  children: PropTypes.array,
}).loose;

export const TreeSelectProps = () => ({
  ...AbstractSelectProps(),
  autoFocus: PropTypes.bool,
  dropdownStyle: PropTypes.object,
  filterTreeNode: PropTypes.oneOfType([Function, Boolean]),
  getPopupContainer: PropTypes.func,
  labelInValue: PropTypes.bool,
  loadData: PropTypes.func,
  maxTagCount: PropTypes.number,
  maxTagPlaceholder: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  multiple: PropTypes.bool,
  // onSelect: (value: any) => void,
  // onChange: (value: any, label: any) => void,
  // onSearch: (value: any) => void,
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  showCheckedStrategy: PropTypes.oneOf(['SHOW_ALL', 'SHOW_PARENT', 'SHOW_CHILD']),
  suffixIcon: PropTypes.any,
  treeCheckable: PropTypes.bool,
  treeCheckStrictly: PropTypes.bool,
  treeData: PropTypes.arrayOf(Object),
  treeDataSimpleMode: PropTypes.oneOfType([Boolean, Object]),

  dropdownClassName: PropTypes.string,
  dropdownMatchSelectWidth: PropTypes.bool,
  treeDefaultExpandAll: PropTypes.bool,
  treeExpandedKeys: PropTypes.array,
  treeDefaultExpandedKeys: PropTypes.array,
  treeNodeFilterProp: PropTypes.string,
  treeNodeLabelProp: PropTypes.string,
});
