import type { App, ExtractPropTypes, PropType } from 'vue';
import { computed, ref, watchEffect, defineComponent } from 'vue';
import VcTreeSelect, {
  TreeNode,
  SHOW_ALL,
  SHOW_PARENT,
  SHOW_CHILD,
  treeSelectProps as vcTreeSelectProps,
} from '../vc-tree-select';
import classNames from '../_util/classNames';
import initDefaultProps from '../_util/props-util/initDefaultProps';
import type { SizeType } from '../config-provider';
import type { DefaultValueType, FieldNames } from '../vc-tree-select/interface';
import omit from '../_util/omit';
import PropTypes from '../_util/vue-types';
import useConfigInject from '../_util/hooks/useConfigInject';
import devWarning from '../vc-util/devWarning';
import getIcons from '../select/utils/iconUtil';
import renderSwitcherIcon from '../tree/utils/iconUtil';
import type { AntTreeNodeProps } from '../tree/Tree';
import { warning } from '../vc-util/warning';
import { flattenChildren } from '../_util/props-util';
import { useInjectFormItemContext } from '../form/FormItemContext';

const getTransitionName = (rootPrefixCls: string, motion: string, transitionName?: string) => {
  if (transitionName !== undefined) {
    return transitionName;
  }
  return `${rootPrefixCls}-${motion}`;
};

type RawValue = string | number;

export interface LabeledValue {
  key?: string;
  value: RawValue;
  label: any;
}

export type SelectValue = RawValue | RawValue[] | LabeledValue | LabeledValue[];

export interface RefTreeSelectProps {
  focus: () => void;
  blur: () => void;
}
export const treeSelectProps = {
  ...omit(vcTreeSelectProps<DefaultValueType>(), ['showTreeIcon', 'treeMotion', 'inputIcon']),
  suffixIcon: PropTypes.any,
  size: { type: String as PropType<SizeType> },
  bordered: { type: Boolean, default: undefined },
  replaceFields: { type: Object as PropType<FieldNames> },
};
export type TreeSelectProps = Partial<ExtractPropTypes<typeof treeSelectProps>>;

