import type { Ref } from 'vue';
import { computed } from 'vue';
import type { RawValueType, FlattenOptionsType, Key } from '../interface/generator';

export default function useCacheOptions<
  OptionType extends {
    value?: RawValueType;
    label?: any;
    key?: Key;
    disabled?: boolean;
  },
>(options: Ref) {
  const optionMap = computed(() => {
    const map: Map<RawValueType, FlattenOptionsType<OptionType>[number]> = new Map();
    options.value.forEach(item => {
      const { value } = item;
      map.set(value, item);
    });
    return map;
  });

  const getValueOption = (valueList: RawValueType[]) =>
    valueList.map(value => optionMap.value.get(value)).filter(Boolean);

  return getValueOption;
}
