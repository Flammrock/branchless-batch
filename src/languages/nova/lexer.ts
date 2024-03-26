/*********************************************************************************\
* Copyright (c) 2024 Flammrock                                                    *
*                                                                                 *
* Permission is hereby granted, free of charge, to any person obtaining a copy    *
* of this software and associated documentation files (the "Software"), to deal   *
* in the Software without restriction, including without limitation the rights    *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
* copies of the Software, and to permit persons to whom the Software is           *
* furnished to do so, subject to the following conditions:                        *
*                                                                                 *
* The above copyright notice and this permission notice shall be included in all  *
* copies or substantial portions of the Software.                                 *
*                                                                                 *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
* SOFTWARE.                                                                       *
\*********************************************************************************/

import Token, { TokenType } from './token'

interface LexerState {
  position: number
  line: number
  column: number
  currentChar: string | null
}

export interface LexerConfiguration {
  /**
   * Default: false
   */
  allowUnknowTokens: boolean
}

class Lexer {
  private input: string
  private position = 0
  private column = 1
  private line = 1
  private currentChar: string | null = null
  private state: Array<LexerState> = []
  private allowUnknowTokens = false

  constructor(input: string) {
    this.input = input
    this.currentChar = this.peek()
  }

  public configure(options: Partial<LexerConfiguration>): this {
    this.allowUnknowTokens = options.allowUnknowTokens ?? false
    return this
  }

  public reset(): void {
    this.position = 0
    this.line = 1
    this.column = 1
    this.state = []
    this.currentChar = this.peek()
  }

  private error(message: string, line: number, column: number, start: number): Token {
    if (this.allowUnknowTokens) {
      this.advance()
      return new Token(TokenType.Unknown, line, column, start, this.position)
    }
    throw new Error(message)
  }

  private peek(): string | null {
    return this.position < this.input.length ? this.input[this.position] : null
  }

  private advance(): string | null {
    this.position++
    this.column++
    if (this.currentChar === '\n') {
      this.column = 1
      this.line++
    }
    this.currentChar = this.peek()
    return this.currentChar
  }

  private skipWhitespace() {
    while (this.currentChar && this.isWhitespace(this.currentChar)) {
      this.advance()
    }
  }

  private isAlpha(c: string | null): boolean {
    return c !== null && /[a-zA-Z_]/.test(c)
  }

  private isWhitespace(c: string | null): boolean {
    return c == null || /[^\S\r\n]/.test(c)
  }

  private isNumeric(c: string | null): boolean {
    return c !== null && /[0-9]/.test(c)
  }

  public save(): void {
    this.state.push({ position: this.position, column: this.column, line: this.line, currentChar: this.currentChar })
  }

  public unsave(): void {
    this.state.pop()
  }

  public restore(): void {
    const state = this.state.pop()
    if (typeof state === 'undefined') throw new Error('Too much Lexer.restore().')
    this.position = state.position
    this.line = state.line
    this.column = state.column
    this.currentChar = state.currentChar
  }

