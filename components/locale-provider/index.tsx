import { provide, App, defineComponent, VNode } from 'vue';
import PropTypes from '../_util/vue-types';
import moment from 'moment';
import interopDefault from '../_util/interopDefault';
import { ModalLocale, changeConfirmLocale } from '../modal/locale';
import warning from '../_util/warning';
import { getSlot } from '../_util/props-util';
export interface Locale {
  locale: string;
  Pagination?: Object;
  DatePicker?: Object;
  TimePicker?: Object;
  Calendar?: Object;
  Table?: Object;
  Modal?: ModalLocale;
  Popconfirm?: Object;
  Transfer?: Object;
  Select?: Object;
  Upload?: Object;
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: VNode | VNode[];
  _ANT_MARK__?: string;
}

export const ANT_MARK = 'internalMark';

function setMomentLocale(locale?: Locale) {
  if (locale && locale.locale) {
    interopDefault(moment).locale(locale.locale);
  } else {
    interopDefault(moment).locale('en');
  }
}

const LocaleProvider = defineComponent({
  name: 'ALocaleProvider',
  props: {
    locale: {
      type: Object,
    },
    _ANT_MARK__: PropTypes.string,
  },
  data() {
    warning(
      this._ANT_MARK__ === ANT_MARK,
      'LocaleProvider',
      '`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead',
    );
    return {
      antLocale: {
        ...this.locale,
        exist: true,
      },
    };
  },
  watch: {
    locale(val) {
      this.antLocale = {
        ...val,
        exist: true,
      };
      setMomentLocale(val);
      changeConfirmLocale(val && val.Modal);
    },
  },
  created() {
    provide('localeData', this.$data);
    const { locale } = this;
    setMomentLocale(locale);
    changeConfirmLocale(locale && locale.Modal);
  },
  beforeUnmount() {
    changeConfirmLocale();
  },
  render() {
    return getSlot(this);
  },
});

/* istanbul ignore next */
LocaleProvider.install = function(app: App) {
  app.component(LocaleProvider.name, LocaleProvider);
};

export default LocaleProvider;
