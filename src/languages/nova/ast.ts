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

import { TokenType } from './token'

export interface NodeMetadata {
  start: number
  end: number
  length: number
}

export const EmptyNodeMetadata: NodeMetadata = {
  start: 0,
  end: 0,
  length: 0
}

export interface Node {
  type: string
  metadata?: NodeMetadata
}

export type BinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '**'
  | '%'
  | '&'
  | '|'
  | '^'
  | '&&'
  | '||'
  | '=='
  | '!='
  | '>='
  | '<='
  | '<'
  | '>'
  | '>>'
  | '>>>'
  | '<<'

export type UnaryOperator = '~' | '-' | '+' | '!'

export type Operator = BinaryOperator | UnaryOperator | '?:'

export interface CommentNode extends Node {
  type: 'Comment'
  text: string
}

export interface CommentStatementNode extends Node {
  type: 'CommentStatement'
  text: string
}

export interface IdentifierLiteralNode extends Node {
  type: 'IdentifierLiteral'
  name: string
  isGlobal: boolean
}

export interface NumberLiteralNode extends Node {
  type: 'NumberLiteral'
  value: number
}

export interface OperatorNode<OperatorType> extends Node {
  type: 'Operator'
  sign: OperatorType
}

export interface BinaryExpressionNode extends Node {
  type: 'BinaryExpression'
  operator: OperatorNode<BinaryOperator>
  left: ExpressionNode
  right: ExpressionNode
}

export interface UnaryExpressionNode extends Node {
  type: 'UnaryExpression'
  operator: OperatorNode<UnaryOperator>
  operand: ExpressionNode
}

export interface ParenthesizedExpressionNode extends Node {
  type: 'ParenthesizedExpression'
  expression: ExpressionNode
}

export interface CallExpressionNode extends Node {
  type: 'CallExpression'
  symbol: IdentifierLiteralNode
  args: Array<ExpressionNode>
}

export interface VariableDefinitionNode extends Node {
  type: 'VariableDefinition'
  name: string
}

export interface FunctionParameterNode extends Node {
  type: 'FunctionParameter'
  name: string
}

export interface ArgumentIdentifierNode extends Node {
  type: 'ArgumentIdentifier'
  name: string
}

export interface FunctionDefinitionNode extends Node {
  type: 'FunctionDefinition'
  name: string
  params: Array<FunctionParameterNode>
}

export interface TernaryExpressionNode extends Node {
  type: 'TernaryExpression'
  condition: ExpressionNode
  operators: [OperatorNode<'?'>, OperatorNode<':'>]
  expressions: [ExpressionNode, ExpressionNode]
}

export type SymbolDefinitionNode = VariableDefinitionNode | FunctionDefinitionNode

export interface AssignmentStatementNode extends Node {
  type: 'AssignmentStatement'
  symbol: SymbolDefinitionNode
  operator: OperatorNode<'='>
  expression: ExpressionNode
}

export interface EmptyStatementNode extends Node {
  type: 'EmptyStatement'
  size: number
}

export interface ProgramNode extends Node {
  type: 'Program'
  statements: Array<StatementNode>
}

export type ExpressionNode =
  | IdentifierLiteralNode
  | NumberLiteralNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | ParenthesizedExpressionNode
  | CallExpressionNode
  | ArgumentIdentifierNode
  | TernaryExpressionNode

export type StatementNode = AssignmentStatementNode | EmptyStatementNode | CommentStatementNode

export type NodeType =
  | CommentNode
  | ProgramNode
  | StatementNode
  | ExpressionNode
  | VariableDefinitionNode
  | FunctionDefinitionNode
  | FunctionParameterNode
  | OperatorNode<BinaryOperator>
  | OperatorNode<UnaryOperator>
  | OperatorNode<'='>
  | OperatorNode<'?'>
  | OperatorNode<':'>

export type TreeVisitor = (node: NodeType, parent: any, key: any) => void | undefined | boolean

export type NodeTypeName = NodeType['type']

export const NodeTypeId: Record<NodeTypeName, number> = {
  Program: 0,
  AssignmentStatement: 1,
  EmptyStatement: 2,
  BinaryExpression: 3,
  UnaryExpression: 4,
  CallExpression: 5,
  ParenthesizedExpression: 6,
  IdentifierLiteral: 7,
  TernaryExpression: 8,
  VariableDefinition: 9,
  FunctionDefinition: 10,
  FunctionParameter: 11,
  ArgumentIdentifier: 12,
  NumberLiteral: 13,
  Operator: 14,
  Comment: 15,
  CommentStatement: 16
}

