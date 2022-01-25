import { readFileSync, promises as fs } from 'fs';

const { readFile } = fs;

interface Options {
  beforeParse?: (data: string) => string;
  reviver?: (this: any, key: string, value: any) => any;
}

const parse = (buffer: Buffer, { beforeParse, reviver }: Options = {}) => {
  // Unlike `buffer.toString()` and `fs.readFile(path, 'utf8')`, `TextDecoder`` will remove BOM.
  let data = new TextDecoder().decode(buffer);

  if (typeof beforeParse === 'function') {
    data = beforeParse(data);
  }

  return JSON.parse(data, reviver);
};

/**
 * 加载Json文件
 * @param filePath
 * @param options
 * @returns
 */
export async function loadJsonFile(filePath: string, options?: Options) {
  const buffer = await readFile(filePath);
  return parse(buffer, options);
}

/**
 * 同步加载Json文件
 * @param filePath
 * @param options
 * @returns
 */
export function loadJsonFileSync(filePath: string, options?: Options) {
  const buffer = readFileSync(filePath);
  return parse(buffer, options);
}
