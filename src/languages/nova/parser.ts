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

import AST, {
  BinaryOperator,
  CommentNode,
  ExpressionNode,
  FunctionParameterNode,
  OperatorNode,
  ProgramNode,
  StatementNode,
  SymbolDefinitionNode,
  TokenTypeToBinaryOperator,
  TokenTypeToUnaryOperator,
  UnaryOperator
} from './ast'
import Lexer from './lexer'
import Token, { TokenType } from './token'

interface ParserState {
  currentToken: Token
  previousToken: Token
  context: ParserContext
}

interface ParserContext {
  comments: Array<CommentNode>
}

export interface ParseOptions {
  /**
   * default: false
   */
  ignoreErrors: boolean
}

export default class Parser {
  private lexer: Lexer
  private currentToken: Token
  private previousToken: Token
  private state: Array<ParserState> = []
  private position = 0
  private shouldIgnoreErrors = false
  private context: ParserContext = { comments: [] }

  constructor(source: string) {
    this.lexer = new Lexer(source)
    this.currentToken = this.lexer.next()
    this.previousToken = this.currentToken
  }

  public reset(): void {
    this.lexer.reset()
    this.position = 0
    this.currentToken = this.lexer.next()
    this.previousToken = this.currentToken
    this.state = []
    this.context = { comments: [] }
  }

  public save(): void {
    this.lexer.save()
    this.state.push({
      currentToken: this.currentToken,
      previousToken: this.previousToken,
      context: { comments: this.context.comments.slice(0) }
    })
  }

  public unsave(): void {
    this.lexer.unsave()
    this.state.pop()
  }

  public restore(): void {
    const state = this.state.pop()
    if (typeof state === 'undefined') throw new Error('Too much Parser.restore().')
    this.lexer.restore()
    this.currentToken = state.currentToken
    this.previousToken = state.previousToken
    this.context = { comments: state.context.comments }
  }

  public parse(options?: ParseOptions): ProgramNode {
    this.shouldIgnoreErrors = options?.ignoreErrors ?? false
    this.reset()

    if (this.shouldIgnoreErrors) {
      this.lexer.configure({ allowUnknowTokens: true })
      let program = AST.Program([])
      try {
        program = this.program()
      } catch (e) {
        console.log(e)
        // TODO: track errors, use a report error
      }
      return program
    }

    this.lexer.configure({ allowUnknowTokens: false })
    return this.program()
  }

  private match(...types: Array<TokenType>): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private skipNewLine(): number {
    let n = 0
    while (this.match(TokenType.NewLine, TokenType.Comment)) {
      const token = this.previous()
      if (token.type === TokenType.NewLine) n++
      else if (token.type === TokenType.Comment)
        this.context.comments.push(AST.Comment(String(token.value ?? ''), AST.metadata(token.start, token.end)))
    }
    return n
  }

  private skipComments(): number {
    let n = 0
    while (this.match(TokenType.Comment)) {
      const token = this.previous()
      this.context.comments.push(AST.Comment(String(token.value ?? ''), AST.metadata(token.start, token.end)))
      n++
    }
    return n
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.currentToken.type === type
  }

  private isAtEnd(): boolean {
    return this.currentToken.type === TokenType.EndOfFile
  }

  private advance(): Token {
    this.position = this.currentToken.end
    this.previousToken = this.currentToken
    this.currentToken = this.lexer.next()
    return this.currentToken
  }

  private peek(): Token {
    return this.currentToken
  }

  private previous(): Token {
    return this.previousToken
  }

  private error(message: string): void {
    if (!this.shouldIgnoreErrors) throw new Error(message)
    while (this.match(TokenType.Unknown)) {}
  }

