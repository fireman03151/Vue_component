/* @remove-on-es-build-begin */
// this file is not used if use https://github.com/ant-design/babel-plugin-import
const ENV = process.env.NODE_ENV;
if (
  ENV !== 'production' &&
  ENV !== 'test' &&
  typeof console !== 'undefined' &&
  console.warn &&
  typeof window !== 'undefined'
) {
  console.warn(
    'You are using a whole package of antd, ' +
      'please use https://www.npmjs.com/package/babel-plugin-import to reduce app bundle size.',
  );
}
/* @remove-on-es-build-end */

import { default as Affix } from './affix';

import { default as Anchor } from './anchor';

import { default as AutoComplete } from './auto-complete';

import { default as Alert } from './alert';

import { default as Avatar } from './avatar';

import { default as BackTop } from './back-top';

import { default as Badge } from './badge';

import { default as Breadcrumb } from './breadcrumb';

import { default as Button } from './button';

import { default as Calendar } from './calendar';

import { default as Card } from './card';

import { default as Collapse } from './collapse';

import { default as Carousel } from './carousel';

import { default as Cascader } from './cascader';

import { default as Checkbox } from './checkbox';

import { default as Col } from './col';

import { default as DatePicker } from './date-picker';

import { default as Divider } from './divider';

import { default as Dropdown } from './dropdown';

import { default as Form } from './form';

import { default as Icon } from './icon';

import { default as Input } from './input';

import { default as InputNumber } from './input-number';

import { default as Layout } from './layout';

import { default as List } from './list';

import { default as LocaleProvider } from './locale-provider';

import { default as message } from './message';

import { default as Menu } from './menu';

import { default as Mentions } from './mentions';

import { default as Modal } from './modal';

import { default as notification } from './notification';

import { default as Pagination } from './pagination';

import { default as Popconfirm } from './popconfirm';

import { default as Popover } from './popover';

import { default as Progress } from './progress';

import { default as Radio } from './radio';

import { default as Rate } from './rate';

import { default as Row } from './row';

import { default as Select } from './select';

import { default as Slider } from './slider';

import { default as Spin } from './spin';

import { default as Statistic } from './statistic';

import { default as Steps } from './steps';

import { default as Switch } from './switch';

import { default as Table } from './table';

import { default as Transfer } from './transfer';

import { default as Tree } from './tree';

import { default as TreeSelect } from './tree-select';

import { default as Tabs } from './tabs';

import { default as Tag } from './tag';

import { default as TimePicker } from './time-picker';

import { default as Timeline } from './timeline';

import { default as Tooltip } from './tooltip';

// import { default as Mention } from './mention'

import { default as Upload } from './upload';

import { default as version } from './version';

import { default as Drawer } from './drawer';

import { default as Skeleton } from './skeleton';

import { default as Comment } from './comment';

// import { default as ColorPicker } from './color-picker';

import { default as ConfigProvider } from './config-provider';

import { default as Empty } from './empty';

import { default as Result } from './result';

import { default as Descriptions } from './descriptions';
import { default as PageHeader } from './page-header';
import { default as Space } from './space';

const components = [
  Affix,
  Anchor,
  AutoComplete,
  Alert,
  Avatar,
  BackTop,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Collapse,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Icon,
  Input,
  InputNumber,
  Layout,
  List,
  LocaleProvider,
  Menu,
  Mentions,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  Rate,
  Row,
  Select,
  Slider,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Transfer,
  Tree,
  TreeSelect,
  Tabs,
  Tag,
  TimePicker,
  Timeline,
  Tooltip,
  Upload,
  Drawer,
  Skeleton,
  Comment,
  // ColorPicker,
  ConfigProvider,
  Empty,
  Result,
  Descriptions,
  PageHeader,
  Space,
];

const install = function(app) {
  components.map(component => {
    app.use(component);
  });

  app.config.globalProperties.$message = message;
  app.config.globalProperties.$notification = notification;
  app.config.globalProperties.$info = Modal.info;
  app.config.globalProperties.$success = Modal.success;
  app.config.globalProperties.$error = Modal.error;
  app.config.globalProperties.$warning = Modal.warning;
  app.config.globalProperties.$confirm = Modal.confirm;
  app.config.globalProperties.$destroyAll = Modal.destroyAll;
};

/* istanbul ignore if */

export {
  version,
  install,
  message,
  notification,
  Affix,
  Anchor,
  AutoComplete,
  Alert,
  Avatar,
  BackTop,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Collapse,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Icon,
  Input,
  InputNumber,
  Layout,
  List,
  LocaleProvider,
  Menu,
  Mentions,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  Rate,
  Row,
  Select,
  Slider,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Transfer,
  Tree,
  TreeSelect,
  Tabs,
  Tag,
  TimePicker,
  Timeline,
  Tooltip,
  Upload,
  Drawer,
  Skeleton,
  Comment,
  // ColorPicker,
  ConfigProvider,
  Empty,
  Result,
  Descriptions,
  PageHeader,
  Space,
};

export default {
  version,
  install,
};
