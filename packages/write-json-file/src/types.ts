export type SortKeys = (a: string, b: string) => number;

export interface Options {
  /**
   * 缩进设置
   * @default '\t'
   */
  readonly indent?: string | number | undefined;
  /**
   * 检查缩进，如果文件存在则检查缩进
   * @default false
   */
  readonly detectIndent?: boolean;
  /**
   * 递归地对键进行排序
   */
  readonly sortKeys?: boolean | SortKeys;
  /**
   * 传入 JSON.stringify.
   */
  readonly replacer?: Parameters<typeof JSON.stringify>[1];
  /** 写入文件的模式 */
  readonly mode?: number;
}