  private get precedence() {
    return {
      binary: (types: Array<TokenType>, sub: () => ExpressionNode | null): ExpressionNode | null => {
        if (this.isAtEnd()) return null
        this.skipNewLine()
        const starts = [this.peek().start]
        const left = sub.call(this)
        if (left === null) return null
        this.save()
        let needRestore = true
        this.skipNewLine()
        const members: Array<ExpressionNode> = [left]
        const ops: Array<Token> = []
        while (this.match(...types)) {
          if (needRestore) {
            needRestore = false
            this.unsave()
          }
          const op = this.previous()
          this.skipNewLine()
          ops.push(op)
          starts.push(this.peek().start)
          const member = sub.call(this)
          if (member === null) {
            if (needRestore) this.unsave()
            return null
          }
          members.push(member)
        }
        const end = members.length > 0 ? members[members.length - 1]?.metadata?.end ?? this.position : this.position
        if (members.length > 1) {
          const toStringOperator = (token: Token): OperatorNode<BinaryOperator> => {
            let op = '' as BinaryOperator
            if (this.shouldIgnoreErrors) {
              try {
                op = TokenTypeToBinaryOperator(token.type)
              } catch (e) {}
            } else {
              op = TokenTypeToBinaryOperator(token.type)
            }
            return AST.Operator(op, AST.metadata(token.start, token.end))
          }
          let expr = AST.BinaryExpression(
            members[members.length - 2],
            toStringOperator(ops[ops.length - 1]),
            members[members.length - 1],
            AST.metadata(starts[members.length - 2], end)
          )

          for (let i = members.length - 3; i >= 0; i--) {
            expr = AST.BinaryExpression(members[i], toStringOperator(ops[i]), expr, AST.metadata(starts[i], end))
          }

          return expr
        }
        this.restore()
        return left
      },
      unary: (types: Array<TokenType>, sub: () => ExpressionNode | null): ExpressionNode | null => {
        if (this.isAtEnd()) return null
        this.skipNewLine()
        const start = this.peek().start
        const toStringOperator = (token: Token): OperatorNode<UnaryOperator> => {
          let op = '' as UnaryOperator
          if (this.shouldIgnoreErrors) {
            try {
              op = TokenTypeToUnaryOperator(token.type)
            } catch (e) {}
          } else {
            op = TokenTypeToUnaryOperator(token.type)
          }
          return AST.Operator(op, AST.metadata(token.start, token.end))
        }
        if (this.match(...types)) {
          const op = this.previous()
          this.skipNewLine()
          const operator = toStringOperator(op)
          const operand = this.precedence.unary(types, sub)
          if (operand === null) return null
          const end = operand.metadata?.end ?? this.position
          return AST.UnaryExpression(operator, operand, AST.metadata(start, end))
        }
        this.skipNewLine()
        return sub.call(this)
      }
    }
  }

  private program(): ProgramNode {
    const statements: Array<StatementNode> = []
    const start = this.position
    let end: number | null = null
    let lastStatement: StatementNode | null = null
    while (true) {
      const n2 = this.skipComments()
      if (n2 > 0) {
        statements.push(...this.context.comments.map((c) => AST.CommentStatement(c)))
        this.context.comments = []
      }
      if (lastStatement !== null) statements.push(lastStatement)
      lastStatement = null
      if (this.isAtEnd()) {
        if (lastStatement !== null) statements.push(lastStatement)
        lastStatement = null
        break
      }
      if (statements.length > 0 && !this.match(TokenType.NewLine)) {
        this.error("'\\n' was expected.")
      }
      const emptyStart = this.position
      const n = this.skipNewLine()
      if (n > 0) statements.push(AST.EmptyStatement(n, AST.metadata(emptyStart, this.position)))
      if (this.isAtEnd()) break
      const statement = this.statement()
      if (statement === null) {
        this.context.comments = []
        continue
      }
      statements.push(...this.context.comments.map((c) => AST.CommentStatement(c)))
      lastStatement = statement
      this.context.comments = []
      end = statement.metadata?.end ?? this.position
    }
    statements.push(...this.context.comments.map((c) => AST.CommentStatement(c)))
    if (lastStatement !== null) statements.push(lastStatement)
    for (const statement of statements) {
      if (statement.type !== 'AssignmentStatement') continue
      const symbol = statement.symbol
      if (symbol.type !== 'FunctionDefinition') continue
      const lookUp: Record<string, boolean> = {}
      for (const param of symbol.params) {
        lookUp[param.name] = true
      }
      AST.visit(statement.expression, (node, parent, key) => {
        if (node.type !== 'IdentifierLiteral') return
        if (typeof lookUp[node.name] === 'undefined') return
        if (node.isGlobal) return
        parent[key] = AST.ArgumentIdentifier(node.name, node.metadata)
      })
    }
    return AST.Program(statements, AST.metadata(start, end ?? this.position))
  }

