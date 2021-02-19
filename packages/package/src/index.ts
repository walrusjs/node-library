import path from 'path';
import { resolve, Result } from 'npm-package-arg';
import loadJsonFile from 'load-json-file';
import writePkg from 'write-pkg';
import { PackageJson, $Keys } from '@pansy/types';
import { LiteralUnion } from '@pansy/types/dist/literal-union';
import { binSafeName, shallowCopy } from './utils';

type KeyType = LiteralUnion<$Keys<PackageJson>, string>;

const PKG = Symbol('pkg');

class Package {
  private [PKG]: PackageJson;
  private _contents: string;
  readonly name: string;
  readonly rootPath: string;
  readonly location: string;
  readonly resolved: ReturnType<typeof resolve>
  readonly bin: Record<string, string>;
  public scripts: PackageJson['scripts'];
  readonly private: boolean;
  public manifestLocation: string;

  constructor(
    pkg: PackageJson, 
    location: string, 
    rootPath: string = location
  ) {
    const resolved = resolve(pkg.name, `file:${path.relative(rootPath, location)}`, rootPath);

    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: pkg.name,
      },
    });

    this.name = pkg.name;
    this[PKG] = pkg;
    this.location = location;
    this.rootPath = rootPath;
    this.resolved = resolved;
    this.scripts = Object.assign({}, pkg.scripts),
    this.bin = typeof pkg.bin === 'string'
      ? {
          [binSafeName(resolved)]: pkg.bin,
        }
      : Object.assign({}, pkg.bin);
    this.private = Boolean(pkg.private);
    this.manifestLocation = path.join(location, 'package.json')
  }

  get version() {
    return this[PKG].version;
  }

  set version(version: string) {
    this[PKG].version = version;
  }

  get contents() {
    if (this._contents) {
      return this._contents;
    }

    if (this[PKG].publishConfig && this[PKG].publishConfig.directory) {
      return path.join(this.location, this[PKG].publishConfig.directory as string);
    }

    return this.location;
  }

  set contents(subDirectory: string) {
    Object.defineProperty(this, '_contents', {
      value: path.join(this.location, subDirectory),
    });
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

  get(key: KeyType) {
    return this[PKG][key];
  }

  set(key: KeyType, val: any) {
    this[PKG][key] = val;

    return this;
  }

  toJSON() {
    return shallowCopy(this[PKG]);
  }

  refresh() {
    return loadJsonFile(this.manifestLocation).then(pkg => {
      // overwrite configurable property
      Object.defineProperty(this, PKG, {
        value: pkg,
      });

      return this;
    });
  }

  serialize() {
    // @ts-ignore
    return writePkg(this.manifestLocation, this[PKG]).then(() => this);
  }

  /**
   * 
   * @param resolved 
   * @param depVersion 
   * @param savePrefix 
   */
  updateLocalDependency(resolved: Result, depVersion: string, savePrefix: string) {
    const depName = resolved.name;

    // 首先尝试 dependencies
    let depCollection = this.dependencies;

    if (!depCollection || !depCollection[depName]) {
      depCollection = this.optionalDependencies;
    }

    // 退回到 devDependencies
    if (!depCollection || !depCollection[depName]) {
      depCollection = this.devDependencies;
    }

    if (resolved.registry || resolved.type === 'directory') {
      // a version (1.2.3) OR range (^1.2.3) OR directory (file:../foo-pkg)
      depCollection[depName] = `${savePrefix}${depVersion}`;
    } else if (resolved.gitCommittish) {
      // a git url with matching committish (#v1.2.3 or #1.2.3)
      const [tagPrefix] = /^\D*/.exec(resolved.gitCommittish);

      // update committish
      const { hosted } = resolved; // take that, lint!
      // @ts-ignore
      hosted.committish = `${tagPrefix}${depVersion}`;

      // always serialize the full url (identical to previous resolved.saveSpec)
      depCollection[depName] = hosted.toString();
    } else if (resolved.gitRange) {
      // a git url with matching gitRange (#semver:^1.2.3)
      const { hosted } = resolved; // take that, lint!
      // @ts-ignore
      hosted.committish = `semver:${savePrefix}${depVersion}`;

      // always serialize the full url (identical to previous resolved.saveSpec)
      depCollection[depName] = hosted.toString();
    }
  }
}

export default Package;