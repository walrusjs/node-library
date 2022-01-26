export type Replacer = (this: unknown, key: string, value: unknown) => unknown;
export type SortKeys = (a: string, b: string) => number;

export interface Options {
  readonly indent?: string | number | undefined;
  readonly detectIndent?: boolean;
  readonly sortKeys?: boolean | SortKeys;
  readonly replacer?: Replacer | ReadonlyArray<number | string>;
  readonly mode?: number;
}
