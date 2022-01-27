import path from 'path';
import os from 'os';
import { Package } from '../src/index';

const factory = (json) =>
  new Package(json, path.normalize(`/root/path/to/${json.name || 'package'}`), path.normalize('/root'));

describe('Package', () => {
  describe('get .location', () => {
    it('should return the location', () => {
      const pkg = factory({ name: 'get-location' });
      expect(pkg.location).toBe(path.normalize('/root/path/to/get-location'));
    });
  });

  describe('get .name', () => {
    const pkg = factory({ name: 'get-name' });

    expect(pkg.name).toBe('get-name');
  });

  describe('get .resolved', () => {
    it('returns npa.Result relative to rootPath, always posix', () => {
      const pkg = factory({ name: 'get-resolved' });

      expect(pkg.resolved).toMatchObject({
        type: 'directory',
        name: 'get-resolved',
        where: path.normalize('/root'),
        fetchSpec: path.resolve(os.homedir(), pkg.location),
      });
    });
  });

  describe('get .rootPath', () => {
    it('should return the rootPath', () => {
      const pkg = factory({ name: 'get-rootPath' });
      expect(pkg.rootPath).toBe(path.normalize('/root'));
    });
  });

  describe('get .version', () => {
    it('should return the version', () => {
      const pkg = factory({ version: '1.0.0' });
      expect(pkg.version).toBe('1.0.0');
    });
  });

  describe('set .version', () => {
    it('should set the version', () => {
      const pkg = factory({ version: '1.0.0' });
      pkg.version = '2.0.0';
      expect(pkg.version).toBe('2.0.0');
    });
  });

  describe('get .contents', () => {
    it('returns pkg.location by default', () => {
      const pkg = factory({ version: '1.0.0' });
      expect(pkg.contents).toBe(path.normalize('/root/path/to/package'));
    });

    it('returns pkg.publishConfig.directory when present', () => {
      const pkg = factory({
        version: '1.0.0',
        publishConfig: {
          directory: 'dist',
        },
      });
      expect(pkg.contents).toBe(path.normalize('/root/path/to/package/dist'));
    });

    it('returns pkg.location when pkg.publishConfig.directory is not present', () => {
      const pkg = factory({
        version: '1.0.0',
        publishConfig: {
          tag: 'next',
        },
      });
      expect(pkg.contents).toBe(path.normalize('/root/path/to/package'));
    });
  });

  describe('set .contents', () => {
    it('sets pkg.contents to joined value', () => {
      const pkg = factory({ version: '1.0.0' });
      pkg.contents = 'dist';
      expect(pkg.contents).toBe(path.normalize('/root/path/to/package/dist'));
    });
  });

  describe('get .bin', () => {
    it('should return the bin object', () => {
      const pkg = factory({
        name: 'obj-bin',
        bin: { 'custom-bin': 'bin.js' },
      });
      expect(pkg.bin).toEqual({ 'custom-bin': 'bin.js' });
    });

    it('returns a normalized object when pkg.bin is a string', () => {
      const pkg = factory({
        name: 'string-bin',
        bin: 'bin.js',
      });
      expect(pkg.bin).toEqual({ 'string-bin': 'bin.js' });
    });

    it('strips scope from normalized bin name', () => {
      const pkg = factory({
        name: '@scoped/string-bin',
        bin: 'bin.js',
      });
      expect(pkg.bin).toEqual({ 'string-bin': 'bin.js' });
    });
  });

  describe('get .dependencies', () => {
    it('should return the dependencies', () => {
      const pkg = factory({
        dependencies: { 'my-dependency': '^1.0.0' },
      });
      expect(pkg.dependencies).toEqual({ 'my-dependency': '^1.0.0' });
    });
  });

  describe('get .devDependencies', () => {
    it('should return the devDependencies', () => {
      const pkg = factory({
        devDependencies: { 'my-dev-dependency': '^1.0.0' },
      });
      expect(pkg.devDependencies).toEqual({ 'my-dev-dependency': '^1.0.0' });
    });
  });

  describe('get .optionalDependencies', () => {
    it('should return the optionalDependencies', () => {
      const pkg = factory({
        optionalDependencies: { 'my-optional-dependency': '^1.0.0' },
      });
      expect(pkg.optionalDependencies).toEqual({ 'my-optional-dependency': '^1.0.0' });
    });
  });

  describe('get .peerDependencies', () => {
    it('should return the peerDependencies', () => {
      const pkg = factory({
        peerDependencies: { 'my-peer-dependency': '>=1.0.0' },
      });
      expect(pkg.peerDependencies).toEqual({ 'my-peer-dependency': '>=1.0.0' });
    });
  });

  describe('get .scripts', () => {
    it('should return the scripts', () => {
      const pkg = factory({
        scripts: { 'my-script': "echo 'hello world'" },
      });

      expect(pkg.scripts).toEqual({
        'my-script': "echo 'hello world'",
      });
    });

    it('preserves immutability of the input', () => {
      const json = {
        scripts: { 'my-script': 'keep' },
      };
      const pkg = factory(json);

      pkg.scripts['my-script'] = 'tweaked';

      expect(pkg.scripts).toHaveProperty('my-script', 'tweaked');
      expect(json.scripts).toHaveProperty('my-script', 'keep');
    });
  });

  describe('get .private', () => {
    it('should indicate if the package is private', () => {
      const pkg = factory({ name: 'not-private' });
      expect(pkg.private).toBe(false);
    });
  });

  describe('.get()', () => {
    it('retrieves arbitrary values from manifest', () => {
      const pkg = factory({ name: 'gettable', 'my-value': 'foo' });

      expect(pkg.get('missing')).toBe(undefined);
      expect(pkg.get('my-value')).toBe('foo');
    });
  });

  describe('.set()', () => {
    it('stores arbitrary values on manifest', () => {
      const pkg = factory({ name: 'settable' });

      pkg.set('foo', 'bar');

      expect(pkg.toJSON()).toEqual({
        name: 'settable',
        foo: 'bar',
      });
    });

    it('is chainable', () => {
      const pkg = factory({ name: 'chainable' });

      expect(pkg.set('foo', true).set('bar', false).get('foo')).toBe(true);
    });
  });

  describe('.toJSON()', () => {
    it('should return clone of internal package for serialization', () => {
      const json = {
        name: 'is-cloned',
      };
      const pkg = factory(json);

      expect(pkg.toJSON()).not.toBe(json);
      expect(pkg.toJSON()).toEqual(json);

      const implicit = JSON.stringify(pkg, null, 2);
      const explicit = JSON.stringify(json, null, 2);

      expect(implicit).toBe(explicit);
    });
  });
});