export const TokenTypeToUnaryOperator = (tokenType: TokenType): UnaryOperator => {
  switch (tokenType) {
    case TokenType.Not:
      return '~'
    case TokenType.LogicalNot:
      return '!'
    case TokenType.Plus:
      return '+'
    case TokenType.Minus:
      return '-'
    default:
      throw new Error(`Unable to convert token type '${TokenType[tokenType]}' to unary operator.`)
  }
}

export const TokenTypeToBinaryOperator = (tokenType: TokenType): BinaryOperator => {
  switch (tokenType) {
    case TokenType.Plus:
      return '+'
    case TokenType.Minus:
      return '-'
    case TokenType.Multiply:
      return '*'
    case TokenType.Divide:
      return '/'
    case TokenType.Remainder:
      return '%'
    case TokenType.And:
      return '&'
    case TokenType.Or:
      return '|'
    case TokenType.Xor:
      return '^'
    case TokenType.LogicalAnd:
      return '&&'
    case TokenType.LogicalOr:
      return '||'
    case TokenType.Equal:
      return '=='
    case TokenType.NotEqual:
      return '!='
    case TokenType.GreaterThan:
      return '>'
    case TokenType.LessThan:
      return '<'
    case TokenType.GreaterThanOrEqual:
      return '>='
    case TokenType.LessThanOrEqual:
      return '<='
    case TokenType.Exponentiation:
      return '**'
    case TokenType.SignedRightShift:
      return '>>'
    case TokenType.ZeroFillRightShift:
      return '>>>'
    case TokenType.LeftShift:
      return '<<'
    default:
      throw new Error(`Unable to convert token type '${TokenType[tokenType]}' to binary operator.`)
  }
}

export const BinaryOperatorToTokenTypeName = (operator: BinaryOperator): string => {
  switch (operator) {
    case '+':
      return 'Plus'
    case '-':
      return 'Minus'
    case '*':
      return 'Multiply'
    case '/':
      return 'Divide'
    case '%':
      return 'Remainder'
    case '&':
      return 'And'
    case '|':
      return 'Or'
    case '^':
      return 'Xor'
    case '&&':
      return 'LogicalAnd'
    case '||':
      return 'LogicalOr'
    case '==':
      return 'Equal'
    case '!=':
      return 'NotEqual'
    case '>':
      return 'GreaterThan'
    case '<':
      return 'LessThan'
    case '>=':
      return 'GreaterThanOrEqual'
    case '<=':
      return 'LessThanOrEqual'
    case '**':
      return 'Exponentiation'
    case '>>':
      return 'SignedRightShift'
    case '>>>':
      return 'ZeroFillRightShift'
    case '<<':
      return 'LeftShift'
    default:
      throw new Error(`Unable to convert binary operator '${operator}' to its corresponding name.`)
  }
}

export const UnaryOperatorToTokenTypeName = (operator: UnaryOperator): string => {
  switch (operator) {
    case '~':
      return 'Not'
    case '!':
      return 'LogicalNot'
    case '+':
      return 'Plus'
    case '-':
      return 'Minus'
    default:
      throw new Error(`Unable to convert unary operator '${operator}' to its corresponding name.`)
  }
}

