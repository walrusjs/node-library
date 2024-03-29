import path from 'path';
import fs, { promises as fsPromises } from 'fs';
import writeFileAtomic from 'write-file-atomic';
import sortKeys from 'sort-keys';
import detectIndent from 'detect-indent';
import isPlainObj from 'is-plain-obj';

import type { Options } from './types';

/**
 * 执行参数检查和参数默认值处理
 * @param function_
 * @param filePath
 * @param data
 * @param options
 * @returns
 */
const init = (function_, filePath: string, data: unknown, options: Options) => {
  if (!filePath) {
    throw new TypeError('Expected a filepath');
  }

  if (data === undefined) {
    throw new TypeError('Expected data to stringify');
  }

  options = {
    indent: '\t',
    sortKeys: false,
    ...options,
  };

  if (options.sortKeys && isPlainObj(data)) {
    data = sortKeys(data, {
      deep: true,
      compare: typeof options.sortKeys === 'function' ? options.sortKeys : undefined,
    });
  }

  return function_(filePath, data, options);
};

const main = async (filePath: string, data: unknown, options: Options) => {
  let { indent } = options;
  let trailingNewline = '\n';
  try {
    const file = await fsPromises.readFile(filePath, 'utf8');
    if (!file.endsWith('\n')) {
      trailingNewline = '';
    }

    if (options.detectIndent) {
      indent = detectIndent(file).indent;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const json = JSON.stringify(data, options.replacer, indent);

  return writeFileAtomic(filePath, `${json}${trailingNewline}`, { mode: options.mode, chown: false });
};

const mainSync = (filePath, data, options) => {
  let { indent } = options;
  let trailingNewline = '\n';
  try {
    const file = fs.readFileSync(filePath, 'utf8');
    if (!file.endsWith('\n')) {
      trailingNewline = '';
    }

    if (options.detectIndent) {
      indent = detectIndent(file).indent;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const json = JSON.stringify(data, options.replacer, indent);

  return writeFileAtomic.sync(filePath, `${json}${trailingNewline}`, {
    mode: options.mode,
    chown: false,
  });
};

/**
 * 写入JSON文件
 * @param filePath 文件路径
 * @param data 写入的内容
 * @param options 写入的配置
 */
export async function writeJsonFile(filePath: string, data: unknown, options?: Options) {
  await fsPromises.mkdir(path.dirname(filePath), {
    recursive: true,
  });
  await init(main, filePath, data, options);
}

export function writeJsonFileSync(filePath: string, data: unknown, options?: Options) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  init(mainSync, filePath, data, options);
}

export type { Options } from './types';
