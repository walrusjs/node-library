import path from 'path';
import npa from 'npm-package-arg';
import { binSafeName, shallowCopy } from './utils';

import type { PackageJson, $Keys } from '@pansy/types';
import type { RelativeResult, PackageKeys } from './types';

const PKG = Symbol('pkg');
const _location = Symbol('location');
const _resolved = Symbol('resolved');
const _rootPath = Symbol('rootPath');
const _scripts = Symbol('scripts');
const _contents = Symbol('contents');

export class Package {
  /** 包名称 */
  public name: string;
  private [PKG]: PackageJson;
  private [_location]: string;
  private [_rootPath]: string;
  private [_scripts]: PackageJson['scripts'];
  private [_resolved]: RelativeResult;

  private [_contents]: any;

  /**
   * 解析包并提供便捷的操作方法
   * @param pkg package.json 内容
   * @param location 包的目录地址
   * @param rootPath 项目跟路径
   */
  constructor(pkg: PackageJson = {} as PackageJson, location: string, rootPath = location) {
    const resolved = npa.resolve(pkg.name as string, `file:${path.relative(rootPath, location)}`, rootPath);

    this.name = pkg.name;
    this[PKG] = pkg;

    this[_location] = location;
    this[_resolved] = resolved;
    this[_scripts] = {
      ...pkg.scripts,
    };

    this[_resolved] = resolved;
  }

  get location() {
    return this[_location];
  }

  get private() {
    return Boolean(this[PKG].private);
  }

  get resolved() {
    return this[_resolved];
  }

  get rootPath() {
    return this[_rootPath];
  }

  get scripts() {
    return this[_scripts];
  }

  get bin() {
    const pkg = this[PKG];
    return typeof pkg.bin === 'string'
      ? {
          [binSafeName(this.resolved) as string]: pkg.bin,
        }
      : Object.assign({}, pkg.bin);
  }

  get binLocation() {
    return path.join(this.location, 'node_modules', '.bin');
  }

  get manifestLocation() {
    return path.join(this.location, 'package.json');
  }

  get nodeModulesLocation() {
    return path.join(this.location, 'node_modules');
  }

  get version() {
    return this[PKG].version as string;
  }

  set version(version: string) {
    this[PKG].version = version;
  }

  get contents() {
    if (this[_contents]) {
      return this[_contents];
    }

    if (this[PKG].publishConfig && this[PKG].publishConfig?.directory) {
      return path.join(this.location, this[PKG].publishConfig?.directory as string);
    }

    // default to package root
    return this.location;
  }

  set contents(subDirectory: string) {
    this[_contents] = path.join(this.location, subDirectory);
  }

  get dependencies() {
    return this[PKG].dependencies;
  }

  get devDependencies() {
    return this[PKG].devDependencies;
  }

  get optionalDependencies() {
    return this[PKG].optionalDependencies;
  }

  get peerDependencies() {
    return this[PKG].peerDependencies;
  }

  // @ts-ignores
  get(key: string) {
    return this[PKG][key as PackageKeys];
  }

  set(key: string, val: any) {
    this[PKG][key] = val;

    return this;
  }

  toJSON() {
    return shallowCopy(this[PKG]);
  }
}
