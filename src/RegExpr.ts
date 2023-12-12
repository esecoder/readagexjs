export class RegExpr {
    private readonly _expr: string;
    private readonly _flags: string;

    constructor(expr: string, flags: string) {
        this._expr = expr;
        this._flags = flags;
    }

    getExpression(): string {
        return this._expr;
    }

    getFlags(): string {
        return this._flags;
    }

    matches(string: string): boolean {
        return new RegExp(this._expr, this._flags).test(string)
    }

    exec(haystack: string): any[] {
        return this.findIn(haystack);
    }

    findIn(haystack: string): any[] {
        let matches: string[] | undefined = new RegExp(this._expr, this._flags).exec(haystack)?.map(v => v)
        if (matches) {
            if (!matches[1] && matches[0] && Array.isArray(matches[0])) {
                return matches[0];
            }
            return matches;
        } else return []
    }

    replace(string: string, callback: (hit: string) => string): string {
        return string.replace(
            new RegExp(this._expr, this._flags),
            (hit: string) => callback(hit[0])
        );
    }
}