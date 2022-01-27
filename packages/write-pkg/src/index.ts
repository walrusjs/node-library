import path from 'node:path';
import { writeJsonFile, writeJsonFileSync } from '@walrus/write-json-file';
import sortKeys from 'sort-keys';

import type { Options as BaseOptions } from '@walrus/write-json-file';

export interface Options extends BaseOptions {
  readonly normalize?: boolean;
}

const dependencyKeys = new Set(['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']);

function normalize(packageJson) {
  const result = {};

  for (const key of Object.keys(packageJson)) {
    if (!dependencyKeys.has(key)) {
      result[key] = packageJson[key];
    } else if (Object.keys(packageJson[key]).length > 0) {
      result[key] = sortKeys(packageJson[key]);
    }
  }

  return result;
}

export async function writePackage(filePath: string, data: unknown, options?: Options) {
  if (typeof filePath !== 'string') {
    options = data;
    data = filePath;
    filePath = '.';
  }

  options = {
    normalize: true,
    ...options,
    detectIndent: true,
  };

  filePath = path.basename(filePath) === 'package.json' ? filePath : path.join(filePath, 'package.json');

  data = options.normalize ? normalize(data) : data;

  return writeJsonFile(filePath, data, options);
}

export function writePackageSync(filePath: string, data: unknown, options?: Options) {
  if (typeof filePath !== 'string') {
    options = data;
    data = filePath;
    filePath = '.';
  }

  options = {
    normalize: true,
    ...options,
    detectIndent: true,
  };

  filePath = path.basename(filePath) === 'package.json' ? filePath : path.join(filePath, 'package.json');

  data = options.normalize ? normalize(data) : data;

  writeJsonFileSync(filePath, data, options);
}
