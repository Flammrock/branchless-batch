import Lexer from '../../../src/languages/nova/lexer'
import { TokenType } from '../../../src/languages/nova/token'

// TODO: check token.value too and token.line and token.column

describe('Lexer', () => {
  it('should return EOF token for empty source', () => {
    const lexer = new Lexer('')
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
  })

  it('should return EOF token for source that only have whitespaces', () => {
    const lexer = new Lexer('  \t  ')
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
    expect(lexer.next().type).toBe(TokenType.EndOfFile)
  })

  it('should throw error for invalid tokens', () => {
    expect(() => new Lexer(' [foo =  bar()  * 2   + 145').next().type).toThrow()
    expect(() => new Lexer('£').next().type).toThrow()
  })

  it('should tokenize source with multiple tokens', () => {
    {
      const lexer = new Lexer(' foo \r\n=  \rbar() \t* 2 \n  + 145')
      expect(lexer.next().type).toBe(TokenType.Identifier)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Assignment)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Identifier)
      expect(lexer.next().type).toBe(TokenType.LeftParenthesis)
      expect(lexer.next().type).toBe(TokenType.RightParenthesis)
      expect(lexer.next().type).toBe(TokenType.Multiply)
      expect(lexer.next().type).toBe(TokenType.Number)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Plus)
      expect(lexer.next().type).toBe(TokenType.Number)
      expect(lexer.next().type).toBe(TokenType.EndOfFile)
      expect(lexer.next().type).toBe(TokenType.EndOfFile)
    }
    {
      const lexer = new Lexer('foo\r\n=\rbar()*2\n+145')
      expect(lexer.next().type).toBe(TokenType.Identifier)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Assignment)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Identifier)
      expect(lexer.next().type).toBe(TokenType.LeftParenthesis)
      expect(lexer.next().type).toBe(TokenType.RightParenthesis)
      expect(lexer.next().type).toBe(TokenType.Multiply)
      expect(lexer.next().type).toBe(TokenType.Number)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Plus)
      expect(lexer.next().type).toBe(TokenType.Number)
      expect(lexer.next().type).toBe(TokenType.EndOfFile)
      expect(lexer.next().type).toBe(TokenType.EndOfFile)
    }
    {
      const lexer = new Lexer('+-*/%**+*^&&&,--|~||!!!-=)+((:)===<|<==>=**><<=<=+<=<!+!=!\n=< >>><<<>>?')
      expect(lexer.next().type).toBe(TokenType.Plus)
      expect(lexer.next().type).toBe(TokenType.Minus)
      expect(lexer.next().type).toBe(TokenType.Multiply)
      expect(lexer.next().type).toBe(TokenType.Divide)
      expect(lexer.next().type).toBe(TokenType.Remainder)
      expect(lexer.next().type).toBe(TokenType.Exponentiation)
      expect(lexer.next().type).toBe(TokenType.Plus)
      expect(lexer.next().type).toBe(TokenType.Multiply)
      expect(lexer.next().type).toBe(TokenType.Xor)
      expect(lexer.next().type).toBe(TokenType.LogicalAnd)
      expect(lexer.next().type).toBe(TokenType.And)
      expect(lexer.next().type).toBe(TokenType.Comma)
      expect(lexer.next().type).toBe(TokenType.Minus)

      expect(lexer.next().type).toBe(TokenType.Minus)
      expect(lexer.next().type).toBe(TokenType.Or)
      expect(lexer.next().type).toBe(TokenType.Not)
      expect(lexer.next().type).toBe(TokenType.LogicalOr)
      expect(lexer.next().type).toBe(TokenType.LogicalNot)
      expect(lexer.next().type).toBe(TokenType.LogicalNot)
      expect(lexer.next().type).toBe(TokenType.LogicalNot)
      expect(lexer.next().type).toBe(TokenType.Minus)
      expect(lexer.next().type).toBe(TokenType.Assignment)
      expect(lexer.next().type).toBe(TokenType.RightParenthesis)
      expect(lexer.next().type).toBe(TokenType.Plus)

      expect(lexer.next().type).toBe(TokenType.LeftParenthesis)
      expect(lexer.next().type).toBe(TokenType.LeftParenthesis)
      expect(lexer.next().type).toBe(TokenType.Colon)
      expect(lexer.next().type).toBe(TokenType.RightParenthesis)
      expect(lexer.next().type).toBe(TokenType.Equal)
      expect(lexer.next().type).toBe(TokenType.Assignment)
      expect(lexer.next().type).toBe(TokenType.LessThan)
      expect(lexer.next().type).toBe(TokenType.Or)
      expect(lexer.next().type).toBe(TokenType.LessThanOrEqual)
      expect(lexer.next().type).toBe(TokenType.Assignment)
      expect(lexer.next().type).toBe(TokenType.GreaterThanOrEqual)
      expect(lexer.next().type).toBe(TokenType.Exponentiation)
      expect(lexer.next().type).toBe(TokenType.GreaterThan)
      expect(lexer.next().type).toBe(TokenType.LeftShift)
      expect(lexer.next().type).toBe(TokenType.Assignment)

      expect(lexer.next().type).toBe(TokenType.LessThanOrEqual)
      expect(lexer.next().type).toBe(TokenType.Plus)
      expect(lexer.next().type).toBe(TokenType.LessThanOrEqual)
      expect(lexer.next().type).toBe(TokenType.LessThan)
      expect(lexer.next().type).toBe(TokenType.LogicalNot)
      expect(lexer.next().type).toBe(TokenType.Plus)
      expect(lexer.next().type).toBe(TokenType.NotEqual)
      expect(lexer.next().type).toBe(TokenType.LogicalNot)
      expect(lexer.next().type).toBe(TokenType.NewLine)
      expect(lexer.next().type).toBe(TokenType.Assignment)
      expect(lexer.next().type).toBe(TokenType.LessThan)
      expect(lexer.next().type).toBe(TokenType.ZeroFillRightShift)
      expect(lexer.next().type).toBe(TokenType.LeftShift)
      expect(lexer.next().type).toBe(TokenType.LessThan)
      expect(lexer.next().type).toBe(TokenType.SignedRightShift)
      expect(lexer.next().type).toBe(TokenType.QuestionMark)

      expect(lexer.next().type).toBe(TokenType.EndOfFile)
      expect(lexer.next().type).toBe(TokenType.EndOfFile)
    }
    {
      const lexer = new Lexer('+-*/%**+*^&&&,--|~||!!!-=)+((:)===<|<==>=**><<=<=+<=<!+!=!\n=< >>><<<>>?')
      expect(lexer.tokenize().map((token) => token.type)).toEqual([
        TokenType.Plus,
        TokenType.Minus,
        TokenType.Multiply,
        TokenType.Divide,
        TokenType.Remainder,
        TokenType.Exponentiation,
        TokenType.Plus,
        TokenType.Multiply,
        TokenType.Xor,
        TokenType.LogicalAnd,
        TokenType.And,
        TokenType.Comma,
        TokenType.Minus,
        TokenType.Minus,
        TokenType.Or,
        TokenType.Not,
        TokenType.LogicalOr,
        TokenType.LogicalNot,
        TokenType.LogicalNot,
        TokenType.LogicalNot,
        TokenType.Minus,
        TokenType.Assignment,
        TokenType.RightParenthesis,
        TokenType.Plus,
        TokenType.LeftParenthesis,
        TokenType.LeftParenthesis,
        TokenType.Colon,
        TokenType.RightParenthesis,
        TokenType.Equal,
        TokenType.Assignment,
        TokenType.LessThan,
        TokenType.Or,
        TokenType.LessThanOrEqual,
        TokenType.Assignment,
        TokenType.GreaterThanOrEqual,
        TokenType.Exponentiation,
        TokenType.GreaterThan,
        TokenType.LeftShift,
        TokenType.Assignment,
        TokenType.LessThanOrEqual,
        TokenType.Plus,
        TokenType.LessThanOrEqual,
        TokenType.LessThan,
        TokenType.LogicalNot,
        TokenType.Plus,
        TokenType.NotEqual,
        TokenType.LogicalNot,
        TokenType.NewLine,
        TokenType.Assignment,
        TokenType.LessThan,
        TokenType.ZeroFillRightShift,
        TokenType.LeftShift,
        TokenType.LessThan,
        TokenType.SignedRightShift,
        TokenType.QuestionMark,
        TokenType.EndOfFile
      ])
    }
  })
})
