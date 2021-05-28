import PropTypes from '../../_util/vue-types';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  ref,
  watch,
  PropType,
  onBeforeUnmount,
  ExtractPropTypes,
} from 'vue';
import useProvideKeyPath, { useInjectKeyPath } from './hooks/useKeyPath';
import { useInjectMenu, useProvideFirstLevel, MenuContextProvider } from './hooks/useMenuContext';
import { getPropsSlot, isValidElement } from '../../_util/props-util';
import classNames from '../../_util/classNames';
import useDirectionStyle from './hooks/useDirectionStyle';
import PopupTrigger from './PopupTrigger';
import SubMenuList from './SubMenuList';
import InlineSubMenuList from './InlineSubMenuList';
import Transition, { getTransitionProps } from '../../_util/transition';
import { cloneElement } from '../../_util/vnode';

let indexGuid = 0;

const subMenuProps = {
  icon: PropTypes.VNodeChild,
  title: PropTypes.VNodeChild,
  disabled: Boolean,
  level: Number,
  popupClassName: String,
  popupOffset: Array as PropType<number[]>,
  internalPopupClose: Boolean,
};

export type SubMenuProps = Partial<ExtractPropTypes<typeof subMenuProps>>;

export default defineComponent({
  name: 'ASubMenu',
  inheritAttrs: false,
  props: subMenuProps,
  slots: ['icon', 'title'],
  emits: ['titleClick', 'mouseenter', 'mouseleave'],
  setup(props, { slots, attrs, emit }) {
    useProvideFirstLevel(false);

    const instance = getCurrentInstance();
    const key =
      instance.vnode.key !== null ? instance.vnode.key : `sub_menu_${++indexGuid}_$$_not_set_key`;

    const eventKey =
      instance.vnode.key !== null
        ? `sub_menu_${++indexGuid}_$$_${instance.vnode.key}`
        : (key as string);
    const { parentEventKeys, parentInfo, parentKeys } = useInjectKeyPath();
    const keysPath = computed(() => [...parentKeys.value, key]);
    const eventKeysPath = computed(() => [...parentEventKeys.value, eventKey]);
    const childrenEventKeys = ref([]);
    const menuInfo = {
      eventKey,
      key,
      parentEventKeys,
      childrenEventKeys,
      parentKeys,
    };
    parentInfo.childrenEventKeys?.value.push(eventKey);
    onBeforeUnmount(() => {
      if (parentInfo.childrenEventKeys) {
        parentInfo.childrenEventKeys.value = parentInfo.childrenEventKeys?.value.filter(
          k => k != eventKey,
        );
      }
    });

    useProvideKeyPath(eventKey, key, menuInfo);

    const {
      prefixCls,
      activeKeys,
      disabled: contextDisabled,
      changeActiveKeys,
      mode,
      inlineCollapsed,
      antdMenuTheme,
      openKeys,
      overflowDisabled,
      onOpenChange,
      registerMenuInfo,
      unRegisterMenuInfo,
      selectedSubMenuEventKeys,
      motion,
      defaultMotions,
    } = useInjectMenu();

    registerMenuInfo(eventKey, menuInfo);

    onBeforeUnmount(() => {
      unRegisterMenuInfo(eventKey);
    });

    const subMenuPrefixCls = computed(() => `${prefixCls.value}-submenu`);
    const mergedDisabled = computed(() => contextDisabled.value || props.disabled);
    const elementRef = ref();
    const popupRef = ref();

    // // ================================ Icon ================================
    // const mergedItemIcon = itemIcon || contextItemIcon;
    // const mergedExpandIcon = expandIcon || contextExpandIcon;

    // ================================ Open ================================
    const originOpen = computed(() => openKeys.value.includes(key));
    const open = computed(() => !overflowDisabled.value && originOpen.value);

    // =============================== Select ===============================
    const childrenSelected = computed(() => {
      return selectedSubMenuEventKeys.value.includes(eventKey);
    });

    const isActive = ref(false);
    watch(
      activeKeys,
      () => {
        isActive.value = !!activeKeys.value.find(val => val === key);
      },
      { immediate: true },
    );

    // =============================== Events ===============================
    // >>>> Title click
    const onInternalTitleClick = (e: Event) => {
      // Skip if disabled
      if (mergedDisabled.value) {
        return;
      }
      emit('titleClick', e, key);

      // Trigger open by click when mode is `inline`
      if (mode.value === 'inline') {
        onOpenChange(eventKey, !originOpen.value);
      }
    };

    const onMouseEnter = (event: MouseEvent) => {
      if (!mergedDisabled.value) {
        changeActiveKeys(keysPath.value);
        emit('mouseenter', event);
      }
    };
    const onMouseLeave = (event: MouseEvent) => {
      if (!mergedDisabled.value) {
        changeActiveKeys([]);
        emit('mouseleave', event);
      }
    };

    // ========================== DirectionStyle ==========================
    const directionStyle = useDirectionStyle(computed(() => eventKeysPath.value.length));

    // >>>>> Visible change
    const onPopupVisibleChange = (newVisible: boolean) => {
      if (mode.value !== 'inline') {
        onOpenChange(eventKey, newVisible);
      }
    };

    /**
     * Used for accessibility. Helper will focus element without key board.
     * We should manually trigger an active
     */
    const onInternalFocus = () => {
      changeActiveKeys(keysPath.value);
    };

    // =============================== Render ===============================
    const popupId = eventKey && `${eventKey}-popup`;

    const popupClassName = computed(() =>
      classNames(
        prefixCls.value,
        `${prefixCls.value}-${antdMenuTheme.value}`,
        props.popupClassName,
      ),
    );
    const renderTitle = (title: any, icon: any) => {
      if (!icon) {
        return inlineCollapsed.value &&
          !parentEventKeys.value.length &&
          title &&
          typeof title === 'string' ? (
          <div class={`${prefixCls.value}-inline-collapsed-noicon`}>{title.charAt(0)}</div>
        ) : (
          title
        );
      }
      // inline-collapsed.md demo 依赖 span 来隐藏文字,有 icon 属性，则内部包裹一个 span
      // ref: https://github.com/ant-design/ant-design/pull/23456
      const titleIsSpan = isValidElement(title) && title.type === 'span';
      return (
        <>
          {cloneElement(
            icon,
            {
              class: `${prefixCls.value}-item-icon`,
            },
            false,
          )}
          {titleIsSpan ? title : <span class={`${prefixCls.value}-title-content`}>{title}</span>}
        </>
      );
    };

    // Cache mode if it change to `inline` which do not have popup motion
    const triggerModeRef = computed(() => {
      return mode.value !== 'inline' && eventKeysPath.value.length > 1 ? 'vertical' : mode.value;
    });

    const renderMode = computed(() => (mode.value === 'horizontal' ? 'vertical' : mode.value));

    const style = ref({});
    const className = ref('');
    const mergedMotion = computed(() => {
      const m = motion.value || defaultMotions.value?.[mode.value] || defaultMotions.value?.other;
      const res = typeof m === 'function' ? m(style, className) : m;
      return res ? getTransitionProps(res.name) : undefined;
    });

    return () => {
      const icon = getPropsSlot(slots, props, 'icon');
      const title = renderTitle(getPropsSlot(slots, props, 'title'), icon);
      const subMenuPrefixClsValue = subMenuPrefixCls.value;
      let titleNode = (
        <div
          style={directionStyle.value}
          class={`${subMenuPrefixClsValue}-title`}
          tabindex={mergedDisabled.value ? null : -1}
          ref={elementRef}
          title={typeof title === 'string' ? title : null}
          data-menu-id={key}
          aria-expanded={open.value}
          aria-haspopup
          aria-controls={popupId}
          aria-disabled={mergedDisabled.value}
          onClick={onInternalTitleClick}
          onFocus={onInternalFocus}
        >
          {title}

          {/* Only non-horizontal mode shows the icon */}
          {mode.value !== 'horizontal' && slots.expandIcon ? (
            slots.expandIcon({ ...props, isOpen: open.value })
          ) : (
            <i class={`${subMenuPrefixClsValue}-arrow`} />
          )}
        </div>
      );

      if (!overflowDisabled.value) {
        const triggerMode = triggerModeRef.value;
        titleNode = (
          <PopupTrigger
            mode={triggerMode}
            prefixCls={subMenuPrefixClsValue}
            visible={!props.internalPopupClose && open.value && mode.value !== 'inline'}
            popupClassName={popupClassName.value}
            popupOffset={props.popupOffset}
            disabled={mergedDisabled.value}
            onVisibleChange={onPopupVisibleChange}
            v-slots={{
              popup: ({ visible }) => (
                <MenuContextProvider props={{ mode: triggerModeRef, isRootMenu: false }}>
                  <Transition {...mergedMotion.value}>
                    <SubMenuList v-show={visible} id={popupId} ref={popupRef}>
                      {slots.default?.()}
                    </SubMenuList>
                  </Transition>
                </MenuContextProvider>
              ),
            }}
          >
            {titleNode}
          </PopupTrigger>
        );
      }
      return (
        <MenuContextProvider props={{ mode: renderMode }}>
          <li
            {...attrs}
            role="none"
            class={classNames(
              subMenuPrefixClsValue,
              `${subMenuPrefixClsValue}-${mode.value}`,
              attrs.class,
              {
                [`${subMenuPrefixClsValue}-open`]: open.value,
                [`${subMenuPrefixClsValue}-active`]: isActive.value,
                [`${subMenuPrefixClsValue}-selected`]: childrenSelected.value,
                [`${subMenuPrefixClsValue}-disabled`]: mergedDisabled.value,
              },
            )}
            onMouseenter={onMouseEnter}
            onMouseleave={onMouseLeave}
          >
            {titleNode}

            {/* Inline mode */}
            {!overflowDisabled.value && (
              <InlineSubMenuList id={popupId} open={open.value} keyPath={keysPath.value}>
                {slots.default?.()}
              </InlineSubMenuList>
            )}
          </li>
        </MenuContextProvider>
      );
    };
  },
});
