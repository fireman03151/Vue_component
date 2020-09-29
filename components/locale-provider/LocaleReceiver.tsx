import { inject, defineComponent, VNodeTypes, PropType } from 'vue';
import defaultLocaleData from './default';
import { Locale } from '.';

export interface LocaleReceiverProps {
  componentName?: string;
  defaultLocale?: Locale | Function;
  children: (locale: Locale, localeCode?: string, fullLocale?: Locale) => VNodeTypes;
}

interface LocaleInterface {
  [key: string]: any;
}

export default defineComponent({
  name: 'LocaleReceiver',
  props: {
    componentName: {
      type: String,
    },
    defaultLocale: {
      type: [Object, Function],
    },
    children: {
      type: Function as PropType<
        (locale: Locale, localeCode?: string, fullLocale?: Locale) => VNodeTypes
      >,
    },
  },
  setup() {
    return {
      localeData: inject('localeData', {}),
    };
  },
  methods: {
    getLocale() {
      const { componentName = 'global', defaultLocale } = this;
      const locale =
        defaultLocale || (defaultLocaleData as LocaleInterface)[componentName || 'global'];
      const { antLocale } = this.localeData;

      const localeFromContext = componentName && antLocale ? antLocale[componentName] : {};
      return {
        ...(typeof locale === 'function' ? locale() : locale),
        ...(localeFromContext || {}),
      };
    },

    getLocaleCode() {
      const { antLocale } = this.localeData;
      const localeCode = antLocale && antLocale.locale;
      // Had use LocaleProvide but didn't set locale
      if (antLocale && antLocale.exist && !localeCode) {
        return defaultLocaleData.locale;
      }
      return localeCode;
    },
  },
  render() {
    const { $slots } = this;
    const children = this.children || $slots.default;
    const { antLocale } = this.localeData;
    return children?.(this.getLocale(), this.getLocaleCode(), antLocale);
  },
});
