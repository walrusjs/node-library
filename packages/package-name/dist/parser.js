"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
/**
 * 用于验证和处理npm包名称的可配置的解析器，例如`@scope/my-package`或`my-package`
 */
class Parser {
    constructor(options = {}) {
        this._options = { ...options };
    }
    tryParse(packageName) {
        const result = {
            scope: '',
            unscopedName: '',
            error: ''
        };
        let input = packageName;
        if (input === null || input === undefined) {
            result.error = 'The package name must not be null or undefined';
            return result;
        }
        // Rule from npmjs.com:
        // "The name must be less than or equal to 214 characters. This includes the scope for scoped packages."
        if (packageName.length > 214) {
            // Don't attempt to parse a ridiculously long input
            result.error = 'The package name cannot be longer than 214 characters';
            return result;
        }
        if (input[0] === '@') {
            const indexOfScopeSlash = input.indexOf('/');
            if (indexOfScopeSlash <= 0) {
                result.scope = input;
                result.error = `Error parsing "${packageName}": The scope must be followed by a slash`;
                return result;
            }
            result.scope = input.substr(0, indexOfScopeSlash);
            input = input.substr(indexOfScopeSlash + 1);
        }
        result.unscopedName = input;
        if (result.scope === '@') {
            result.error = `Error parsing "${packageName}": The scope name cannot be empty`;
            return result;
        }
        if (result.unscopedName === '') {
            result.error = 'The package name must not be empty';
            return result;
        }
        // Rule from npmjs.com:
        // "The name can't start with a dot or an underscore."
        if (result.unscopedName[0] === '.' || result.unscopedName[0] === '_') {
            result.error = `The package name "${packageName}" starts with an invalid character`;
            return result;
        }
        // Convert "@scope/unscoped-name" --> "scopeunscoped-name"
        const nameWithoutScopeSymbols = (result.scope ? result.scope.slice(1, -1) : '') + result.unscopedName;
        if (!this._options.allowUpperCase) {
            if (result.scope !== result.scope.toLowerCase()) {
                result.error = `The package scope "${result.scope}" must not contain upper case characters`;
                return result;
            }
        }
        const match = nameWithoutScopeSymbols.match(Parser._invalidNameCharactersRegExp);
        if (match) {
            result.error = `The package name "${packageName}" contains an invalid character: "${match[0]}"`;
            return result;
        }
        return result;
    }
    parse(packageName) {
        const result = this.tryParse(packageName);
        if (result.error) {
            throw new Error(result.error);
        }
        return result;
    }
    getScope(packageName) {
        return this.parse(packageName).scope;
    }
    getUnscopedName(packageName) {
        return this.parse(packageName).unscopedName;
    }
    isValidName(packageName) {
        const result = this.tryParse(packageName);
        return !result.error;
    }
    validate(packageName) {
        this.parse(packageName);
    }
    combineParts(scope, unscopedName) {
        if (scope !== '') {
            if (scope[0] !== '@') {
                throw new Error('The scope must start with an "@" character');
            }
        }
        if (scope.indexOf('/') >= 0) {
            throw new Error('The scope must not contain a "/" character');
        }
        if (unscopedName[0] === '@') {
            throw new Error('The unscopedName cannot start with an "@" character');
        }
        if (unscopedName.indexOf('/') >= 0) {
            throw new Error('The unscopedName must not contain a "/" character');
        }
        let result;
        if (scope === '') {
            result = unscopedName;
        }
        else {
            result = scope + '/' + unscopedName;
        }
        // Make sure the result is a valid package name
        this.validate(result);
        return result;
    }
}
exports.Parser = Parser;
Parser._invalidNameCharactersRegExp = /[^A-Za-z0-9\-_\.]/;
