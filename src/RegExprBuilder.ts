import {RegExpr} from "./RegExpr";

export class RegExprBuilder {
    private _flags: string;
    //private _pregMatchFlags: string | null;
    private readonly _literal: string[];
    private _groupsUsed: number;
    private _min: number;
    private _max: number;
    private _of: string;
    private _ofAny: boolean;
    private _ofGroup: number;
    private _from: string;
    private _notFrom: string;
    private _like: string | null;
    private _either: string | null;
    private _reluctant: boolean;
    private _capture: boolean;
    private _captureName: string | null;

    constructor() {
        this._flags = "";
        //this._pregMatchFlags = null;
        this._literal = [];
        this._groupsUsed = 0;
        this._min = -1;
        this._max = -1;
        this._of = "";
        this._ofAny = false;
        this._ofGroup = -1;
        this._from = "";
        this._notFrom = "";
        this._like = null;
        this._either = null;
        this._reluctant = false;
        this._capture = false;
        this._captureName = null;
        this.clear();
    }

    public clear(): void {
        this._min = -1;
        this._max = -1;
        this._of = "";
        this._ofAny = false;
        this._ofGroup = -1;
        this._from = "";
        this._notFrom = "";
        this._like = null;
        this._either = null;
        this._reluctant = false;
        this._capture = false;
    }

    private flushState(): void {
        if (
            this._of !== "" ||
            this._ofAny ||
            this._ofGroup > 0 ||
            this._from !== "" ||
            this._notFrom !== "" ||
            this._like !== null
        ) {
            const captureLiteral = this._capture ? (this._captureName ? `?<${this._captureName}>` : "") : "?:";
            const quantityLiteral = this.getQuantityLiteral();
            const characterLiteral = this.getCharacterLiteral();
            const reluctantLiteral = this._reluctant ? "?" : "";
            this._literal.push(`(${captureLiteral}(?:${characterLiteral})${quantityLiteral}${reluctantLiteral})`);
            this.clear();
        }
    }

    private getQuantityLiteral(): string {
        if (this._min !== -1) {
            if (this._max !== -1) {
                return `{${this._min},${this._max}}`;
            }
            return `{${this._min},}`;
        }
        return `{0,${this._max}}`;
    }

    private getCharacterLiteral(): string | null {
        if (this._of !== "") {
            return this._of;
        }
        if (this._ofAny) {
            return ".";
        }
        if (this._ofGroup > 0) {
            return `\\${this._ofGroup}`;
        }
        if (this._from !== "") {
            return `[${this._from}]`;
        }
        if (this._notFrom !== "") {
            return `[^${this._notFrom}]`;
        }
        if (this._like !== null) {
            return this._like;
        }
        return null;
    }

    public getLiteral(): string {
        this.flushState();
        return this._literal.join("");
    }

    private combineGroupNumberingAndGetLiteral(r: RegExprBuilder): string {
        const literal = this.incrementGroupNumbering(r.getLiteral(), this._groupsUsed);
        this._groupsUsed += r._groupsUsed;
        return literal;
    }

    private incrementGroupNumbering(literal: string, increment: number): string {
        if (increment > 0) {
            literal = literal.replace(/\\(\d+)/g, (groupReference, groupNumber) => {
                groupNumber = parseInt(groupNumber) + increment;
                return `\\${groupNumber}`;
            });
        }
        return literal;
    }

    public getRegExpr(): RegExpr {
        this.flushState();
        return new RegExpr(this._literal.join(""), this._flags);
    }

    public addFlag(flag: string): this {
        if (!this._flags.includes(flag)) {
            this._flags += flag;
        }
        return this;
    }

    public ignoreCase(): this {
        return this.addFlag("i");
    }

    public multiLine(): this {
        return this.addFlag("m");
    }

    public globalMatch(): this {
        return this.addFlag("g");
    }

    //public pregMatchFlags(flags: string): this {
        //this._pregMatchFlags = flags;
        //return this;
    //}

    public startOfInput(): this {
        this._literal.push("(?:^)");
        return this;
    }

    public startOfLine(): this {
        this.multiLine();
        return this.startOfInput();
    }

    public endOfInput(): this {
        this.flushState();
        this._literal.push("(?:$)");
        return this;
    }

    public endOfLine(): this {
        this.multiLine();
        return this.endOfInput();
    }

    public eitherFind(r: RegExprBuilder | string): this {
        if (typeof r === "string") {
            return this.setEither(this.getNew().exactly(1).of(r));
        }
        return this.setEither(r);
    }

