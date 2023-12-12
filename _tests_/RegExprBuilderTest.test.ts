import {RegExprBuilder} from '../src/RegExprBuilder';
import {RegExpr} from "../src/RegExpr";

describe('RegExprBuilderTest', () => {
    let r: RegExprBuilder;

    beforeEach(() => {
        r = new RegExprBuilder();
    });

    test('RegExp', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(1)
            .of('p')
            .getRegExpr();

        expect(typeof regEx.getFlags()).toBe('string');
        expect(regEx.getFlags()).toBe('m');

        expect(typeof regEx.toString()).toBe('string');
        expect(typeof regEx.getExpression()).toBe('string');
    });

    test('Money', () => {
        const regEx: RegExpr = r
            .find('€')
            .min(1).digits()
            .then(',')
            .digit()
            .digit()
            .getRegExpr();

        expect(regEx.matches('€128,99')).toBe(true);
        expect(regEx.matches('€81,99')).toBe(true);

        expect(regEx.matches('€8,9')).toBe(false);
        expect(regEx.matches('12.123.8,99 €')).toBe(false);
    });

    test('Money2', () => {
        const regEx: RegExpr = r
            .find('€')
            .exactly(1).whitespace()
            .min(1).digits()
            .then('.')
            .exactly(3).digits()
            .then(',')
            .digit()
            .digit()
            .getRegExpr();

        expect(regEx.matches('€ 1.228,99')).toBe(true);
        expect(regEx.matches('€ 452.000,99')).toBe(true);

        expect(regEx.matches('€8,9')).toBe(false);
        expect(regEx.matches('12.123.8,99 €')).toBe(false);
    });

    test('AllMoney', () => {
        const regEx: RegExprBuilder = r
            .find("€")
            .min(1).digits()
            .then(",")
            .digit()
            .digit();

        expect(regEx.getRegExpr().matches("€128,99")).toBe(true);
        expect(regEx.getRegExpr().matches("€81,99")).toBe(true);

        const regEx2: RegExprBuilder = r
            .getNew()
            .find("€")
            .min(1).digits()
            .then(".")
            .exactly(3).digits()
            .then(",")
            .digit()
            .digit();

        expect(regEx2.getRegExpr().matches("€1.228,99")).toBe(true);
        expect(regEx2.getRegExpr().matches("€452.000,99")).toBe(true);

        const combined: RegExpr = r
            .getNew()
            .eitherFind(regEx)
            .orFind(regEx2)
            .getRegExpr();

        expect(combined.matches("€128,99")).toBe(true);
        expect(combined.matches("€81,99")).toBe(true);
        expect(combined.matches("€1.228,99")).toBe(true);
        expect(combined.matches("€452.000,99")).toBe(true);
    });

    test('Maybe', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .notDigit()
            .maybe("a")
            .getRegExpr();

        expect(regEx.matches("aabba1")).toBe(true);

        expect(regEx.matches("12aabba1")).toBe(false);
    });

    test('MaybeSome', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .notDigit()
            .maybeSome(["a", "b", "c"])
            .getRegExpr();

        expect(regEx.matches("aabba1")).toBe(true);

        expect(regEx.matches("12aabba1")).toBe(false);
    });

    test('Some', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .notDigit()
            .some(["a", "b", "c"])
            .getRegExpr();

        expect(regEx.matches("aabba1")).toBe(true);

        expect(regEx.matches("12aabba1")).toBe(false);
    });

    test('LettersDigits', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .min(3)
            .letters()
            .append(r.getNew().min(2).digits())
            .getRegExpr();

        expect(regEx.matches("asf24")).toBe(true);

        expect(regEx.matches("af24")).toBe(false);
        expect(regEx.matches("afs4")).toBe(false);
        expect(regEx.matches("234asas")).toBe(false);
    });

    test('NotLetter', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .notLetter()
            .getRegExpr();

        expect(regEx.matches("234asd")).toBe(true);
        expect(regEx.matches("asd425")).toBe(false);
    });

    test('NotLetters', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(1)
            .notLetters()
            .getRegExpr();

        expect(regEx.matches("234asd")).toBe(true);
        expect(regEx.matches("@234asd")).toBe(true);

        expect(regEx.matches("asd425")).toBe(false);
    });

    test('NotDigit', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .notDigit()
            .getRegExpr();

        expect(regEx.matches("a234asd")).toBe(true);

        expect(regEx.matches("45asd")).toBe(false);
    });

    test('NotDigits', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(1)
            .notDigits()
            .getRegExpr();

        expect(regEx.matches("a234asd")).toBe(true);
        expect(regEx.matches("@234asd")).toBe(true);

        expect(regEx.matches("425asd")).toBe(false);
    });

    test('Any', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .any()
            .getRegExpr();

        expect(regEx.matches("a.jpg")).toBe(true);
        expect(regEx.matches("a.b_asdasd")).toBe(true);
        expect(regEx.matches("4")).toBe(true);

        expect(regEx.matches("")).toBe(false);
    });

    test('OfAny', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2)
            .ofAny()
            .find("_")
            .getRegExpr();

        expect(regEx.matches("12_123123.jpg")).toBe(true);
        expect(regEx.matches("ab_asdasd")).toBe(true);

        expect(regEx.matches("425asd")).toBe(false);
    });

    test('OfAny2', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(3).ofAny()
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("pqr")).toBe(true);
    });


    test('Anything', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .anything()
            .getRegExpr();

        expect(regEx.matches("a.jpg")).toBe(true);
        expect(regEx.matches("a.b_asdasd")).toBe(true);
        expect(regEx.matches("4")).toBe(true);
    });

    test('AnythingBut', () => {
        const regEx: RegExpr = r
            .startOfInput()
            .anythingBut("admin")
            .getRegExpr();

        expect(regEx.matches("a.jpg")).toBe(true);
        expect(regEx.matches("a.b_asdasd")).toBe(true);
        expect(regEx.matches("4")).toBe(true);

        expect(regEx.matches("admin")).toBe(false);
    });

    test('AnythingBut2', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .anythingBut("Y")
            .getRegExpr();

        expect(regEx.matches("a.jpg")).toBe(true);
        expect(regEx.matches("a.b_asdasd")).toBe(true);
        expect(regEx.matches("4")).toBe(true);

        expect(regEx.matches("YY")).toBe(false);
        expect(regEx.matches("Y")).toBe(false);
    });

    test('NeitherNor', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .neither(r.getNew().exactly(1).of("milk"))
            .nor(r.getNew().exactly(1).of("juice"))
            .getRegExpr();

        expect(regEx.matches("beer")).toBe(true);

        expect(regEx.matches("milk")).toBe(false);
        expect(regEx.matches("juice")).toBe(false);
    });

    test('NeitherNor2', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .neither("milk")
            .min(0)
            .ofAny()
            .nor(r.getNew().exactly(1).of("juice"))
            .getRegExpr();

        expect(regEx.matches("beer")).toBe(true);

        expect(regEx.matches("milk")).toBe(false);
        expect(regEx.matches("juice")).toBe(false);
    });

    test('LowerCasew', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .lowerCaseLetter()
            .getRegExpr();

        expect(regEx.matches("a24")).toBe(true);

        expect(regEx.matches("234a")).toBe(false);
        expect(regEx.matches("A34")).toBe(false);
    });

    test('LowerCaseLetters', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2)
            .lowerCaseLetters()
            .getRegExpr();

        expect(regEx.matches("aa24")).toBe(true);

        expect(regEx.matches("aAa234a")).toBe(false);
        expect(regEx.matches("234a")).toBe(false);
        expect(regEx.matches("A34")).toBe(false);
    });

    test('UpperCaseLetter', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .upperCaseLetter()
            .getRegExpr();

        expect(regEx.matches("A24")).toBe(true);

        expect(regEx.matches("aa234a")).toBe(false);
        expect(regEx.matches("34aa")).toBe(false);
    });

    test('UpperCaseLetters', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2)
            .upperCaseLetters()
            .getRegExpr();

        expect(regEx.matches("AA24")).toBe(true);

        expect(regEx.matches("aAa234a")).toBe(false);
        expect(regEx.matches("234a")).toBe(false);
        expect(regEx.matches("a34")).toBe(false);
    });

    test('LetterDigit', () => {
        const regEx: RegExpr = r
            .ignoreCase()
            .globalMatch()
            .startOfLine()
            .letter()
            .append(r.getNew().digit())
            .getRegExpr();

        expect(regEx.matches("a5")).toBe(true);

        expect(regEx.matches("5a")).toBe(false);
    });

    test('Tab', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .tab()
            .getRegExpr();

        expect(regEx.matches("\tp")).toBe(true);
        expect(regEx.matches("q\tp\t")).toBe(false);
        expect(regEx.matches("p\t")).toBe(false);
    });

    test('Tab2', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(1).of("p")
            .tab()
            .exactly(1).of("q")
            .getRegExpr();

        expect(regEx.matches("p\tq")).toBe(true);
    });

    test('Tabs', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2)
            .tabs()
            .getRegExpr();

        expect(regEx.matches("\t\tp")).toBe(true);

        expect(regEx.matches("\tp")).toBe(false);
        expect(regEx.matches("q\tp\t")).toBe(false);
        expect(regEx.matches("p\t")).toBe(false);
    });

    test('WhiteSpace', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2).whitespace()
            .then("p")
            .then("d")
            .then("r")
            .exactly(1).whitespace()
            .getRegExpr();

        expect(regEx.matches("  pdr ")).toBe(true);

        expect(regEx.matches(" pdr ")).toBe(false);
        expect(regEx.matches("  pd r ")).toBe(false);
        expect(regEx.matches(" p dr ")).toBe(false);
    });

    test('MoreWhiteSpace', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .whitespace()
            .then("p")
            .then("d")
            .then("r")
            .exactly(1).whitespace()
            .getRegExpr();

        expect(regEx.matches("\tpdr\t")).toBe(true);
    });

    test('NotWhitespace', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .notWhitespace()
            .getRegExpr();

        expect(regEx.matches("a234asd")).toBe(true);

        expect(regEx.matches(" 45asd")).toBe(false);
        expect(regEx.matches("\t45asd")).toBe(false);
    });

    test('NotWhitespace2', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .min(1)
            .notWhitespace()
            .getRegExpr();

        expect(regEx.matches("a234asd")).toBe(true);

        expect(regEx.matches(" 45asd")).toBe(false);
        expect(regEx.matches("\t45asd")).toBe(false);
    });

    test('LineBreak', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .lineBreak()
            .getRegExpr();

        expect(regEx.matches("\n\ra234asd")).toBe(true);
        expect(regEx.matches("\na234asd")).toBe(true);
        expect(regEx.matches("\ra234asd")).toBe(true);

        expect(regEx.matches(" 45asd")).toBe(false);
        expect(regEx.matches("\t45asd")).toBe(false);
    });

    test('LineBreaks', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .min(2)
            .lineBreaks()
            .getRegExpr();

        expect(regEx.matches("\n\ra234asd")).toBe(true);
        expect(regEx.matches("\n\na234asd")).toBe(true);
        expect(regEx.matches("\r\ra234asd")).toBe(true);

        expect(regEx.matches(" 45asd")).toBe(false);
        expect(regEx.matches("\t45asd")).toBe(false);
    });

    test('StartOfLine', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(1)
            .of("p")
            .getRegExpr();

        expect(regEx.matches("p")).toBe(true);
        expect(regEx.matches("qp")).toBe(false);
    });

    test('EndOfLine', () => {
        const regEx: RegExpr = r
            .exactly(1)
            .of("p")
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("p")).toBe(true);
        expect(regEx.matches("pq")).toBe(false);
    });

    test('EitherLikeOrLike', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .eitherFind(r.getNew().exactly(1).of("p"))
            .orFind(r.getNew().exactly(2).of("q"))
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("p")).toBe(true);
        expect(regEx.matches("qq")).toBe(true);

        expect(regEx.matches("pqq")).toBe(false);
        expect(regEx.matches("qqp")).toBe(false);
    });

    test('OrLikeChain', () => {
        const regEx: RegExpr = r
            .eitherFind(r.getNew().exactly(1).of("p"))
            .orFind(r.getNew().exactly(1).of("q"))
            .orFind(r.getNew().exactly(1).of("r"))
            .getRegExpr();

        expect(regEx.matches("p")).toBe(true);
        expect(regEx.matches("q")).toBe(true);
        expect(regEx.matches("r")).toBe(true);

        expect(regEx.matches("s")).toBe(false);
    });

    test('EitherOr', () => {
        const regEx: RegExpr = r
            .eitherFind("p")
            .orFind("q")
            .getRegExpr();

        expect(regEx.matches("p")).toBe(true);
        expect(regEx.matches("q")).toBe(true);

        expect(regEx.matches("r")).toBe(false);
    });

    test('AnyOf', () => {
        const regEx: RegExpr = r
            .anyOf(["abc", "def", "q", r.getNew().exactly(2).digits()])
            .getRegExpr();

        expect(regEx.matches("abc")).toBe(true);
        expect(regEx.matches("def")).toBe(true);
        expect(regEx.matches("22")).toBe(true);

        expect(regEx.matches("r")).toBe(false);
        expect(regEx.matches("1")).toBe(false);

        const regEx1: RegExpr = r
            .getNew()
            .anyOf([])
            .getRegExpr();

        expect(regEx1.matches("p")).toBe(true);
    });

    test('Exactly', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(3).of("p")
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("ppp")).toBe(true);

        expect(regEx.matches("pp")).toBe(false);
        expect(regEx.matches("pppp")).toBe(false);
    });

    test('Min', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .min(2).of("p")
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("pp")).toBe(true);
        expect(regEx.matches("ppp")).toBe(true);
        expect(regEx.matches("ppppppp")).toBe(true);

        expect(regEx.matches("p")).toBe(false);
    });

    test('Max', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .max(3).of("p")
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("p")).toBe(true);
        expect(regEx.matches("pp")).toBe(true);
        expect(regEx.matches("ppp")).toBe(true);

        expect(regEx.matches("pppp")).toBe(false);
        expect(regEx.matches("pppppppp")).toBe(false);
    });

    test('MinMax', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .min(3).max(7).of("p")
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("ppp")).toBe(true);
        expect(regEx.matches("ppppp")).toBe(true);
        expect(regEx.matches("ppppppp")).toBe(true);

        expect(regEx.matches("pp")).toBe(false);
        expect(regEx.matches("p")).toBe(false);
        expect(regEx.matches("pppppppp")).toBe(false);
        expect(regEx.matches("pppppppppppp")).toBe(false);
    });

    test('Of', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2).of("p p p ")
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("p p p p p p ")).toBe(true);

        expect(regEx.matches("p p p p pp")).toBe(false);
    });

    test('OfGroup', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(3).of("p").asGroup()
            .exactly(1).of("q").asGroup()
            .exactly(1).ofGroup(1)
            .exactly(1).ofGroup(2)
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("pppqpppq")).toBe(true);
    });

    test('GroupIncrement', () => {
        //aa--aa--
        const builder1 = r
            .exactly(2).of("a").asGroup()
            .exactly(2).of("-").asGroup()
            .exactly(1).ofGroup(1)
            .exactly(1).ofGroup(2);

        //bb--bb--
        const builder2 = r
            .getNew()
            .exactly(2).of("b").asGroup()
            .exactly(2).of("-").asGroup()
            .exactly(1).ofGroup(1)
            .exactly(1).ofGroup(2);

        const builder3 = r
            .getNew()
            .find("123");

        const regExp = r
            .getNew()
            .startOfInput()
            .append(builder1)
            .append(builder2)
            .append(builder3)
            .endOfInput()
            .getRegExpr();

        expect(regExp.matches("aa--aa--bb--bb--123")).toBe(true);

        expect(regExp.matches("def123abc")).toBe(false);
        expect(regExp.matches("abcabc")).toBe(false);
        expect(regExp.matches("abcdef312")).toBe(false);
    });

    test('NamedGroup', () => {
        const regEx: RegExpr = r
            .exactly(3).digits().asGroup('numbers')
            .getRegExpr();

        const res = new RegExp(regEx.getExpression()).exec("hello-123-abc")//regEx.findIn("hello-123-abc");
        expect(res?.groups).toHaveProperty('numbers');
    });

    test('From', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(3).from(["p", "q", "r"])
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("ppp")).toBe(true);
        expect(regEx.matches("qqq")).toBe(true);
        expect(regEx.matches("ppq")).toBe(true);
        expect(regEx.matches("rqp")).toBe(true);

        expect(regEx.matches("pyy")).toBe(false);
    });

    test('NotFrom', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(3).notFrom(["p", "q", "r"])
            .endOfLine()
            .getRegExpr();

        expect(regEx.matches("lmn")).toBe(true);

        expect(regEx.matches("mnq")).toBe(false);
    });

    test('Like', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .exactly(2).like(
                r.getNew()
                    .min(1).of("p")
                    .min(2).of("q")
            )
            .endOfLine()
            .getRegExpr();


        expect(regEx.matches("pqqpqq")).toBe(true);

        expect(regEx.matches("qppqpp")).toBe(false);
    });

    test('Reluctantly', () => {
        const regEx: RegExpr = r
            .exactly(2).of("p")
            .min(2).ofAny().reluctantly()
            .exactly(2).of("p")
            .getRegExpr();

        const matches = regEx.findIn("pprrrrpprrpp");
        expect(matches[0] == "pprrrrpp").toBe(true);
    });

    test('Ahead', () => {
        const regEx: RegExpr = r
            .exactly(1).of("dart")
            .ahead(r.getNew().exactly(1).of("lang"))
            .getRegExpr();

        expect(regEx.matches("dartlang")).toBe(true);
        expect(regEx.matches("dartlanglang")).toBe(true);
        expect(regEx.matches("langdartlang")).toBe(true);

        expect(regEx.matches("dartpqr")).toBe(false);
        expect(regEx.matches("langdart")).toBe(false);
    });

    test('NotAhead', () => {
        const regEx: RegExpr = r
            .exactly(1).of("dart")
            .notAhead(r.getNew().exactly(1).of("pqr"))
            .getRegExpr();

        expect(regEx.matches("dartlang")).toBe(true);

        expect(regEx.matches("dartpqr")).toBe(false);
    });

    test('AsGroup', () => {
        const regEx: RegExpr = r
            .min(1).max(3).of("p")
            .exactly(1).of("dart").asGroup()
            .exactly(1).from(["p", "q", "r"])
            .getRegExpr();

        const matches = regEx.findIn("pdartq");
        expect(matches[1] == "dart").toBe(true);
    });

    test('Optional', () => {
        const regEx: RegExpr = r
            .min(1).max(3).of("p")
            .exactly(1).of("dart")
            .optional(r.getNew().exactly(1).from(["p", "q", "r"]))
            .getRegExpr();

        expect(regEx.matches("pdartq")).toBe(true);
    });

    test('Delimiter', () => {
        const regEx: RegExpr = r
            .startOfInput()
            .exactly(3).digits()
            .exactly(1).of("/")
            .exactly(2).letters()
            .endOfInput()
            .getRegExpr();

        expect(regEx.matches("123/ab")).toBe(true);
    });

    test('Something', () => {
        const regEx: RegExpr = r
            .min(1).max(3).of("p")
            .something()
            .getRegExpr();

        expect(regEx.matches("pphelloq")).toBe(true);
        expect(regEx.matches("p")).toBe(false);
    });

    test('Alias', () => {
        const regEx: RegExpr = r
            .startOfLine()
            .upperCaseLetter()
            .getRegExpr();

        expect(regEx.matches("A24")).toBe(true);

        expect(regEx.exec("A45")).toHaveProperty('0');
        expect(regEx.findIn("A45")).toHaveProperty('0');
    });
});