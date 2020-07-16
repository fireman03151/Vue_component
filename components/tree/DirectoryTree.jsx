import { inject } from 'vue';
import omit from 'omit.js';
import debounce from 'lodash/debounce';
import FolderOpenOutlined from '@ant-design/icons-vue/FolderOpenOutlined';
import FolderOutlined from '@ant-design/icons-vue/FolderOutlined';
import FileOutlined from '@ant-design/icons-vue/FileOutlined';
import PropTypes from '../_util/vue-types';
import classNames from 'classnames';
import { conductExpandParent, convertTreeToEntities } from '../vc-tree/src/util';
import Tree, { TreeProps } from './Tree';
import {
  calcRangeKeys,
  getFullKeyList,
  convertDirectoryKeysToNodes,
  getFullKeyListByTreeData,
} from './util';
import BaseMixin from '../_util/BaseMixin';
import { initDefaultProps, getOptionProps, getComponent, getSlot } from '../_util/props-util';
import { ConfigConsumerProps } from '../config-provider';

// export type ExpandAction = false | 'click' | 'dblclick'; export interface
// DirectoryTreeProps extends TreeProps {   expandAction?: ExpandAction; }
// export interface DirectoryTreeState {   expandedKeys?: string[];
// selectedKeys?: string[]; }

function getIcon(props) {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <FileOutlined />;
  }
  return expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
}

export default {
  name: 'ADirectoryTree',
  mixins: [BaseMixin],
  inheritAttrs: false,
  // model: {
  //   prop: 'checkedKeys',
  //   event: 'check',
  // },
  props: initDefaultProps(
    {
      ...TreeProps(),
      expandAction: PropTypes.oneOf([false, 'click', 'doubleclick', 'dblclick']),
    },
    {
      showIcon: true,
      expandAction: 'click',
    },
  ),
  setup() {
    return {
      configProvider: inject('configProvider', ConfigConsumerProps),
    };
  },
  data() {
    const props = getOptionProps(this);
    const { defaultExpandAll, defaultExpandParent, expandedKeys, defaultExpandedKeys } = props;
    const { keyEntities } = convertTreeToEntities(this.$slots.default);
    const state = {};
    // Selected keys
    state._selectedKeys = props.selectedKeys || props.defaultSelectedKeys || [];

    // Expanded keys
    if (defaultExpandAll) {
      if (props.treeData) {
        state._expandedKeys = getFullKeyListByTreeData(props.treeData);
      } else {
        state._expandedKeys = getFullKeyList(this.$slots.default);
      }
    } else if (defaultExpandParent) {
      state._expandedKeys = conductExpandParent(expandedKeys || defaultExpandedKeys, keyEntities);
    } else {
      state._expandedKeys = expandedKeys || defaultExpandedKeys;
    }

    this.onDebounceExpand = debounce(this.expandFolderNode, 200, { leading: true });
    this.children = null;
    return {
      _selectedKeys: [],
      _expandedKeys: [],
      ...state,
    };
  },
  watch: {
    expandedKeys(val) {
      this.setState({ _expandedKeys: val });
    },
    selectedKeys(val) {
      this.setState({ _selectedKeys: val });
    },
  },
  methods: {
    onExpand(expandedKeys, info) {
      this.setUncontrolledState({ _expandedKeys: expandedKeys });

      this.$emit('expand', expandedKeys, info);

      return undefined;
    },

    onClick(event, node) {
      const { expandAction } = this.$props;

      // Expand the tree
      if (expandAction === 'click') {
        this.onDebounceExpand(event, node);
      }
      this.$emit('click', event, node);
    },

    onDoubleClick(event, node) {
      const { expandAction } = this.$props;

      // Expand the tree
      if (expandAction === 'dblclick' || expandAction === 'doubleclick') {
        this.onDebounceExpand(event, node);
      }

      this.$emit('doubleclick', event, node);
      this.$emit('dblclick', event, node);
    },

    onSelect(keys, event) {
      const { multiple } = this.$props;
      const children = this.children || [];
      const { _expandedKeys: expandedKeys = [] } = this.$data;
      const { node, nativeEvent } = event;
      const { eventKey = '' } = node;

      const newState = {};

      // We need wrap this event since some value is not same
      const newEvent = {
        ...event,
        selected: true, // Directory selected always true
      };

      // Windows / Mac single pick
      const ctrlPick = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const shiftPick = nativeEvent.shiftKey;

      // Generate new selected keys
      let newSelectedKeys;
      if (multiple && ctrlPick) {
        // Control click
        newSelectedKeys = keys;
        this.lastSelectedKey = eventKey;
        this.cachedSelectedKeys = newSelectedKeys;
        newEvent.selectedNodes = convertDirectoryKeysToNodes(children, newSelectedKeys);
      } else if (multiple && shiftPick) {
        // Shift click
        newSelectedKeys = Array.from(
          new Set([
            ...(this.cachedSelectedKeys || []),
            ...calcRangeKeys(children, expandedKeys, eventKey, this.lastSelectedKey),
          ]),
        );
        newEvent.selectedNodes = convertDirectoryKeysToNodes(children, newSelectedKeys);
      } else {
        // Single click
        newSelectedKeys = [eventKey];
        this.lastSelectedKey = eventKey;
        this.cachedSelectedKeys = newSelectedKeys;
        newEvent.selectedNodes = [event.node];
      }
      newState._selectedKeys = newSelectedKeys;

      this.$emit('update:selectedKeys', newSelectedKeys);
      this.$emit('select', newSelectedKeys, newEvent);

      this.setUncontrolledState(newState);
    },
    setTreeRef(node) {
      this.tree = node;
    },

    expandFolderNode(event, node) {
      const { isLeaf } = node;

      if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
        return;
      }

      if (this.tree.tree) {
        // Get internal vc-tree
        const internalTree = this.tree.tree;

        // Call internal rc-tree expand function
        // https://github.com/ant-design/ant-design/issues/12567
        internalTree.onNodeExpand(event, node);
      }
    },

    setUncontrolledState(state) {
      const newState = omit(
        state,
        Object.keys(getOptionProps(this)).map(p => `_${p}`),
      );
      if (Object.keys(newState).length) {
        this.setState(newState);
      }
    },
  },

  render() {
    this.children = getSlot(this);
    const { prefixCls: customizePrefixCls, ...props } = getOptionProps(this);
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('tree', customizePrefixCls);
    const { _expandedKeys: expandedKeys, _selectedKeys: selectedKeys } = this.$data;
    const { class: className, ...restAttrs } = this.$attrs;
    const connectClassName = classNames(`${prefixCls}-directory`, className);
    const treeProps = {
      icon: getIcon,
      ...props,
      ...omit(restAttrs, ['onUpdate:selectedKeys']),
      prefixCls,
      expandedKeys,
      selectedKeys,
      switcherIcon: getComponent(this, 'switcherIcon'),
      ref: this.setTreeRef,
      class: connectClassName,
      onSelect: this.onSelect,
      onClick: this.onClick,
      onDblclick: this.onDoubleClick,
      onExpand: this.onExpand,
    };
    return <Tree {...treeProps}>{this.children}</Tree>;
  },
};
