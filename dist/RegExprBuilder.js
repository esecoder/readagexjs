"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegExprBuilder = void 0;
var RegExpr_1 = require("./RegExpr");
var RegExprBuilder = /** @class */ (function () {
    function RegExprBuilder() {
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
    RegExprBuilder.prototype.clear = function () {
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
    };
    RegExprBuilder.prototype.flushState = function () {
        if (this._of !== "" ||
            this._ofAny ||
            this._ofGroup > 0 ||
            this._from !== "" ||
            this._notFrom !== "" ||
            this._like !== null) {
            var captureLiteral = this._capture ? (this._captureName ? "?<".concat(this._captureName, ">") : "") : "?:";
            var quantityLiteral = this.getQuantityLiteral();
            var characterLiteral = this.getCharacterLiteral();
            var reluctantLiteral = this._reluctant ? "?" : "";
            this._literal.push("(".concat(captureLiteral, "(?:").concat(characterLiteral, ")").concat(quantityLiteral).concat(reluctantLiteral, ")"));
            this.clear();
        }
    };
    RegExprBuilder.prototype.getQuantityLiteral = function () {
        if (this._min !== -1) {
            if (this._max !== -1) {
                return "{".concat(this._min, ",").concat(this._max, "}");
            }
            return "{".concat(this._min, ",}");
        }
        return "{0,".concat(this._max, "}");
    };
    RegExprBuilder.prototype.getCharacterLiteral = function () {
        if (this._of !== "") {
            return this._of;
        }
        if (this._ofAny) {
            return ".";
        }
        if (this._ofGroup > 0) {
            return "\\".concat(this._ofGroup);
        }
        if (this._from !== "") {
            return "[".concat(this._from, "]");
        }
        if (this._notFrom !== "") {
            return "[^".concat(this._notFrom, "]");
        }
        if (this._like !== null) {
            return this._like;
        }
        return null;
    };
    RegExprBuilder.prototype.getLiteral = function () {
        this.flushState();
        return this._literal.join("");
    };
    RegExprBuilder.prototype.combineGroupNumberingAndGetLiteral = function (r) {
        var literal = this.incrementGroupNumbering(r.getLiteral(), this._groupsUsed);
        this._groupsUsed += r._groupsUsed;
        return literal;
    };
    RegExprBuilder.prototype.incrementGroupNumbering = function (literal, increment) {
        if (increment > 0) {
            literal = literal.replace(/\\(\d+)/g, function (groupReference, groupNumber) {
                groupNumber = parseInt(groupNumber) + increment;
                return "\\".concat(groupNumber);
            });
        }
        return literal;
    };
    RegExprBuilder.prototype.getRegExpr = function () {
        this.flushState();
        return new RegExpr_1.RegExpr(this._literal.join(""), this._flags);
    };
    RegExprBuilder.prototype.addFlag = function (flag) {
        if (!this._flags.includes(flag)) {
            this._flags += flag;
        }
        return this;
    };
    RegExprBuilder.prototype.ignoreCase = function () {
        return this.addFlag("i");
    };
    RegExprBuilder.prototype.multiLine = function () {
        return this.addFlag("m");
    };
    RegExprBuilder.prototype.globalMatch = function () {
        return this.addFlag("g");
    };
    //public pregMatchFlags(flags: string): this {
    //this._pregMatchFlags = flags;
    //return this;
    //}
    RegExprBuilder.prototype.startOfInput = function () {
        this._literal.push("(?:^)");
        return this;
    };
    RegExprBuilder.prototype.startOfLine = function () {
        this.multiLine();
        return this.startOfInput();
    };
    RegExprBuilder.prototype.endOfInput = function () {
        this.flushState();
        this._literal.push("(?:$)");
        return this;
    };
    RegExprBuilder.prototype.endOfLine = function () {
        this.multiLine();
        return this.endOfInput();
    };
    RegExprBuilder.prototype.eitherFind = function (r) {
        if (typeof r === "string") {
            return this.setEither(this.getNew().exactly(1).of(r));
        }
        return this.setEither(r);
    };
    RegExprBuilder.prototype.setEither = function (r) {
        this.flushState();
        this._either = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    };
    RegExprBuilder.prototype.orFind = function (r) {
        if (typeof r === "string") {
            return this.setOr(this.getNew().exactly(1).of(r));
        }
        return this.setOr(r);
    };
    RegExprBuilder.prototype.anyOf = function (r) {
        if (r.length < 1) {
            return this;
        }
        var firstToken = r.shift();
        this.eitherFind(firstToken);
        for (var _i = 0, r_1 = r; _i < r_1.length; _i++) {
            var token = r_1[_i];
            this.orFind(token);
        }
        return this;
    };
    RegExprBuilder.prototype.setOr = function (r) {
        var either = this._either;
        var or = this.combineGroupNumberingAndGetLiteral(r);
        if (either === null) {
            var lastOr = this._literal[this._literal.length - 1];
            lastOr = lastOr.substring(0, lastOr.length - 1);
            this._literal[this._literal.length - 1] = lastOr;
            this._literal.push("|(?:".concat(or, "))"));
        }
        else {
            this._literal.push("(?:(?:".concat(either, ")|(?:").concat(or, "))"));
        }
        this.clear();
        return this;
    };
    RegExprBuilder.prototype.neither = function (r) {
        if (typeof r === "string") {
            return this.notAhead(this.getNew().exactly(1).of(r));
        }
        return this.notAhead(r);
    };
    RegExprBuilder.prototype.nor = function (r) {
        if (this._min === 0 && this._ofAny) {
            this._min = -1;
            this._ofAny = false;
        }
        this.neither(r);
        return this.min(0).ofAny();
    };
    RegExprBuilder.prototype.exactly = function (n) {
        this.flushState();
        this._min = n;
        this._max = n;
        return this;
    };
    RegExprBuilder.prototype.min = function (n) {
        this.flushState();
        this._min = n;
        return this;
    };
    RegExprBuilder.prototype.max = function (n) {
        this.flushState();
        this._max = n;
        return this;
    };
    RegExprBuilder.prototype.of = function (s) {
        this._of = this.sanitize(s);
        return this;
    };
    RegExprBuilder.prototype.ofAny = function () {
        this._ofAny = true;
        return this;
    };
    RegExprBuilder.prototype.ofGroup = function (n) {
        this._ofGroup = n;
        return this;
    };
    RegExprBuilder.prototype.from = function (s) {
        this._from = this.sanitize(s.join(""));
        return this;
    };
    RegExprBuilder.prototype.notFrom = function (s) {
        this._notFrom = this.sanitize(s.join(""));
        return this;
    };
    RegExprBuilder.prototype.like = function (r) {
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    };
    RegExprBuilder.prototype.reluctantly = function () {
        this._reluctant = true;
        return this;
    };
    RegExprBuilder.prototype.ahead = function (r) {
        this.flushState();
        this._literal.push("(?=".concat(this.combineGroupNumberingAndGetLiteral(r), ")"));
        return this;
    };
    RegExprBuilder.prototype.notAhead = function (r) {
        this.flushState();
        this._literal.push("(?!".concat(this.combineGroupNumberingAndGetLiteral(r), ")"));
        return this;
    };
    RegExprBuilder.prototype.asGroup = function (name) {
        if (name === void 0) { name = null; }
        this._capture = true;
        this._captureName = name;
        this._groupsUsed++;
        return this;
    };
    RegExprBuilder.prototype.then = function (s) {
        return this.exactly(1).of(s);
    };
    RegExprBuilder.prototype.find = function (s) {
        return this.then(s);
    };
    RegExprBuilder.prototype.some = function (s) {
        return this.min(1).from(s);
    };
    RegExprBuilder.prototype.maybeSome = function (s) {
        return this.min(0).from(s);
    };
    RegExprBuilder.prototype.maybe = function (s) {
        return this.max(1).of(s);
    };
    RegExprBuilder.prototype.anything = function () {
        return this.min(0).ofAny();
    };
    RegExprBuilder.prototype.anythingBut = function (s) {
        if (s.length === 1) {
            return this.min(1).notFrom([s]);
        }
        this.notAhead(this.getNew().exactly(1).of(s));
        return this.min(0).ofAny();
    };
    RegExprBuilder.prototype.something = function () {
        return this.min(1).ofAny();
    };
    RegExprBuilder.prototype.any = function () {
        return this.exactly(1).ofAny();
    };
    RegExprBuilder.prototype.lineBreak = function () {
        this.flushState();
        this._literal.push("(?:\\r\\n|\\r|\\n)");
        return this;
    };
    RegExprBuilder.prototype.lineBreaks = function () {
        return this.like(this.getNew().lineBreak());
    };
    RegExprBuilder.prototype.whitespace = function () {
        if (this._min === -1 && this._max === -1) {
            this.flushState();
            this._literal.push("(?:\\s)");
            return this;
        }
        this._like = "\\s";
        return this;
    };
    RegExprBuilder.prototype.notWhitespace = function () {
        if (this._min === -1 && this._max === -1) {
            this.flushState();
            this._literal.push("(?:\\S)");
            return this;
        }
        this._like = "\\S";
        return this;
    };
    RegExprBuilder.prototype.tab = function () {
        this.flushState();
        this._literal.push("(?:\\t)");
        return this;
    };
    RegExprBuilder.prototype.tabs = function () {
        return this.like(this.getNew().tab());
    };
    RegExprBuilder.prototype.digit = function () {
        this.flushState();
        this._literal.push("(?:\\d)");
        return this;
    };
    RegExprBuilder.prototype.notDigit = function () {
        this.flushState();
        this._literal.push("(?:\\D)");
        return this;
    };
    RegExprBuilder.prototype.digits = function () {
        return this.like(this.getNew().digit());
    };
    RegExprBuilder.prototype.notDigits = function () {
        return this.like(this.getNew().notDigit());
    };
    RegExprBuilder.prototype.letter = function () {
        this.exactly(1);
        this._from = "A-Za-z";
        return this;
    };
    RegExprBuilder.prototype.notLetter = function () {
        this.exactly(1);
        this._notFrom = "A-Za-z";
        return this;
    };
    RegExprBuilder.prototype.letters = function () {
        this._from = "A-Za-z";
        return this;
    };
    RegExprBuilder.prototype.notLetters = function () {
        this._notFrom = "A-Za-z";
        return this;
    };
    RegExprBuilder.prototype.lowerCaseLetter = function () {
        this.exactly(1);
        this._from = "a-z";
        return this;
    };
    RegExprBuilder.prototype.lowerCaseLetters = function () {
        this._from = "a-z";
        return this;
    };
    RegExprBuilder.prototype.upperCaseLetter = function () {
        this.exactly(1);
        this._from = "A-Z";
        return this;
    };
    RegExprBuilder.prototype.upperCaseLetters = function () {
        this._from = "A-Z";
        return this;
    };
    RegExprBuilder.prototype.append = function (r) {
        this.exactly(1);
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    };
    RegExprBuilder.prototype.optional = function (r) {
        this.max(1);
        this._like = this.combineGroupNumberingAndGetLiteral(r);
        return this;
    };
    RegExprBuilder.prototype.sanitize = function (s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };
    RegExprBuilder.prototype.getNew = function () {
        var constructor = this.constructor;
        return new constructor();
    };
    return RegExprBuilder;
}());
exports.RegExprBuilder = RegExprBuilder;
//# sourceMappingURL=RegExprBuilder.js.map