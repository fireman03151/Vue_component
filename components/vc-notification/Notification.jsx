import { createApp, TransitionGroup } from 'vue';
import PropTypes from '../_util/vue-types';
import { getComponent } from '../_util/props-util';
import BaseMixin from '../_util/BaseMixin';
import createChainedFunction from '../_util/createChainedFunction';
import getTransitionProps from '../_util/getTransitionProps';
import Notice from './Notice';

function noop() {}

let seed = 0;
const now = Date.now();

function getUuid() {
  return `rcNotification_${now}_${seed++}`;
}

const Notification = {
  mixins: [BaseMixin],
  props: {
    prefixCls: PropTypes.string.def('rc-notification'),
    transitionName: PropTypes.string,
    animation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).def('fade'),
    maxCount: PropTypes.number,
    closeIcon: PropTypes.any,
  },
  data() {
    return {
      notices: [],
    };
  },
  methods: {
    getTransitionName() {
      const props = this.$props;
      let transitionName = props.transitionName;
      if (!transitionName && props.animation) {
        transitionName = `${props.prefixCls}-${props.animation}`;
      }
      return transitionName;
    },

    add(notice) {
      const key = (notice.key = notice.key || getUuid());
      const { maxCount } = this.$props;
      this.setState(previousState => {
        const notices = previousState.notices;
        const noticeIndex = notices.map(v => v.key).indexOf(key);
        const updatedNotices = notices.concat();
        if (noticeIndex !== -1) {
          updatedNotices.splice(noticeIndex, 1, notice);
        } else {
          if (maxCount && notices.length >= maxCount) {
            // XXX, use key of first item to update new added (let React to move exsiting
            // instead of remove and mount). Same key was used before for both a) external
            // manual control and b) internal react 'key' prop , which is not that good.
            notice.updateKey = updatedNotices[0].updateKey || updatedNotices[0].key;
            updatedNotices.shift();
          }
          updatedNotices.push(notice);
        }
        return {
          notices: updatedNotices,
        };
      });
    },

    remove(key) {
      this.setState(previousState => {
        return {
          notices: previousState.notices.filter(notice => notice.key !== key),
        };
      });
    },
  },

  render() {
    const { prefixCls, notices, remove, getTransitionName, $attrs } = this;
    const transitionProps = getTransitionProps(getTransitionName());
    const noticeNodes = notices.map((notice, index) => {
      const update = Boolean(index === notices.length - 1 && notice.updateKey);
      const key = notice.updateKey ? notice.updateKey : notice.key;

      const { content, duration, closable, onClose, style, class: className } = notice;
      const close = createChainedFunction(remove.bind(this, notice.key), onClose);
      const noticeProps = {
        prefixCls,
        duration,
        closable,
        update,
        closeIcon: getComponent(this, 'closeIcon'),
        onClose: close,
        onClick: notice.onClick || noop,
        style,
        class: className,
        key,
      };
      return (
        <Notice {...noticeProps}>{typeof content === 'function' ? content() : content}</Notice>
      );
    });
    const className = {
      [prefixCls]: 1,
    };
    return (
      <div
        class={className}
        style={
          $attrs.style || {
            top: '65px',
            left: '50%',
          }
        }
      >
        <TransitionGroup tag="span" {...transitionProps}>
          {noticeNodes}
        </TransitionGroup>
      </div>
    );
  },
};

Notification.newInstance = function newNotificationInstance(properties, callback) {
  const { getContainer, style, class: className, ...props } = properties || {};
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  const app = createApp({
    mounted() {
      const self = this;
      this.$nextTick(() => {
        callback({
          notice(noticeProps) {
            self.$refs.notification.add(noticeProps);
          },
          removeNotice(key) {
            self.$refs.notification.remove(key);
          },
          component: self,
          destroy() {
            app.unmount(div);
            if (div.parentNode) {
              div.parentNode.removeChild(div);
            }
          },
        });
      });
    },
    render() {
      const p = {
        ...props,
        ref: 'notification',
        style,
        class: className,
      };
      return <Notification {...p} />;
    },
  });
  app.mount(div);
};

export default Notification;
