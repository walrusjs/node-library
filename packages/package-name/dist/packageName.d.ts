import { ParsedPackageNameOrError, ParsedPackageName } from './parser';
export declare class PackageName {
    private static readonly _parser;
    static tryParse(packageName: string): ParsedPackageNameOrError;
    static parse(packageName: string): ParsedPackageName;
    static getScope(packageName: string): string;
    static getUnscopedName(packageName: string): string;
    static isValidName(packageName: string): boolean;
    static validate(packageName: string): void;
    static combineParts(scope: string, unscopedName: string): string;
}