  public next(): Token {
    while (this.currentChar !== null) {
      if (this.isWhitespace(this.currentChar)) {
        this.skipWhitespace()
        continue
      }

      const line = this.line
      const column = this.column
      const start = this.position

      if (this.isAlpha(this.currentChar)) {
        let identifier = ''
        while (this.isAlpha(this.currentChar)) {
          identifier += this.currentChar
          this.advance()
        }
        return new Token(TokenType.Identifier, line, column, start, this.position, identifier)
      }

      if (this.isNumeric(this.currentChar)) {
        let number = ''
        while (this.isNumeric(this.currentChar)) {
          number += this.currentChar
          this.advance()
        }
        return new Token(TokenType.Number, line, column, start, this.position, parseInt(number))
      }

      if (this.currentChar === ';') {
        let text = ''
        let n = 0
        while (true) {
          if (this.currentChar === '\n' || !this.currentChar) break
          if (this.currentChar !== '\r' && n > 0) {
            if (n != 1 || this.currentChar !== ' ') text += this.currentChar
          }
          this.currentChar = this.advance()
          n++
        }
        return new Token(TokenType.Comment, line, column, start, this.position, text)
      }

      switch (this.currentChar) {
        case '=':
          this.advance()
          if (this.currentChar === '=') {
            this.advance()
            return new Token(TokenType.Equal, line, column, start, this.position)
          }
          return new Token(TokenType.Assignment, line, column, start, this.position)
        case '(':
          this.advance()
          return new Token(TokenType.LeftParenthesis, line, column, start, this.position)
        case ')':
          this.advance()
          return new Token(TokenType.RightParenthesis, line, column, start, this.position)
        case '+':
          this.advance()
          return new Token(TokenType.Plus, line, column, start, this.position)
        case '-':
          this.advance()
          return new Token(TokenType.Minus, line, column, start, this.position)
        case '*':
          this.advance()
          if (this.currentChar === '*') {
            this.advance()
            return new Token(TokenType.Exponentiation, line, column, start, this.position)
          }
          return new Token(TokenType.Multiply, line, column, start, this.position)
        case '/':
          this.advance()
          return new Token(TokenType.Divide, line, column, start, this.position)
        case '%':
          this.advance()
          return new Token(TokenType.Remainder, line, column, start, this.position)
        case ',':
          this.advance()
          return new Token(TokenType.Comma, line, column, start, this.position)
        case '&':
          this.advance()
          if (this.currentChar === '&') {
            this.advance()
            return new Token(TokenType.LogicalAnd, line, column, start, this.position)
          }
          return new Token(TokenType.And, line, column, start, this.position)
        case '|':
          this.advance()
          if (this.currentChar === '|') {
            this.advance()
            return new Token(TokenType.LogicalOr, line, column, start, this.position)
          }
          return new Token(TokenType.Or, line, column, start, this.position)
        case '!':
          this.currentChar = this.advance()
          switch (this.currentChar) {
            case '=':
              this.advance()
              return new Token(TokenType.NotEqual, line, column, start, this.position)
            default:
              return new Token(TokenType.LogicalNot, line, column, start, this.position)
          }
        case '~':
          this.advance()
          return new Token(TokenType.Not, line, column, start, this.position)
        case '^':
          this.advance()
          return new Token(TokenType.Xor, line, column, start, this.position)
        case '>':
          this.currentChar = this.advance()
          switch (this.currentChar) {
            case '>':
              this.currentChar = this.advance()
              switch (this.currentChar) {
                case '>':
                  this.advance()
                  return new Token(TokenType.ZeroFillRightShift, line, column, start, this.position)
                default:
                  return new Token(TokenType.SignedRightShift, line, column, start, this.position)
              }
            case '=':
              this.advance()
              return new Token(TokenType.GreaterThanOrEqual, line, column, start, this.position)
            default:
              return new Token(TokenType.GreaterThan, line, column, start, this.position)
          }
        case '<':
          this.currentChar = this.advance()
          switch (this.currentChar) {
            case '<':
              this.advance()
              return new Token(TokenType.LeftShift, line, column, start, this.position)
            case '=':
              this.advance()
              return new Token(TokenType.LessThanOrEqual, line, column, start, this.position)
            default:
              return new Token(TokenType.LessThan, line, column, start, this.position)
          }
        case '?':
          this.advance()
          return new Token(TokenType.QuestionMark, line, column, start, this.position)
        case ':':
          this.advance()
          return new Token(TokenType.Colon, line, column, start, this.position)
        case '\r':
          this.currentChar = this.advance()
          if (this.currentChar === '\n') {
            this.advance()
            return new Token(TokenType.NewLine, line, column, start, this.position)
          }
          return new Token(TokenType.NewLine, line, column, start, this.position)
        case '\n':
          this.advance()
          return new Token(TokenType.NewLine, line, column, start, this.position)
        case '#':
          this.advance()
          return new Token(TokenType.Hash, line, column, start, this.position)
        default:
          return this.error(
            `Invalid character: ${JSON.stringify(this.currentChar)} at line=${this.line} and column=${this.column}`,
            line,
            column,
            start
          )
      }
    }
    return new Token(TokenType.EndOfFile, this.line, this.column, this.position, this.position)
  }

  public tokenize(): Array<Token> {
    const tokens: Array<Token> = []
    while (true) {
      const token = this.next()
      tokens.push(token)
      if (token.type === TokenType.EndOfFile) break
    }
    return tokens
  }
}

export default Lexer
