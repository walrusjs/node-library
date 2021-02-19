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
export class Parser {
  private static readonly _invalidNameCharactersRegExp: RegExp = /[^A-Za-z0-9\-_\.]/;
  private readonly _options: ParserOptions;

  public constructor(options: ParserOptions = {}) {
    this._options = { ...options };
  }

  public tryParse(packageName: string): ParsedPackageNameOrError {
    const result: ParsedPackageNameOrError = {
      scope: '',
      unscopedName: '',
      error: ''
    };

    let input: string = packageName;

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
      const indexOfScopeSlash: number = input.indexOf('/');

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
    const nameWithoutScopeSymbols: string =
      (result.scope ? result.scope.slice(1, -1) : '') + result.unscopedName;
    
    if (!this._options.allowUpperCase) {
      if (result.scope !== result.scope.toLowerCase()) {
        result.error = `The package scope "${result.scope}" must not contain upper case characters`;
        return result;
      }
    }

    const match: RegExpMatchArray | null = nameWithoutScopeSymbols.match(
      Parser._invalidNameCharactersRegExp
    );

    if (match) {
      result.error = `The package name "${packageName}" contains an invalid character: "${match[0]}"`;
      return result;
    }

    return result;
  }

  public parse(packageName: string): ParsedPackageName {
    const result: ParsedPackageNameOrError = this.tryParse(packageName);
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }

  public getScope(packageName: string): string {
    return this.parse(packageName).scope;
  }

  public getUnscopedName(packageName: string): string {
    return this.parse(packageName).unscopedName;
  }

  public isValidName(packageName: string): boolean {
    const result: ParsedPackageNameOrError = this.tryParse(packageName);
    return !result.error;
  }

  public validate(packageName: string): void {
    this.parse(packageName);
  }

  public combineParts(scope: string, unscopedName: string): string {
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

    let result: string;
    if (scope === '') {
      result = unscopedName;
    } else {
      result = scope + '/' + unscopedName;
    }

    // Make sure the result is a valid package name
    this.validate(result);

    return result;
  }
}