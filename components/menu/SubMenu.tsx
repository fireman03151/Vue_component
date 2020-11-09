import { defineComponent, inject } from 'vue';
import { SubMenu as VcSubMenu } from '../vc-menu';
import classNames from '../_util/classNames';
import Omit from 'omit.js';
import { getSlot } from '../_util/props-util';
import { injectExtraPropsKey } from '../vc-menu/FunctionProvider';

export type MenuTheme = 'light' | 'dark';

export interface MenuContextProps {
  inlineCollapsed?: boolean;
  theme?: MenuTheme;
}

export default defineComponent({
  name: 'ASubMenu',
  isSubMenu: true,
  inheritAttrs: false,
  props: { ...VcSubMenu.props },
  setup() {
    return {
      menuPropsContext: inject<MenuContextProps>('menuPropsContext', {}),
      injectExtraProps: inject(injectExtraPropsKey, () => ({})),
    };
  },
  methods: {
    onKeyDown(e) {
      (this.$refs.subMenu as any).onKeyDown(e);
    },
  },

  render() {
    const { $slots, $attrs } = this;
    const { rootPrefixCls, popupClassName } = {...this.$props, ...this.injectExtraProps} as any;
    const { theme: antdMenuTheme } = this.menuPropsContext;
    const props = {
      ...this.$props,
      popupClassName: classNames(`${rootPrefixCls}-${antdMenuTheme}`, popupClassName),
      ref: 'subMenu',
      ...$attrs,
      ...Omit($slots, ['default']),
    };
    return <VcSubMenu {...props}>{getSlot(this)}</VcSubMenu>;
  },
});
