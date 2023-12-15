```asciidoc
.______       _______     ___       _______       ___       _______  __________   ___        __       _______.
|   _  \     |   ____|   /   \     |       \     /   \     /  _____||   ____\  \ /  /       |  |     /       |
|  |_)  |    |  |__     /  ^  \    |  .--.  |   /  ^  \   |  |  __  |  |__   \  V  /        |  |    |   (----`
|      /     |   __|   /  /_\  \   |  |  |  |  /  /_\  \  |  | |_ | |   __|   >   <   .--.  |  |     \   \    
|  |\  \----.|  |____ /  _____  \  |  '--'  | /  _____  \ |  |__| | |  |____ /  .  \  |  `--'  | .----)   |   
| _| `._____||_______/__/     \__\ |_______/ /__/     \__\ \______| |_______/__/ \__\  \______/  |_______/    
                                                                                                                                                     
```
## Human-readable regular expressions for Javascript
[![release](https://img.shields.io/github/v/release/esecoder/readagexjs?style=flat-square)](https://github.com/esecoder/readagexjs/releases)
![release](https://img.shields.io/badge/es6-blue?style=flat-square)
[![npm-publish](https://img.shields.io/github/actions/workflow/status/esecoder/readagexjs/npm-publish.yml?style=flat-square&color=lightgreen)](https://github.com/esecoder/readagexjs/actions)
[![release](https://img.shields.io/badge/coverage-100%25-lightgreen?style=flat-square)](https://github.com/esecoder/readagexjs/releases)


Javascript/Typescript port of `regexpbuilderPHP`

> RegExprBuilder integrates regular expressions into the programming language, thereby making them easy to read and maintain. Regular Expressions are created by using chained methods and variables such as arrays or strings.

## Installation

```bash
npm i readagexjs
```

Or download [the appropriate release](https://github.com/esecoder/readagexjs/releases/latest) and `require` or `import` `RegExprBuilder` and `RegExpr` from the package.


## Documentation

https://github.com/esecoder/readagexjs/wiki


## Examples

```typescript
import {RegExprBuilder} from "readagexjs";
import {RegExpr} from "readagexjs";

const builder = new RegExprBuilder();
```

### Validation

```typescript
const regExp = builder
    .startOfInput()
    .exactly(4).digits()
    .then("_")
    .exactly(2).digits()
    .then("_")
    .min(3).max(10).letters()
    .then(".")
    .anyOf(["png", "jpg", "gif"])
    .endOfInput()
    .getRegExpr();

//true
regExp.matches("2020_10_hund.jpg");
regExp.matches("2030_11_katze.png");
regExp.matches("4000_99_maus.gif");

//false
regExp.matches("123_00_nein.gif");
regExp.matches("4000_0_nein.pdf");
regExp.matches("201505_nein.jpg");
```

### Search

```typescript
const regExp = builder
    .multiLine()
    .globalMatch()
    .min(1).max(10).anythingBut(" ")
    .anyOf([".pdf", ".doc"])
    .getRegExpr();

const text = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
sed diam nonumy SomeFile.pdf eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam
et justo duo dolores et ea rebum. doc_04.pdf Stet clita kasd File.doc.'

const matches = regExp.findIn(text);

//true
(matches[0] === "SomeFile.pdf");
(matches[1] === "doc_04.pdf");
(matches[2] === "File.doc");
```

### Replace

```typescript
const regExp = builder
    .min(1)
    .max(10)
    .digits()
    getRegExpr();

const text = "98 bottles of beer on the wall";

text = regExp.replace(
    text,
    (match) => `${parseInt(match) + 1}`
);

//true
("99 bottles of beer on the wall" === text);
```

### Validation with multiple patterns

```typescript
const a = builder
    .startOfInput()
    .exactly(3).digits()
    .anyOf([".pdf", ".doc"])
    .endOfInput();

const b = builder
    .getNew()
    .startOfInput()
    .exactly(4).letters()
    .then(".jpg")
    .endOfInput();

const regExp = builder
    .getNew()
    .eitherFind($a)
    .orFind($b)
    .getRegExpr();

//true
regExp.matches("123.pdf");
regExp.matches("456.doc");
regExp.matches("bbbb.jpg");
regExp.matches("aaaa.jpg");

//false
regExp.matches("1234.pdf");
regExp.matches("123.gif");
regExp.matches("aaaaa.jpg");
regExp.matches("456.docx");
```
        
Take a look at the [tests](_tests_/RegExprBuilderTest.ts) for more examples
