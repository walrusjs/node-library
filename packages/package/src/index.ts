import path from 'path';
import npa from 'npm-package-arg';
import { writePackage } from '@walrus/write-pkg';
import { loadJsonFile } from '@walrus/load-json-file';
import { binSafeName, shallowCopy } from './utils';

import type { PackageJson } from '@pansy/types';
import type { RelativeResult } from './types';

const PKG = Symbol('pkg');
const _location = Symbol('location');
const _resolved = Symbol('resolved');
const _rootPath = Symbol('rootPath');
const _scripts = Symbol('scripts');
const _contents = Symbol('contents');

export class Package {
  /** 包名称 */
  public name: string;
  /** 包信息 */
  private [PKG]: PackageJson;
  /** 包路径 */
  private [_location]: string;
  /** 项目根路径 */
  private [_rootPath]: string;
  /** 包命令集合 */
  private [_scripts]: PackageJson['scripts'];
  private [_resolved]: RelativeResult;

  private [_contents]: string;

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
    this[_rootPath] = rootPath;
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

  get(key: string) {
    return this[PKG][key];
  }

  set(key: string, val: any) {
    this[PKG][key] = val;

    return this;
  }

  toJSON() {
    return shallowCopy(this[PKG]);
  }

  /**
   * 刷新Pkg数据
   * @returns
   */
  refresh() {
    return loadJsonFile(this.manifestLocation).then((pkg) => {
      this[PKG] = pkg as unknown as PackageJson;

      return this;
    });
  }

  serialize() {
    return writePackage(this.manifestLocation, this[PKG]).then(() => this);
  }

  /**
   *
   * @param resolved 更新本地依赖
   * @param depVersion
   * @param savePrefix
   */
  updateLocalDependency(resolved: any, depVersion: string, savePrefix: string) {
    const depName = resolved.name;

    let depCollection = this.dependencies;

    if (!depCollection || !depCollection[depName]) {
      depCollection = this.optionalDependencies;
    }

    if (!depCollection || !depCollection[depName]) {
      depCollection = this.devDependencies;
    }

    if (resolved.registry || resolved.type === 'directory') {
      depCollection[depName] = `${savePrefix}${depVersion}`;
    } else if (resolved.gitCommittish) {
      const [tagPrefix] = /^\D*/.exec(resolved.gitCommittish);

      const { hosted } = resolved;
      hosted.committish = `${tagPrefix}${depVersion}`;

      depCollection[depName] = hosted.toString({ noGitPlus: false, noCommittish: false });
    } else if (resolved.gitRange) {
      const { hosted } = resolved;
      hosted.committish = `semver:${savePrefix}${depVersion}`;

      depCollection[depName] = hosted.toString({ noGitPlus: false, noCommittish: false });
    }
  }
}