export const AST = {
  IdentifierLiteral: (name: string, isGlobal: boolean = false, metadata?: NodeMetadata): IdentifierLiteralNode => {
    return { type: 'IdentifierLiteral', name, isGlobal, metadata }
  },
  VariableDefinition: (name: string, metadata?: NodeMetadata): VariableDefinitionNode => {
    return { type: 'VariableDefinition', name, metadata }
  },
  FunctionDefinition: (
    name: string,
    params: Array<FunctionParameterNode>,
    metadata?: NodeMetadata
  ): FunctionDefinitionNode => {
    return { type: 'FunctionDefinition', name, params, metadata }
  },
  FunctionParameter: (name: string, metadata?: NodeMetadata): FunctionParameterNode => {
    return { type: 'FunctionParameter', name, metadata }
  },
  ArgumentIdentifier: (name: string, metadata?: NodeMetadata): ArgumentIdentifierNode => {
    return { type: 'ArgumentIdentifier', name, metadata }
  },
  NumberLiteral: (value: number, metadata?: NodeMetadata): NumberLiteralNode => {
    return { type: 'NumberLiteral', value, metadata }
  },
  Operator: <T extends string>(sign: T, metadata?: NodeMetadata): OperatorNode<T> => {
    return { type: 'Operator', sign, metadata }
  },
  UnaryExpression: (
    operator: OperatorNode<UnaryOperator>,
    operand: ExpressionNode,
    metadata?: NodeMetadata
  ): UnaryExpressionNode => {
    return {
      type: 'UnaryExpression',
      operator,
      operand,
      metadata
    }
  },
  BinaryExpression: (
    left: ExpressionNode,
    operator: OperatorNode<BinaryOperator>,
    right: ExpressionNode,
    metadata?: NodeMetadata
  ): BinaryExpressionNode => {
    return {
      type: 'BinaryExpression',
      left,
      operator,
      right,
      metadata
    }
  },
  GroupingExpression: (expression: ExpressionNode, metadata?: NodeMetadata): ParenthesizedExpressionNode => {
    return { type: 'ParenthesizedExpression', expression, metadata }
  },
  CallExpression: (
    name: string | IdentifierLiteralNode,
    args: Array<ExpressionNode>,
    metadata?: NodeMetadata
  ): CallExpressionNode => {
    return {
      type: 'CallExpression',
      symbol:
        typeof name === 'string'
          ? AST.IdentifierLiteral(
              name,
              false,
              typeof metadata !== 'undefined'
                ? {
                    start: metadata.start,
                    end: metadata.start + name.length,
                    length: name.length
                  }
                : undefined
            )
          : name,
      args,
      metadata
    }
  },
  TernaryExpression: (
    condition: ExpressionNode,
    questionMark: OperatorNode<'?'>,
    expressionA: ExpressionNode,
    colon: OperatorNode<':'>,
    expressionB: ExpressionNode,
    metadata?: NodeMetadata
  ): TernaryExpressionNode => {
    return {
      type: 'TernaryExpression',
      condition,
      operators: [questionMark, colon],
      expressions: [expressionA, expressionB],
      metadata
    }
  },
  AssignmentStatement: (
    symbol: SymbolDefinitionNode,
    operator: OperatorNode<'='>,
    expression: ExpressionNode,
    metadata?: NodeMetadata
  ): AssignmentStatementNode => {
    return { type: 'AssignmentStatement', symbol, operator, expression, metadata }
  },
  EmptyStatement: (size: number = 1, metadata?: NodeMetadata): EmptyStatementNode => {
    return { type: 'EmptyStatement', size, metadata }
  },
  Program: (statements: Array<StatementNode>, metadata?: NodeMetadata): ProgramNode => {
    return { type: 'Program', statements, metadata }
  },
  Comment: (text: string, metadata?: NodeMetadata): CommentNode => {
    return { type: 'Comment', text, metadata }
  },
  CommentStatement: (text: string | CommentNode, metadata?: NodeMetadata): CommentStatementNode => {
    if (typeof text === 'string') return { type: 'CommentStatement', text, metadata }
    return { type: 'CommentStatement', text: text.text, metadata: text.metadata }
  },
  metadata: (start: number, end: number): NodeMetadata => {
    return { start, end, length: end - start }
  },
  toString: (node: NodeType, showMetadata = true): string => {
    const metadataToString = (metadata?: NodeMetadata): string => {
      if (!showMetadata) return ''
      if (typeof metadata === 'undefined') return ''
      return `, AST.metadata(${metadata.start}, ${metadata.end})`
    }
    const aux = (current: NodeType): string => {
      switch (current.type) {
        case 'Program':
          return `AST.Program([${current.statements.map(aux).join(', ')}]${metadataToString(current.metadata)})`
        case 'AssignmentStatement':
          return `AST.AssignmentStatement(${aux(current.symbol)}, ${aux(current.operator)}, ${aux(current.expression)}${metadataToString(current.metadata)})`
        case 'EmptyStatement':
          return `AST.EmptyStatement(${current.size}${metadataToString(current.metadata)})`
        case 'ArgumentIdentifier':
          return `AST.ArgumentIdentifier(${JSON.stringify(current.name)}${metadataToString(current.metadata)})`
        case 'IdentifierLiteral':
          return `AST.IdentifierLiteral(${JSON.stringify(current.name)}, ${current.isGlobal ? 'true' : 'false'}${metadataToString(current.metadata)})`
        case 'VariableDefinition':
          return `AST.VariableDefinition(${JSON.stringify(current.name)}${metadataToString(current.metadata)})`
        case 'FunctionDefinition':
          return `AST.FunctionDefinition(${JSON.stringify(current.name)}, [${current.params.map(aux).join(', ')}]${metadataToString(current.metadata)})`
        case 'FunctionParameter':
          return `AST.FunctionParameter(${JSON.stringify(current.name)}${metadataToString(current.metadata)})`
        case 'BinaryExpression':
          return `AST.BinaryExpression(${aux(current.left)}, ${aux(current.operator)}, ${aux(current.right)}${metadataToString(current.metadata)})`
        case 'UnaryExpression':
          return `AST.UnaryExpression(${aux(current.operator)}, ${aux(current.operand)}${metadataToString(current.metadata)})`
        case 'CallExpression':
          return `AST.CallExpression(${aux(current.symbol)}, [${current.args.map(aux).join(', ')}]${metadataToString(current.metadata)})`
        case 'TernaryExpression':
          return `AST.TernaryExpression(${aux(current.condition)}, ${aux(current.operators[0])}, ${aux(current.expressions[0])}, ${aux(current.operators[1])}, ${aux(current.expressions[1])}${metadataToString(current.metadata)})`
        case 'NumberLiteral':
          return `AST.NumberLiteral(${current.value}${metadataToString(current.metadata)})`
        case 'ParenthesizedExpression':
          return `AST.GroupingExpression(${aux(current.expression)}${metadataToString(current.metadata)})`
        case 'Operator':
          return `AST.Operator(${JSON.stringify(current.sign)}${metadataToString(current.metadata)})`
        case 'Comment':
          return `AST.Comment(${JSON.stringify(current.text)}${metadataToString(current.metadata)})`
        case 'CommentStatement':
          return `AST.CommentStatement(${JSON.stringify(current.text)}${metadataToString(current.metadata)})`
      }
    }
    return aux(node)
  },
  clone: <T extends Node>(node: T): T => {
    const copy = (parent: any) => {
      if (parent === null) return null
      if (typeof parent !== 'object' && !Array.isArray(parent)) return parent
      if (Array.isArray(parent)) {
        const clone: any = []
        for (const value of parent) {
          clone.push(value === null ? value : typeof value === 'object' || Array.isArray(value) ? copy(value) : value)
        }
        return clone
      }
      const clone: any = {}
      for (const key in parent) {
        const value = parent[key]
        clone[key] = value === null ? value : typeof value === 'object' || Array.isArray(value) ? copy(value) : value
      }
      return clone
    }
    return copy(node) as T
  },
  children: (node: NodeType): Array<NodeType> => {
    switch (node.type) {
      case 'Program':
        return node.statements
      case 'AssignmentStatement':
        return [node.symbol, node.expression]
      case 'EmptyStatement':
        return []
      case 'IdentifierLiteral':
        return []
      case 'VariableDefinition':
        return []
      case 'FunctionParameter':
        return []
      case 'ArgumentIdentifier':
        return []
      case 'FunctionDefinition':
        return [...node.params]
      case 'BinaryExpression':
        return [node.left, node.operator, node.right]
      case 'UnaryExpression':
        return [node.operator, node.operand]
      case 'CallExpression':
        return [node.symbol, ...node.args]
      case 'TernaryExpression':
        return [node.condition, node.operators[0], node.expressions[0], node.operators[1], node.expressions[1]]
      case 'NumberLiteral':
        return []
      case 'ParenthesizedExpression':
        return [node.expression]
      case 'Operator':
        return []
      case 'Comment':
        return []
      case 'CommentStatement':
        return []
    }
  },
  visit: (node: NodeType, visitor: TreeVisitor): void => {
    const local = (current: NodeType, parent: any, key: any) => {
      if (current.type === 'AssignmentStatement') {
        local(current.symbol, current, 'symbol')
        local(current.expression, current, 'expression')
      } else if (current.type === 'BinaryExpression') {
        local(current.left, current, 'left')
        local(current.right, current, 'right')
      } else if (current.type === 'CallExpression') {
        for (let i = current.args.length - 1; i >= 0; i--) {
          local(current.args[i], current.args, i)
        }
      } else if (current.type === 'ParenthesizedExpression') {
        local(current.expression, current, 'expression')
      } else if (current.type === 'UnaryExpression') {
        local(current.operand, current, 'operand')
      } else if (current.type === 'Program') {
        for (let i = current.statements.length - 1; i >= 0; i--) {
          local(current.statements[i], current.statements, i)
        }
      } else if (current.type === 'TernaryExpression') {
        local(current.condition, current, 'condition')
        local(current.expressions[0], current.expressions, 0)
        local(current.expressions[1], current.expressions, 1)
      }
      const shouldDelete = visitor(current, parent, key)
      if (shouldDelete) {
        if (Array.isArray(parent)) {
          parent.splice(key, 1)
        } else {
          throw new Error(
            'In order to preserve ast structure, remove a key is forbidden except if the object is actually an array.'
          )
        }
      }
    }
    local(node, null, '')
  },
  isPrimary: (node: NodeType): boolean => {
    if (node.type === 'ArgumentIdentifier') return true
    if (node.type === 'IdentifierLiteral') return true
    if (node.type === 'NumberLiteral') return true
    if (node.type === 'ParenthesizedExpression') return true
    if (node.type === 'CallExpression') return true
    return false
  },
  isSimple: (node: NodeType): boolean => {
    if (AST.isPrimary(node)) return true
    if (node.type === 'BinaryExpression') {
      return AST.isPrimary(node.left) && AST.isPrimary(node.right)
    }
    if (node.type === 'UnaryExpression') {
      return AST.isPrimary(node.operand)
    }
    return false
  }
}

export default AST