    public setEither(r: RegExprBuilder): this {
        this.flushState();
        this._either = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    public orFind(r: RegExprBuilder | string): this {
        if (typeof r === "string") {
            return this.setOr(this.getNew().exactly(1).of(r));
        }
        return this.setOr(r);
    }

    public anyOf(r: Array<RegExprBuilder | string>): this {
        if (r.length < 1) {
            return this;
        }
        const firstToken: RegExprBuilder | string = r.shift();
        this.eitherFind(firstToken);
        for (const token of r) {
            this.orFind(token);
        }
        return this;
    }

    public setOr(r: RegExprBuilder): this {
        const either = this._either;
        const or = this.combineGroupNumberingAndGetLiteral(r);
        if (either === null) {
            let lastOr = this._literal[this._literal.length - 1];
            lastOr = lastOr.substring(0, lastOr.length - 1);
            this._literal[this._literal.length - 1] = lastOr;
            this._literal.push(`|(?:${or}))`);
        } else {
            this._literal.push(`(?:(?:${either})|(?:${or}))`);
        }
        this.clear();
        return this;
    }

    public neither(r: RegExprBuilder | string): this {
        if (typeof r === "string") {
            return this.notAhead(this.getNew().exactly(1).of(r));
        }
        return this.notAhead(r);
    }

    public nor(r: RegExprBuilder | string): this {
        if (this._min === 0 && this._ofAny) {
            this._min = -1;
            this._ofAny = false;
        }
        this.neither(r);
        return this.min(0).ofAny();
    }

    public exactly(n: number): this {
        this.flushState();
        this._min = n;
        this._max = n;
        return this;
    }

    public min(n: number): this {
        this.flushState();
        this._min = n;
        return this;
    }

    public max(n: number): this {
        this.flushState();
        this._max = n;
        return this;
    }

    public of(s: string): this {
        this._of = this.sanitize(s);
        return this;
    }

    public ofAny(): this {
        this._ofAny = true;
        return this;
    }

    public ofGroup(n: number): this {
        this._ofGroup = n;
        return this;
    }

    public from(s: string[]): this {
        this._from = this.sanitize(s.join(""));
        return this;
    }

    public notFrom(s: string[]): this {
        this._notFrom = this.sanitize(s.join(""));
        return this;
    }

    public like(r: RegExprBuilder): this {
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    public reluctantly(): this {
        this._reluctant = true;
        return this;
    }

    public ahead(r: RegExprBuilder): this {
        this.flushState();
        this._literal.push(`(?=${this.combineGroupNumberingAndGetLiteral(r)})`);
        return this;
    }

    public notAhead(r: RegExprBuilder): this {
        this.flushState();
        this._literal.push(`(?!${this.combineGroupNumberingAndGetLiteral(r)})`);
        return this;
    }

    public asGroup(name: string | null = null): this {
        this._capture = true;
        this._captureName = name;
        this._groupsUsed++;
        return this;
    }

    public then(s: string): this {
        return this.exactly(1).of(s);
    }

    public find(s: string): this {
        return this.then(s);
    }

    public some(s: string[]): this {
        return this.min(1).from(s);
    }

    public maybeSome(s: string[]): this {
        return this.min(0).from(s);
    }

    public maybe(s: string): this {
        return this.max(1).of(s);
    }

    public anything(): this {
        return this.min(0).ofAny();
    }

    public anythingBut(s: string): this {
        if (s.length === 1) {
            return this.min(1).notFrom([s]);
        }
        this.notAhead(this.getNew().exactly(1).of(s));
        return this.min(0).ofAny();
    }

    public something(): this {
        return this.min(1).ofAny();
    }

    public any(): this {
        return this.exactly(1).ofAny();
    }

    public lineBreak(): this {
        this.flushState();
        this._literal.push("(?:\\r\\n|\\r|\\n)");
        return this;
    }

    public lineBreaks(): this {
        return this.like(this.getNew().lineBreak());
    }

    public whitespace(): this {
        if (this._min === -1 && this._max === -1) {
            this.flushState();
            this._literal.push("(?:\\s)");
            return this;
        }
        this._like = "\\s";
        return this;
    }

    public notWhitespace(): this {
        if (this._min === -1 && this._max === -1) {
            this.flushState();
            this._literal.push("(?:\\S)");
            return this;
        }
        this._like = "\\S";
        return this;
    }

    public tab(): this {
        this.flushState();
        this._literal.push("(?:\\t)");
        return this;
    }

    public tabs(): this {
        return this.like(this.getNew().tab());
    }

    public digit(): this {
        this.flushState();
        this._literal.push("(?:\\d)");
        return this;
    }

    public notDigit(): this {
        this.flushState();
        this._literal.push("(?:\\D)");
        return this;
    }

    public digits(): this {
        return this.like(this.getNew().digit());
    }

    public notDigits(): this {
        return this.like(this.getNew().notDigit());
    }

    public letter(): this {
        this.exactly(1);
        this._from = "A-Za-z";
        return this;
    }

    public notLetter(): this {
        this.exactly(1);
        this._notFrom = "A-Za-z";
        return this;
    }

    public letters(): this {
        this._from = "A-Za-z";
        return this;
    }

    public notLetters(): this {
        this._notFrom = "A-Za-z";
        return this;
    }

    public lowerCaseLetter(): this {
        this.exactly(1);
        this._from = "a-z";
        return this;
    }

    public lowerCaseLetters(): this {
        this._from = "a-z";
        return this;
    }

    public upperCaseLetter(): this {
        this.exactly(1);
        this._from = "A-Z";
        return this;
    }

    public upperCaseLetters(): this {
        this._from = "A-Z";
        return this;
    }

    public append(r: RegExprBuilder): this {
        this.exactly(1);
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    public optional(r: RegExprBuilder): this {
        this.max(1);
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    }

    private sanitize(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    public getNew(): RegExprBuilder {
        const constructor = this.constructor as typeof RegExprBuilder;
        return new constructor();
    }
}