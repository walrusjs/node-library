export interface IParsedPackageName {
    /**
     * The parsed NPM scope, or an empty string if there was no scope.  The scope value will
     * always include the at-sign.
     * @remarks
     * For example, if the parsed input was "\@scope/example", then scope would be "\@scope".
     */
    scope: string;
    /**
     * The parsed NPM package name without the scope.
     * @remarks
     * For example, if the parsed input was "\@scope/example", then the name would be "example".
     */
    unscopedName: string;
}