  private statement(): StatementNode | null {
    this.skipNewLine()
    const symbol = this.symbol()
    if (symbol === null) return null
    const start = symbol.metadata?.start ?? this.position
    this.skipNewLine()
    if (!this.match(TokenType.Assignment)) this.error("'=' was expected.")
    const assignOperator = this.previous()
    this.skipNewLine()
    const exp = this.expression()
    if (exp === null) {
      this.error('End of input.')
      return null
    }
    const end = exp.metadata?.end ?? this.position
    return AST.AssignmentStatement(
      symbol,
      AST.Operator('=', AST.metadata(assignOperator.start, assignOperator.end)),
      exp,
      AST.metadata(start, end)
    )
  }

  private expression(): ExpressionNode | null {
    this.skipNewLine()
    return this.ternary()
  }

  private ternary(): ExpressionNode | null {
    this.save()
    this.skipNewLine()
    if (this.isAtEnd()) {
      this.unsave()
      return null
    }
    const start = this.peek().start
    const cond = this.logicalOr()
    if (cond === null) {
      this.restore()
      return null
    }
    this.unsave()
    this.save()
    this.skipNewLine()
    if (!this.match(TokenType.QuestionMark)) {
      this.restore()
      return cond
    }
    const questionToken = this.previous()
    this.unsave()
    this.save()
    this.skipNewLine()
    const expr1 = this.expression()
    if (expr1 === null) {
      this.restore()
      return null
    }
    this.skipNewLine()
    if (!this.match(TokenType.Colon)) {
      this.error("Incomplete ternary operator, ':' was expected.")
      this.restore()
      return cond
    }
    const colonToken = this.previous()
    this.unsave()
    this.save()
    this.skipNewLine()
    const expr2 = this.expression()
    if (expr2 === null) {
      this.restore()
      return null
    }
    this.unsave()
    return AST.TernaryExpression(
      cond,
      AST.Operator('?', AST.metadata(questionToken.start, questionToken.end)),
      expr1,
      AST.Operator(':', AST.metadata(colonToken.start, colonToken.end)),
      expr2,
      AST.metadata(start, this.previous().end)
    )
  }

  private logicalOr(): ExpressionNode | null {
    return this.precedence.binary([TokenType.LogicalOr], this.logicalAnd)
  }

  private logicalAnd(): ExpressionNode | null {
    return this.precedence.binary([TokenType.LogicalAnd], this.bitwiseOr)
  }

  private bitwiseOr(): ExpressionNode | null {
    return this.precedence.binary([TokenType.Or], this.bitwiseXor)
  }

  private bitwiseXor(): ExpressionNode | null {
    return this.precedence.binary([TokenType.Xor], this.bitwiseAnd)
  }

  private bitwiseAnd(): ExpressionNode | null {
    return this.precedence.binary([TokenType.And], this.equality)
  }

  private equality(): ExpressionNode | null {
    return this.precedence.binary([TokenType.Equal, TokenType.NotEqual], this.relational)
  }

  private relational(): ExpressionNode | null {
    return this.precedence.binary(
      [TokenType.GreaterThan, TokenType.GreaterThanOrEqual, TokenType.LessThan, TokenType.LessThanOrEqual],
      this.bitshift
    )
  }

  private bitshift(): ExpressionNode | null {
    return this.precedence.binary(
      [TokenType.LeftShift, TokenType.SignedRightShift, TokenType.ZeroFillRightShift],
      this.term
    )
  }

  private term(): ExpressionNode | null {
    return this.precedence.binary([TokenType.Plus, TokenType.Minus], this.factor)
  }

  private factor(): ExpressionNode | null {
    return this.precedence.binary([TokenType.Multiply, TokenType.Divide, TokenType.Remainder], this.exponentiation)
  }

