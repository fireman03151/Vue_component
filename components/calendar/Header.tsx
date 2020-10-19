import { defineComponent, inject, PropType } from 'vue';
import Select from '../select';
import { Group, Button } from '../radio';
import PropTypes from '../_util/vue-types';
import { defaultConfigProvider } from '../config-provider';
import { VueNode } from '../_util/type';

const { Option } = Select;

function getMonthsLocale(value: moment.Moment) {
  const current = value.clone();
  const localeData = value.localeData();
  const months = [];
  for (let i = 0; i < 12; i++) {
    current.month(i);
    months.push(localeData.monthsShort(current));
  }
  return months;
}
export interface RenderHeader {
  value: moment.Moment;
  onChange?: (value: moment.Moment) => void;
  type: string;
  onTypeChange: (type: string) => void;
}
export type HeaderRender = (headerRender: RenderHeader) => VueNode;
export const HeaderProps = {
  prefixCls: PropTypes.string,
  locale: PropTypes.any,
  fullscreen: PropTypes.looseBool,
  yearSelectOffset: PropTypes.number,
  yearSelectTotal: PropTypes.number,
  type: PropTypes.string,
  value: {
    type: Object as PropType<moment.Moment>,
  },
  validRange: {
    type: Array as PropType<moment.Moment[]>,
  },
  headerRender: PropTypes.func,
  onValueChange: PropTypes.func,
  onTypeChange: PropTypes.func,
};

export default defineComponent({
  name: 'CalendarHeader',
  inheritAttrs: false,
  props: {
    ...HeaderProps,
    yearSelectOffset: PropTypes.number.def(10),
    yearSelectTotal: PropTypes.number.def(20),
  },
  setup() {
    return {
      configProvider: inject('configProvider', defaultConfigProvider),
      calendarHeaderNode: undefined,
    };
  },
  // private calendarHeaderNode: HTMLDivElement;
  methods: {
    getYearSelectElement(prefixCls: string, year: number) {
      const { yearSelectOffset, yearSelectTotal, locale = {}, fullscreen, validRange } = this;
      let start = year - yearSelectOffset;
      let end = start + yearSelectTotal;
      if (validRange) {
        start = validRange[0].get('year');
        end = validRange[1].get('year') + 1;
      }
      const suffix = locale.year === '年' ? '年' : '';

      const options = [];
      for (let index = start; index < end; index++) {
        options.push(<Option key={`${index}`}>{(() => index + suffix)()}</Option>);
      }
      return (
        <Select
          size={fullscreen ? 'default' : 'small'}
          dropdownMatchSelectWidth={false}
          class={`${prefixCls}-year-select`}
          onChange={this.onYearChange}
          value={String(year)}
          getPopupContainer={() => this.calendarHeaderNode}
        >
          {options}
        </Select>
      );
    },

    getMonthSelectElement(prefixCls: string, month: number, months: number[]) {
      const { fullscreen, validRange, value } = this;
      const options = [];
      let start = 0;
      let end = 12;
      if (validRange) {
        const [rangeStart, rangeEnd] = validRange;
        const currentYear = value.get('year');
        if (rangeEnd.get('year') === currentYear) {
          end = rangeEnd.get('month') + 1;
        }
        if (rangeStart.get('year') === currentYear) {
          start = rangeStart.get('month');
        }
      }
      for (let index = start; index < end; index++) {
        options.push(<Option key={`${index}`}>{(() => months[index])()}</Option>);
      }

      return (
        <Select
          size={fullscreen ? 'default' : 'small'}
          dropdownMatchSelectWidth={false}
          class={`${prefixCls}-month-select`}
          value={String(month)}
          onChange={this.onMonthChange}
          getPopupContainer={() => this.calendarHeaderNode}
        >
          {options}
        </Select>
      );
    },

    onYearChange(year: string) {
      const { value, validRange } = this;
      const newValue = value.clone();
      newValue.year(parseInt(year, 10));
      // switch the month so that it remains within range when year changes
      if (validRange) {
        const [start, end] = validRange;
        const newYear = newValue.get('year');
        const newMonth = newValue.get('month');
        if (newYear === end.get('year') && newMonth > end.get('month')) {
          newValue.month(end.get('month'));
        }
        if (newYear === start.get('year') && newMonth < start.get('month')) {
          newValue.month(start.get('month'));
        }
      }
      this.$emit('valueChange', newValue);
    },

    onMonthChange(month: string) {
      const newValue = this.value.clone();
      newValue.month(parseInt(month, 10));
      this.$emit('valueChange', newValue);
    },

    onInternalTypeChange(e: Event) {
      this.triggerTypeChange((e.target as any).value);
    },

    triggerTypeChange(val: string) {
      this.$emit('typeChange', val);
    },
    getMonthYearSelections(getPrefixCls) {
      const { prefixCls: customizePrefixCls, type, value } = this.$props;

      const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);
      const yearReactNode = this.getYearSelectElement(prefixCls, value.year());
      const monthReactNode =
        type === 'month'
          ? this.getMonthSelectElement(prefixCls, value.month(), getMonthsLocale(value))
          : null;
      return {
        yearReactNode,
        monthReactNode,
      };
    },

    getTypeSwitch() {
      const { locale = {}, type, fullscreen } = this.$props;
      const size = fullscreen ? 'default' : 'small';
      return (
        <Group onChange={this.onInternalTypeChange} value={type} size={size}>
          <Button value="month">{locale.month}</Button>
          <Button value="year">{locale.year}</Button>
        </Group>
      );
    },
    triggerValueChange(...args: any[]) {
      this.$emit('valueChange', ...args);
    },
    saveCalendarHeaderNode(node: HTMLElement) {
      this.calendarHeaderNode = node;
    },
    headerRenderCustom(headerRender: HeaderRender) {
      const { type, value } = this.$props;
      return headerRender({
        value,
        type: type || 'month',
        onChange: this.triggerValueChange,
        onTypeChange: this.triggerTypeChange,
      });
    },
  },

  render() {
    const { prefixCls: customizePrefixCls, headerRender } = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);
    const typeSwitch = this.getTypeSwitch();
    const { yearReactNode, monthReactNode } = this.getMonthYearSelections(getPrefixCls);
    return headerRender ? (
      this.headerRenderCustom(headerRender)
    ) : (
      <div class={`${prefixCls}-header`} ref={this.saveCalendarHeaderNode as any}>
        {yearReactNode}
        {monthReactNode}
        {typeSwitch}
      </div>
    );
  },
});
