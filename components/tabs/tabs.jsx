import Icon from '../icon';
import VcTabs, { TabPane } from '../vc-tabs/src';
import TabContent from '../vc-tabs/src/TabContent';
import isFlexSupported from '../_util/isFlexSupported';
import PropTypes from '../_util/vue-types';
import { getComponentFromProp, getOptionProps, filterEmpty } from '../_util/props-util';
import { cloneElement } from '../_util/vnode';
import TabBar from './TabBar';

export default {
  TabPane,
  name: 'ATabs',
  props: {
    prefixCls: PropTypes.string.def('ant-tabs'),
    activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    defaultActiveKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hideAdd: PropTypes.bool.def(false),
    tabBarStyle: PropTypes.object,
    tabBarExtraContent: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
    destroyInactiveTabPane: PropTypes.bool.def(false),
    type: PropTypes.oneOf(['line', 'card', 'editable-card']),
    tabPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).def('top'),
    size: PropTypes.oneOf(['default', 'small', 'large']),
    animated: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    tabBarGutter: PropTypes.number,
    renderTabBar: PropTypes.func,
  },
  model: {
    prop: 'activeKey',
    event: 'change',
  },
  methods: {
    removeTab(targetKey, e) {
      e.stopPropagation();
      if (!targetKey) {
        return;
      }
      this.$emit('edit', targetKey, 'remove');
    },
    handleChange(activeKey) {
      this.$emit('change', activeKey);
    },
    createNewTab(targetKey) {
      this.$emit('edit', targetKey, 'add');
    },
    onTabClick(val) {
      this.$emit('tabClick', val);
    },
    onPrevClick(val) {
      this.$emit('prevClick', val);
    },
    onNextClick(val) {
      this.$emit('nextClick', val);
    },
  },

  mounted() {
    const NO_FLEX = ' no-flex';
    const tabNode = this.$el;
    if (tabNode && !isFlexSupported() && tabNode.className.indexOf(NO_FLEX) === -1) {
      tabNode.className += NO_FLEX;
    }
  },

  render() {
    const props = getOptionProps(this);
    const {
      prefixCls,
      size,
      type = 'line',
      tabPosition,
      animated = true,
      hideAdd,
      renderTabBar,
    } = props;
    const children = filterEmpty(this.$slots.default);

    let tabBarExtraContent = getComponentFromProp(this, 'tabBarExtraContent');
    let tabPaneAnimated = typeof animated === 'object' ? animated.tabPane : animated;

    // card tabs should not have animation
    if (type !== 'line') {
      tabPaneAnimated = 'animated' in props ? tabPaneAnimated : false;
    }
    const cls = {
      [`${prefixCls}-vertical`]: tabPosition === 'left' || tabPosition === 'right',
      [`${prefixCls}-${size}`]: !!size,
      [`${prefixCls}-card`]: type.indexOf('card') >= 0,
      [`${prefixCls}-${type}`]: true,
      [`${prefixCls}-no-animation`]: !tabPaneAnimated,
    };
    // only card type tabs can be added and closed
    let childrenWithClose = [];
    if (type === 'editable-card') {
      childrenWithClose = [];
      children.forEach((child, index) => {
        const props = getOptionProps(child);
        let closable = props.closable;
        closable = typeof closable === 'undefined' ? true : closable;
        const closeIcon = closable ? (
          <Icon
            type="close"
            class={`${prefixCls}-close-x`}
            onClick={e => this.removeTab(child.key, e)}
          />
        ) : null;
        childrenWithClose.push(
          cloneElement(child, {
            props: {
              tab: (
                <div class={closable ? undefined : `${prefixCls}-tab-unclosable`}>
                  {getComponentFromProp(child, 'tab')}
                  {closeIcon}
                </div>
              ),
            },
            key: child.key || index,
          }),
        );
      });
      // Add new tab handler
      if (!hideAdd) {
        tabBarExtraContent = (
          <span>
            <Icon type="plus" class={`${prefixCls}-new-tab`} onClick={this.createNewTab} />
            {tabBarExtraContent}
          </span>
        );
      }
    }

    tabBarExtraContent = tabBarExtraContent ? (
      <div class={`${prefixCls}-extra-content`}>{tabBarExtraContent}</div>
    ) : null;

    const renderTabBarSlot = renderTabBar || this.$scopedSlots.renderTabBar;
    const tabBarProps = {
      props: {
        ...this.$props,
        tabBarExtraContent,
        renderTabBar: renderTabBarSlot,
      },
      on: {
        ...this.$listeners,
      },
    };
    const contentCls = {
      [`${prefixCls}-${tabPosition}-content`]: true,
      [`${prefixCls}-card-content`]: type.indexOf('card') >= 0,
    };
    const tabsProps = {
      props: {
        ...getOptionProps(this),
        tabBarPosition: tabPosition,
        renderTabBar: () => <TabBar {...tabBarProps} />,
        renderTabContent: () => (
          <TabContent class={contentCls} animated={tabPaneAnimated} animatedWithMargin />
        ),
        children: childrenWithClose.length > 0 ? childrenWithClose : children,
        __propsSymbol__: Symbol(),
      },
      on: {
        ...this.$listeners,
        change: this.handleChange,
      },
      class: cls,
    };
    return <VcTabs {...tabsProps} />;
  },
};
