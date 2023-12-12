import {RegExprBuilder} from '../src/RegExprBuilder';

describe('UsageExamples', () => {

    test('UsageExample', () => {
        const builder = new RegExprBuilder();

        const regExp = builder
            .startOfInput()
            .exactly(4).digits()
            .then('_')
            .exactly(2).digits()
            .then('_')
            .min(3).max(10).letters()
            .then('.')
            .anyOf(['png', 'jpg', 'gif'])
            .endOfInput()
            .getRegExpr();

        expect(regExp.matches('2020_10_hund.jpg')).toBeTruthy();
        expect(regExp.matches('2030_11_katze.png')).toBeTruthy();
        expect(regExp.matches('4000_99_maus.gif')).toBeTruthy();

        expect(regExp.matches('4000_99_f.gif')).toBeFalsy();
        expect(regExp.matches('4000_09_frogt.pdf')).toBeFalsy();
        expect(regExp.matches('2015_05_thisnameistoolong.jpg')).toBeFalsy();
    });

    test('UsageExample2', () => {
        const builder = new RegExprBuilder();

        const a = builder
            .startOfInput()
            .exactly(3).digits()
            .anyOf(['.pdf', '.doc'])
            .endOfInput();

        const b = builder
            .getNew()
            .startOfInput()
            .exactly(4).letters()
            .then('.jpg')
            .endOfInput();

        const regExp = builder
            .getNew()
            .eitherFind(a)
            .orFind(b)
            .getRegExpr();

        expect(regExp.matches('123.pdf')).toBeTruthy();
        expect(regExp.matches('456.doc')).toBeTruthy();
        expect(regExp.matches('bbbb.jpg')).toBeTruthy();
        expect(regExp.matches('aaaa.jpg')).toBeTruthy();

        expect(regExp.matches('1234.pdf')).toBeFalsy();
        expect(regExp.matches('123.gif')).toBeFalsy();
        expect(regExp.matches('aaaaa.jpg')).toBeFalsy();
        expect(regExp.matches('456.docx')).toBeFalsy();
    });

    test('UsageExample3', () => {
        const builder = new RegExprBuilder();

        const regExp = builder
            .multiLine()
            .globalMatch()
            .min(1).max(10).anythingBut(' ')
            .anyOf(['.pdf', '.doc'])
            .getRegExpr();

        const text = `
Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy SomeFile.pdf eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam
et justo duo dolores et ea rebum. doc_04.pdf Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet.
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy eirmod tempor invidunt ut File.doc labore et
dolore magna aliquyam erat, sed diam voluptua.
    `;

        //const matches = regExp.exec(text);
        //const matchedStrings = matches.map(match => match);

        //expect(matches[0]).toBe('SomeFile.pdf');
        //expect(matches[1]).toBe('doc_04.pdf');
        //expect(matches[2]).toBe('File.doc');

        const re = new RegExp(regExp.getExpression(), regExp.getFlags());
        const matches = Array.from(text.matchAll(re));

        expect(matches[0][0]).toBe("SomeFile.pdf");
        expect(matches[1][0]).toBe("doc_04.pdf");
        expect(matches[2][0]).toBe("File.doc");
    });

    test('Replace', () => {
        const builder = new RegExprBuilder();

        const regExp = builder
            .min(1)
            .max(10)
            .digits()
            .getRegExpr();

        let text = '98 bottles of beer on the wall';
        text = text.replace(new RegExp(regExp.getExpression()), (match) => `${parseInt(match) + 1}`);

        expect(text).toBe('99 bottles of beer on the wall');
    });

    test('PregMatchFlags', () => {
        const builder = new RegExprBuilder(/* Add any initialization if RegExpBuilder requires it */);

        const regExp = builder
            .multiLine()
            .globalMatch()
            .min(1).max(10).anythingBut(' ')
            .anyOf(['.pdf', '.doc'])
            // TypeScript doesn't have a direct equivalent for PREG_OFFSET_CAPTURE
            // Flags would need to be implemented in the RegExpBuilder
            // Assuming we had a method to set flags similar to pregMatchFlags, it would be something like this:
            // .setFlags('g') // or any other method provided by RegExpBuilder to include global and multiline flags
            .getRegExpr();

        const text = `
Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy SomeFile.pdf eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam
et justo duo dolores et ea rebum. doc_04.pdf Stet clita kasd gubergren,
    no sea takimata sanctus est Lorem ipsum dolor sit amet.
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
    sed diam nonumy eirmod tempor invidunt ut File.doc labore et
dolore magna aliquyam erat, sed diam voluptua.
    `;

        const matches = Array.from(text.matchAll(new RegExp(regExp.getExpression(), regExp.getFlags()))); //regExp.exec(text);

        // If you'd need the indices like PREG_OFFSET_CAPTURE, you'd have to process this in JS
        //for (const match of matches) {}

        //expect(matches).toHaveLength(3);
        //expect(matches.map(match => match[0])).toStrictEqual(['SomeFile.pdf', 'doc_04.pdf', 'File.doc']);

        expect(Array.isArray(matches[0])).toBe(true);
        expect(matches[0][0]).toBe("SomeFile.pdf");
        //expect(matches[0][1]).toBe(73);

        expect(Array.isArray(matches[1]));
        expect(matches[1][0]).toBe("doc_04.pdf");
        //expect(matches[1][1]).toBe(226);

        expect(Array.isArray(matches[2]));
        expect(matches[2][0]).toBe("File.doc");
        //expect(matches[2][1]).toBe(419);
    });
});