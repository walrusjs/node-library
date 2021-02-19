import { Parser, ParsedPackageNameOrError, ParsedPackageName } from './parser';

export class PackageName {
  private static readonly _parser: Parser = new Parser();

  public static tryParse(packageName: string): ParsedPackageNameOrError {
    return PackageName._parser.tryParse(packageName);
  }

  public static parse(packageName: string): ParsedPackageName {
    return this._parser.parse(packageName);
  }

  public static getScope(packageName: string): string {
    return this._parser.getScope(packageName);
  }

  public static getUnscopedName(packageName: string): string {
    return this._parser.getUnscopedName(packageName);
  }

  public static isValidName(packageName: string): boolean {
    return this._parser.isValidName(packageName);
  }

  public static validate(packageName: string): void {
    return this._parser.validate(packageName);
  }

  public static combineParts(scope: string, unscopedName: string): string {
    return this._parser.combineParts(scope, unscopedName);
  }
}
