import { CSSProperties, VNodeTypes } from 'vue';
import { createTypes, VueTypeValidableDef, VueTypesInterface } from 'vue-types';
const PropTypes = createTypes({
  func: undefined,
  bool: undefined,
  string: undefined,
  number: undefined,
  array: undefined,
  object: undefined,
  integer: undefined,
});

PropTypes.extend([
  {
    name: 'looseBool',
    getter: true,
    type: Boolean,
    default: undefined,
  },
  {
    name: 'style',
    getter: true,
    type: [String, Object],
    default: undefined,
  },
  {
    name: 'VNodeChild',
    getter: true,
    type: null,
  },
]);

export function withUndefined<T extends { default?: any }>(type: T): T {
  type.default = undefined;
  return type;
}

export default PropTypes as VueTypesInterface & {
  readonly looseBool: VueTypeValidableDef<boolean> & {
    default: undefined;
  };
  readonly style: VueTypeValidableDef<CSSProperties>;
  readonly VNodeChild: VueTypeValidableDef<VNodeTypes>;
};
