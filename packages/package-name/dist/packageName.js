"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageName = void 0;
const parser_1 = require("./parser");
class PackageName {
    static tryParse(packageName) {
        return PackageName._parser.tryParse(packageName);
    }
    static parse(packageName) {
        return this._parser.parse(packageName);
    }
    static getScope(packageName) {
        return this._parser.getScope(packageName);
    }
    static getUnscopedName(packageName) {
        return this._parser.getUnscopedName(packageName);
    }
    static isValidName(packageName) {
        return this._parser.isValidName(packageName);
    }
    static validate(packageName) {
        return this._parser.validate(packageName);
    }
    static combineParts(scope, unscopedName) {
        return this._parser.combineParts(scope, unscopedName);
    }
}
exports.PackageName = PackageName;
PackageName._parser = new parser_1.Parser();
