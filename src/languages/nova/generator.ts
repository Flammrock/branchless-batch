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

import AST, { NodeType, AssignmentStatementNode, IdentifierLiteralNode, ProgramNode, EmptyNodeMetadata } from './ast'
import Compressor from './compressor'
import Parser from './parser'

export interface GeneratorOptions {
  /**
   * default: false
   */
  ignoreErrors: boolean
}

class Generator {
  private temporarySymbols: Record<string, boolean> = {}
  private temporayArgsName: Array<string> = []
  private ignoreErrors: boolean = false

  constructor(options?: Partial<GeneratorOptions>) {
    this.ignoreErrors = options?.ignoreErrors ?? false
  }

  /**
   * // var=expr
   * set "var=expr"
   *
   * // func(a,b) = expr
   * set "func=(a0=a,a1=b,...,expr)"
   */
  private stringify(node: NodeType): string {
    const assignStringify = (node: AssignmentStatementNode): string => {
      if (typeof this.temporarySymbols[node.symbol.name] !== 'undefined') return ''
      const symbol = node.symbol
      if (symbol.type === 'VariableDefinition')
        return `set "${this.stringify(node.symbol)}=${this.stringify(node.expression)}"\n`
      const args = symbol.params.map((param, i) => `${this.temporayArgsName[i]}=${param.name}`).join(',')
      return `set "${node.symbol.name}=(${args},${this.stringify(node.expression)})"\n`
    }
    switch (node.type) {
      case 'Program':
        return `${node.statements
          .map((statement) => this.stringify(statement))
          .filter((statement) => statement !== '')
          .join('')}`
      case 'AssignmentStatement':
        return assignStringify(node)
      case 'EmptyStatement':
        return '\n'.repeat(Math.max(1, node.size))
      case 'Comment':
      case 'CommentStatement':
        return (
          node.text
            .split('\n')
            .map((text) => `rem ${text}`)
            .join('\n') + '\n'
        )
      case 'IdentifierLiteral':
      case 'ArgumentIdentifier':
      case 'VariableDefinition':
      case 'FunctionParameter':
      case 'FunctionDefinition':
        return `${node.name}`
      case 'NumberLiteral':
        return `${node.value}`
      case 'BinaryExpression':
        return `${this.stringify(node.left)}${this.stringify(node.operator)}${this.stringify(node.right)}`
      case 'UnaryExpression':
        return `${this.stringify(node.operator)}${this.stringify(node.operand)}`
      case 'ParenthesizedExpression':
        return `(${this.stringify(node.expression)})`
      case 'Operator':
        return node.sign
      case 'TernaryExpression':
      case 'CallExpression':
        throw new Error('Unsupported operation.')
    }
  }

  generate(source: string): string {
    const parser = new Parser(source)
    const compressor = new Compressor(parser.parse({ ignoreErrors: this.ignoreErrors }))
    compressor.reduce()
    compressor.inject()
    const program = compressor.getProgram()

    const addedSymbols = compressor.getAddedSymbols()
    for (const symbolName of addedSymbols) {
      this.temporarySymbols[symbolName] = true
    }

    // extract all symbols + get the maximum args
    const symbols: Record<string, boolean> = {}
    let maxArgsNum = 0
    AST.visit(program, (node, parent, key) => {
      if (node.type !== 'VariableDefinition' && node.type !== 'FunctionDefinition' && node.type !== 'IdentifierLiteral')
        return
      if (typeof this.temporarySymbols[node.name] !== 'undefined') return
      symbols[node.name] = true
      if (node.type === 'FunctionDefinition') maxArgsNum = Math.max(maxArgsNum, node.params.length)
    })

    // generate {maxArgsNum} temporary args name
    this.temporayArgsName = []
    let n = 0
    for (let i = 0; i < maxArgsNum; i++) {
      while (typeof symbols[`a${n}`] !== 'undefined') n++
      symbols[`a${n}`] = true
      this.temporayArgsName.push(`a${n}`)
    }

    // inject internal arg name in function expression
    for (const statement of program.statements) {
      if (statement.type !== 'AssignmentStatement') continue
      const symbol = statement.symbol
      if (symbol.type !== 'FunctionDefinition') continue
      const localArgs: Record<string, string> = {}
      for (let i = 0; i < symbol.params.length; i++) {
        const argName = symbol.params[i].name
        localArgs[argName] = this.temporayArgsName[i]
      }
      AST.visit(statement.expression, (node, parent, key) => {
        if (node.type !== 'IdentifierLiteral' && node.type !== 'ArgumentIdentifier') return
        if (node.type === 'IdentifierLiteral' && node.isGlobal) return
        if (typeof localArgs[node.name] === 'undefined') return
        parent[key] = AST.IdentifierLiteral(localArgs[node.name])
      })
    }

    return this.stringify(program)
  }
}

export default Generator
