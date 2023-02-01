import type { App, PropType, Plugin, Ref, VNode } from 'vue';

// https://stackoverflow.com/questions/46176165/ways-to-get-string-literal-type-of-array-values-without-enum-overhead
export const tuple = <T extends string[]>(...args: T) => args;

export const tupleNum = <T extends number[]>(...args: T) => args;

/**
 * https://stackoverflow.com/a/59187769
 * Extract the type of an element of an array/tuple without performing indexing
 */
export type ElementOf<T> = T extends (infer E)[] ? E : T extends readonly (infer F)[] ? F : never;

/**
 * https://github.com/Microsoft/TypeScript/issues/29729
 */
export type LiteralUnion<T extends string> = T | (string & {});

export type Data = Record<string, unknown>;

export type Key = string | number;

type DefaultFactory<T> = (props: Data) => T | null | undefined;

export interface PropOptions<T = any, D = T> {
  type?: PropType<T> | true | null;
  required?: boolean;
  default?: D | DefaultFactory<D> | null | undefined | object;
  validator?(value: unknown): boolean;
}

declare type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;
export type VueNode = VNodeChildAtom | VNodeChildAtom[] | JSX.Element;

export const withInstall = <T>(comp: T) => {
  const c = comp as any;
  c.install = function (app: App) {
    app.component(c.displayName || c.name, comp);
  };

  return comp as T & Plugin;
};

export type MaybeRef<T> = T | Ref<T>;

export function eventType<T>() {
  return { type: [Function, Array] as PropType<T | T[]> };
}

export function objectType<T>(defaultVal?: any) {
  return { type: Object as PropType<T>, default: defaultVal as T };
}

export function booleanType(defaultVal?: any) {
  return { type: Boolean, default: defaultVal as boolean };
}

export function someType<T>(types: any[], defaultVal?: any) {
  return { type: types as PropType<T>, default: defaultVal as T };
}
