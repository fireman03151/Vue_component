import PropTypes from '../_util/vue-types';
import classNames from 'classnames';
import { getComponent, isStringElement, isEmptyElement, getSlot } from '../_util/props-util';
import { Col } from '../grid';
import { ConfigConsumerProps } from '../config-provider';
import { ListGridType } from './index';
import { cloneElement } from '../_util/vnode';
import { inject } from 'vue';

export const ListItemProps = {
  prefixCls: PropTypes.string,
  extra: PropTypes.any,
  actions: PropTypes.arrayOf(PropTypes.any),
  grid: ListGridType,
};

export const ListItemMetaProps = {
  avatar: PropTypes.any,
  description: PropTypes.any,
  prefixCls: PropTypes.string,
  title: PropTypes.any,
};

export const Meta = (props, { slots, attrs }) => {
  const configProvider = inject('configProvider', ConfigConsumerProps);
  const { style, class: _cls } = attrs;
  const getPrefixCls = configProvider.getPrefixCls;
  const { prefixCls: customizePrefixCls } = props;
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const avatar = props.avatar || slots.avatar?.();
  const title = props.title || slots.title?.();
  const description = props.description || slots.description?.();
  const content = (
    <div class={`${prefixCls}-item-meta-content`}>
      {title && <h4 class={`${prefixCls}-item-meta-title`}>{title}</h4>}
      {description && <div class={`${prefixCls}-item-meta-description`}>{description}</div>}
    </div>
  );
  return (
    <div class={`${prefixCls}-item-meta`} style={style} class={_cls}>
      {avatar && <div class={`${prefixCls}-item-meta-avatar`}>{avatar}</div>}
      {(title || description) && content}
    </div>
  );
};

Object.assign(Meta, {
  props: ListItemMetaProps,
  inheritAttrs: false,
  __ANT_LIST_ITEM_META: true,
});

function getGrid(grid, t) {
  return grid[t] && Math.floor(24 / grid[t]);
}

export default {
  name: 'AListItem',
  inheritAttrs: false,
  Meta,
  props: ListItemProps,
  setup() {
    const listContext = inject('listContext', {});
    const configProvider = inject('configProvider', ConfigConsumerProps);
    return {
      listContext,
      configProvider,
    };
  },
  methods: {
    isItemContainsTextNodeAndNotSingular() {
      const children = getSlot(this) || [];
      let result;
      children.forEach(element => {
        if (isStringElement(element) && !isEmptyElement(element)) {
          result = true;
        }
      });
      return result && children.length > 1;
    },

    isFlexMode() {
      const extra = getComponent(this, 'extra');
      const { itemLayout } = this.listContext;
      if (itemLayout === 'vertical') {
        return !!extra;
      }
      return !this.isItemContainsTextNodeAndNotSingular();
    },
  },
  render() {
    const { grid, itemLayout } = this.listContext;
    const { prefixCls: customizePrefixCls, $slots, $attrs } = this;
    const { class: _className } = $attrs;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('list', customizePrefixCls);
    const extra = getComponent(this, 'extra');
    const actions = getComponent(this, 'actions');

    const actionsContent = actions && actions.length > 0 && (
      <ul class={`${prefixCls}-item-action`} key="actions">
        {actions.map((action, i) => (
          <li key={`${prefixCls}-item-action-${i}`}>
            {action}
            {i !== actions.length - 1 && <em class={`${prefixCls}-item-action-split`} />}
          </li>
        ))}
      </ul>
    );
    const children = $slots.default && $slots.default();
    const Tag = grid ? 'div' : 'li';
    const itemChildren = (
      <Tag
        {...$attrs}
        class={classNames(`${prefixCls}-item `, _className, {
          [`${prefixCls}-item-no-flex`]: !this.isFlexMode(),
        })}
      >
        {itemLayout === 'vertical' && extra
          ? [
              <div class={`${prefixCls}-item-main`} key="content">
                {$slots.default}
                {actionsContent}
              </div>,
              <div class={`${prefixCls}-item-extra`} key="extra">
                {extra}
              </div>,
            ]
          : [children, actionsContent, cloneElement(extra, { key: 'extra' })]}
      </Tag>
    );

    const mainContent = grid ? (
      <Col
        span={getGrid(grid, 'column')}
        xs={getGrid(grid, 'xs')}
        sm={getGrid(grid, 'sm')}
        md={getGrid(grid, 'md')}
        lg={getGrid(grid, 'lg')}
        xl={getGrid(grid, 'xl')}
        xxl={getGrid(grid, 'xxl')}
      >
        {itemChildren}
      </Col>
    ) : (
      itemChildren
    );

    return mainContent;
  },
};