  private exponentiation(): ExpressionNode | null {
    return this.precedence.binary([TokenType.Exponentiation], this.prefix)
  }

  private prefix(): ExpressionNode | null {
    return this.precedence.unary([TokenType.Plus, TokenType.Minus, TokenType.LogicalNot, TokenType.Not], this.primary)
  }

  private primary(): ExpressionNode | null {
    this.skipNewLine()

    const token = this.peek()

    const start = token.start

    if (this.match(TokenType.Identifier, TokenType.Hash)) {
      let identifierToken = token
      const isGlobal = this.previous().type === TokenType.Hash
      if (isGlobal) {
        if (!this.match(TokenType.Identifier)) this.error("Expect an identifier after '#'.")
        identifierToken = this.previous()
      }
      const identifier = String(identifierToken.value) ?? '#UNDEFINED'
      this.save()
      this.skipNewLine()
      if (this.match(TokenType.LeftParenthesis)) {
        this.unsave()
        const args: Array<ExpressionNode> = []
        this.skipNewLine()
        while (true) {
          if (this.isAtEnd()) this.error("Expect ')' after expression.")
          this.skipNewLine()
          if (this.match(TokenType.RightParenthesis)) break
          this.skipNewLine()
          if (args.length > 0 && !this.match(TokenType.Comma)) {
            this.error("Expect ',' after argument.")
          }
          this.skipNewLine()
          const expr = this.expression()
          if (expr === null) {
            this.unsave()
            return null
          }
          args.push(expr)
        }
        this.unsave()
        return AST.CallExpression(
          AST.IdentifierLiteral(identifier, isGlobal, AST.metadata(start, token.end)),
          args,
          AST.metadata(start, this.previous().end)
        )
      }
      this.restore()
      return AST.IdentifierLiteral(identifier, isGlobal, AST.metadata(start, token.end))
    }

    if (this.match(TokenType.Number))
      return AST.NumberLiteral(Number(token.value) ?? 0, AST.metadata(start, this.previous().end))

    if (this.match(TokenType.LeftParenthesis)) {
      this.skipNewLine()
      const expr = this.expression()
      if (expr === null) return null
      this.skipNewLine()
      if (!this.match(TokenType.RightParenthesis)) this.error("Expect ')' after expression.")
      return AST.GroupingExpression(expr, AST.metadata(start, this.previous().end))
    }

    this.advance()
    this.error(`Unexpected token: '${TokenType[token.type]}' at line=${token.line}, column=${token.column}`)

    return null
  }

  private symbol(): SymbolDefinitionNode | null {
    this.skipNewLine()

    const token = this.peek()
    const start = token.start

    if (this.match(TokenType.Identifier)) {
      this.save()
      this.skipNewLine()
      if (this.match(TokenType.LeftParenthesis)) {
        this.unsave()
        const args: Array<FunctionParameterNode> = []
        while (true) {
          const n3 = this.skipNewLine()
          if (this.match(TokenType.RightParenthesis)) break
          let b1 = false
          let b2 = false
          if (this.isAtEnd()) this.error("Expect ')' after expression.")
          const n1 = this.skipNewLine() + n3
          if (args.length > 0 && !this.match(TokenType.Comma)) {
            this.error("Expect ',' after argument.")
            b1 = true
          }
          const n2 = this.skipNewLine()
          const identifier = this.peek()
          if (!this.match(TokenType.Identifier)) {
            this.error(`Identifier expected but got '${identifier.type}'`)
            b2 = true
          }
          if (n1 == 0 && n2 == 0 && b1 === true && b2 === true) return null
          args.push(
            AST.FunctionParameter(
              String(identifier.value) ?? '#UNDEFINED',
              AST.metadata(identifier.start, identifier.end)
            )
          )
        }
        return AST.FunctionDefinition(String(token.value) ?? '#UNDEFINED', args, AST.metadata(start, this.position))
      }
      this.restore()
      return AST.VariableDefinition(String(token.value) ?? '#UNDEFINED', AST.metadata(start, this.position))
    }

    this.advance()
    this.error('Symbol expected.')

    return null
  }
}
