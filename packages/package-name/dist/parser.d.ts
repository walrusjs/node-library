export interface ParsedPackageName {
    /**
     * 解析 npm scope，如果没有scope，则为空字符串。scope将始终包含`@`
     */
    scope: string;
    /**
     * 解析npm包的名称，不包含scope
     */
    unscopedName: string;
}
export interface ParsedPackageNameOrError extends ParsedPackageName {
    error: string;
}
export interface ParserOptions {
    allowUpperCase?: boolean;
}
/**
 * 用于验证和处理npm包名称的可配置的解析器，例如`@scope/my-package`或`my-package`
 */
export declare class Parser {
    private static readonly _invalidNameCharactersRegExp;
    private readonly _options;
    constructor(options?: ParserOptions);
    tryParse(packageName: string): ParsedPackageNameOrError;
    parse(packageName: string): ParsedPackageName;
    getScope(packageName: string): string;
    getUnscopedName(packageName: string): string;
    isValidName(packageName: string): boolean;
    validate(packageName: string): void;
    combineParts(scope: string, unscopedName: string): string;
}
