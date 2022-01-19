import type { RelativeResult } from './types';

export function binSafeName({ name, scope }: RelativeResult) {
  return scope ? name?.substring(scope.length + 1) : name;
}

export function shallowCopy(json: any) {
  return Object.keys(json).reduce((obj: any, key) => {
    const val = json[key];

    /* istanbul ignore if */
    if (Array.isArray(val)) {
      obj[key] = val.slice();
    } else if (val && typeof val === "object") {
      obj[key] = Object.assign({}, val);
    } else {
      obj[key] = val;
    }

    return obj;
  }, {});
}
