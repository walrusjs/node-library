export function binSafeName({ name, scope }: { name: string; scope: string }): string {
  return scope ? name.substring(scope.length + 1) : name;
}

export function shallowCopy(json) {
  return Object.keys(json).reduce((obj, key) => {
    const val = json[key];

    /* istanbul ignore if */
    if (Array.isArray(val)) {
      obj[key] = val.slice();
    } else if (val && typeof val === 'object') {
      obj[key] = Object.assign({}, val);
    } else {
      obj[key] = val;
    }

    return obj;
  }, {});
}
