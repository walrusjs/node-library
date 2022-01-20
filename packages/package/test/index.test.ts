import path from 'path';
import { Package } from '../src/index';

const factory = (json) =>
  new Package(json, path.normalize(`/root/path/to/${json.name || 'package'}`), path.normalize('/root'));

describe('@walrus/package', () => {
  describe('get .name', () => {
    const pkg = factory({ name: 'get-name' });

    expect(pkg.name).toBe('get-name');
  });

  describe('get .location', () => {
    it('should return the location', () => {
      const pkg = factory({ name: 'get-location' });
      expect(pkg.location).toBe(path.normalize('/root/path/to/get-location'));
    });
  });
});