const TreeSelect = defineComponent({
  TreeNode,
  name: 'ATreeSelect',
  inheritAttrs: false,
  props: initDefaultProps(treeSelectProps, {
    choiceTransitionName: '',
    listHeight: 256,
    treeIcon: false,
    listItemHeight: 26,
    bordered: true,
  }),
  slots: [
    'title',
    'titleRender',
    'placeholder',
    'maxTagPlaceholder',
    'treeIcon',
    'switcherIcon',
    'notFoundContent',
  ],
  setup(props, { attrs, slots, expose, emit }) {
    warning(
      !(props.treeData === undefined && slots.default),
      '`children` of TreeSelect is deprecated. Please use `treeData` instead.',
    );
    watchEffect(() => {
      devWarning(
        props.multiple !== false || !props.treeCheckable,
        'TreeSelect',
        '`multiple` will alway be `true` when `treeCheckable` is true',
      );
      devWarning(
        props.replaceFields === undefined,
        'TreeSelect',
        '`replaceFields` is deprecated, please use fieldNames instead',
      );
    });

    const formItemContext = useInjectFormItemContext();
    const {
      configProvider,
      prefixCls,
      renderEmpty,
      direction,
      virtual,
      dropdownMatchSelectWidth,
      size,
      getPopupContainer,
      getPrefixCls,
    } = useConfigInject('select', props);
    const rootPrefixCls = computed(() => getPrefixCls());
    const transitionName = computed(() =>
      getTransitionName(rootPrefixCls.value, 'slide-up', props.transitionName),
    );
    const choiceTransitionName = computed(() =>
      getTransitionName(rootPrefixCls.value, '', props.choiceTransitionName),
    );
    const treePrefixCls = computed(() =>
      configProvider.getPrefixCls('select-tree', props.prefixCls),
    );
    const treeSelectPrefixCls = computed(() =>
      configProvider.getPrefixCls('tree-select', props.prefixCls),
    );

    const mergedDropdownClassName = computed(() =>
      classNames(props.dropdownClassName, `${treeSelectPrefixCls.value}-dropdown`, {
        [`${treeSelectPrefixCls.value}-dropdown-rtl`]: direction.value === 'rtl',
      }),
    );

    const isMultiple = computed(() => !!(props.treeCheckable || props.multiple));

    const treeSelectRef = ref();
    expose({
      focus() {
        treeSelectRef.value.focus?.();
      },

      blur() {
        treeSelectRef.value.blur?.();
      },
    });

    const handleChange = (...args: any[]) => {
      emit('update:value', args[0]);
      emit('change', ...args);
      formItemContext.onFieldChange();
    };
    const handleTreeExpand = (...args: any[]) => {
      emit('update:treeExpandedKeys', args[0]);
      emit('treeExpand', ...args);
    };
    const handleSearch = (...args: any[]) => {
      emit('update:searchValue', args[0]);
      emit('search', ...args);
    };
    const handleBlur = () => {
      emit('blur');
      formItemContext.onFieldBlur();
    };
    return () => {
      const {
        notFoundContent = slots.notFoundContent?.(),
        prefixCls: customizePrefixCls,
        bordered,
        listHeight,
        listItemHeight,
        multiple,
        treeIcon,
        treeLine,
        switcherIcon = slots.switcherIcon?.(),
        fieldNames = props.replaceFields,
        id = formItemContext.id.value,
      } = props;
      // ===================== Icons =====================
      const { suffixIcon, removeIcon, clearIcon } = getIcons(
        {
          ...props,
          multiple: isMultiple.value,
          prefixCls: prefixCls.value,
        },
        slots,
      );

      // ===================== Empty =====================
      let mergedNotFound;
      if (notFoundContent !== undefined) {
        mergedNotFound = notFoundContent;
      } else {
        mergedNotFound = renderEmpty.value('Select');
      }
      // ==================== Render =====================
      const selectProps = omit(props as typeof props & { itemIcon: any; switcherIcon: any }, [
        'suffixIcon',
        'itemIcon',
        'removeIcon',
        'clearIcon',
        'switcherIcon',
      ]);

      const mergedClassName = classNames(
        !customizePrefixCls && treeSelectPrefixCls.value,
        {
          [`${prefixCls.value}-lg`]: size.value === 'large',
          [`${prefixCls.value}-sm`]: size.value === 'small',
          [`${prefixCls.value}-rtl`]: direction.value === 'rtl',
          [`${prefixCls.value}-borderless`]: !bordered,
        },
        attrs.class,
      );
      const otherProps: any = {};
      if (props.treeData === undefined && slots.default) {
        otherProps.children = flattenChildren(slots.default());
      }
      return (
        <VcTreeSelect
          {...attrs}
          virtual={virtual.value}
          dropdownMatchSelectWidth={dropdownMatchSelectWidth.value}
          {...selectProps}
          id={id}
          fieldNames={fieldNames}
          ref={treeSelectRef}
          prefixCls={prefixCls.value}
          class={mergedClassName}
          listHeight={listHeight}
          listItemHeight={listItemHeight}
          inputIcon={suffixIcon}
          multiple={multiple}
          removeIcon={removeIcon}
          clearIcon={clearIcon}
          switcherIcon={(nodeProps: AntTreeNodeProps) =>
            renderSwitcherIcon(treePrefixCls.value, switcherIcon, treeLine, nodeProps)
          }
          showTreeIcon={treeIcon as any}
          notFoundContent={mergedNotFound}
          getPopupContainer={getPopupContainer.value}
          treeMotion={null}
          dropdownClassName={mergedDropdownClassName.value}
          choiceTransitionName={choiceTransitionName.value}
          onChange={handleChange}
          onBlur={handleBlur}
          onSearch={handleSearch}
          onTreeExpand={handleTreeExpand}
          v-slots={{
            ...slots,
            treeCheckable: () => <span class={`${prefixCls.value}-tree-checkbox-inner`} />,
          }}
          {...otherProps}
          transitionName={transitionName.value}
        />
      );
    };
  },
});

/* istanbul ignore next */
export const TreeSelectNode = TreeNode;
export default Object.assign(TreeSelect, {
  TreeNode,
  SHOW_ALL: SHOW_ALL as typeof SHOW_ALL,
  SHOW_PARENT: SHOW_PARENT as typeof SHOW_PARENT,
  SHOW_CHILD: SHOW_CHILD as typeof SHOW_CHILD,
  install: (app: App) => {
    app.component(TreeSelect.name, TreeSelect);
    app.component(TreeSelectNode.displayName, TreeSelectNode);
    return app;
  },
});
