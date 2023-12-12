"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegExpr = void 0;
var RegExpr = /** @class */ (function () {
    function RegExpr(expr, flags) {
        this._expr = expr;
        this._flags = flags;
    }
    RegExpr.prototype.getExpression = function () {
        return this._expr;
    };
    RegExpr.prototype.getFlags = function () {
        return this._flags;
    };
    RegExpr.prototype.matches = function (string) {
        return new RegExp(this._expr, this._flags).test(string);
    };
    RegExpr.prototype.exec = function (haystack) {
        return this.findIn(haystack);
    };
    RegExpr.prototype.findIn = function (haystack) {
        var _a;
        var matches = (_a = new RegExp(this._expr, this._flags).exec(haystack)) === null || _a === void 0 ? void 0 : _a.map(function (v) { return v; });
        if (matches) {
            if (!matches[1] && matches[0] && Array.isArray(matches[0])) {
                return matches[0];
            }
            return matches;
        }
        else
            return [];
    };
    RegExpr.prototype.replace = function (string, callback) {
        return string.replace(new RegExp(this._expr, this._flags), function (hit) { return callback(hit[0]); });
    };
    return RegExpr;
}());
exports.RegExpr = RegExpr;
//# sourceMappingURL=RegExpr.js.map