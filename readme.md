
# Branchless Batch

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

The project aims to convert expressions written in a minimalist language into batch script syntax. This minimalist language mimics JavaScript's operator precedence, allowing for concise expression definitions. The transpilation process involves translating expressions from the minimalist language into equivalent batch script code, maintaining consistency in behavior with JavaScript. Despite similarities in operator precedence, the minimalist language may lack certain features of JavaScript, which the transpiler addresses by providing alternative implementations or issuing warnings/errors. The main focus is on generating efficient and compatible batch script code, optimizing for minimal overhead and ensuring compatibility with the batch script execution environment. In summary, the project focuses on transpiling expressions from a minimalist language, aligned with JavaScript's precedence, into batch script syntax, with emphasis on efficiency and compatibility.


## Getting Started

1. Clone the repo
```
git clone
```
2. Install NPM packages
```
npm install
```
3. Start developement server
```
npm start
```
4. Build
```
npm run build
```


## Features

- Supported JavaScript Operators:
  - **Ternary** :  (cond ? expr1 : expr2)
  - **Logical Or** : ||
  - **Logical And** : &&
  - **Bitwise Or** : |
  - **Bitwise Xor** : ^
  - **Bitwise And** : &
  - **Equality** : ==, !=
  - **Relational** : <, >, <=, >=
  - **Bitshift** : <<, >>
  - **Term** : +, -
  - **Factor** : *, /, %
  - **Prefix** : -, +, ~, !
- Supported JavaScript Expressions:
  - **Ternary expression**
  - **Binary expression**
  - **Unary expression**
  - **Parenthesized expression**
  - **Call expression**
  - **Number Literal**
  - **Variable Literal**


## Roadmap

- [ ] Add more tests
- [ ] Add expressions minimizer
- [ ] Add UI options to configure the transpilation
- [ ] Fix bad error messages
- [ ] Refactor highlight
- [ ] Take care of maximum line length in batch script (8191 characters)


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Acknowledgements

 - [CodeMirror](https://codemirror.net/)
 - [Lezer](https://lezer.codemirror.net/)
 - [React](https://react.dev/)
 - [tailwindcss](https://tailwindcss.com/)
 - [webpack](https://webpack.js.org/)
 - [TypeScript](https://www.typescriptlang.org/)
