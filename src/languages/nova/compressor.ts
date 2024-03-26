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

// ternary       : ?:
// logicalOr     : ||
// logicalAnd    : &&
// bitwiseOr     : |
// bitwiseXor    : ^
// bitwiseAnd    : &
// equality      : ==, !=
// relational    : <, >, <=, >=
// bitshift      : <<, >>, >>>
// term          : +, -
// factor        : *, /, %
// exponentation : **
// prefix        : -, +, ~, !
// primary
// group

// isZero(a) = 1-((a|(~a+1))>>31)&1 <=> a == 0 ? 1 : 0
// isNonZero(a) = ((a|(~a+1))>>31)&1 <=> a == 0 ? 0 : 1

import AST, {
  TreeVisitor,
  AssignmentStatementNode,
  BinaryOperatorToTokenTypeName,
  ExpressionNode,
  Operator,
  ProgramNode,
  FunctionDefinitionNode,
  BinaryOperator
} from './ast'

export type UnknownOperator = '?:' | '||' | '&&' | '==' | '!=' | '>' | '<' | '>=' | '<='

const Utils = {
  Relational: (i: ExpressionNode, j: ExpressionNode) =>
    AST.GroupingExpression(
      AST.BinaryExpression(
        AST.GroupingExpression(
          AST.BinaryExpression(
            AST.GroupingExpression(AST.BinaryExpression(i, AST.Operator('-'), j)),
            AST.Operator('>>'),
            AST.NumberLiteral(31)
          )
        ),
        AST.Operator('&'),
        AST.NumberLiteral(1)
      )
    )
}

const Helpers = {
  Gtr: Utils.Relational(AST.ArgumentIdentifier('b'), AST.ArgumentIdentifier('a')),
  Lss: Utils.Relational(AST.ArgumentIdentifier('a'), AST.ArgumentIdentifier('b'))
}

export const OperatorConversionTable: Record<UnknownOperator, (name: string) => AssignmentStatementNode> = {
  '?:': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [
        AST.FunctionParameter('c'),
        AST.FunctionParameter('a'),
        AST.FunctionParameter('b')
      ]),
      AST.Operator('='),
      AST.BinaryExpression(
        AST.BinaryExpression(
          AST.GroupingExpression(
            AST.GroupingExpression(
              AST.BinaryExpression(
                Utils.Relational(AST.NumberLiteral(0), AST.ArgumentIdentifier('c')),
                AST.Operator('+'),
                Utils.Relational(AST.ArgumentIdentifier('c'), AST.NumberLiteral(0))
              )
            )
          ),
          AST.Operator('*'),
          AST.ArgumentIdentifier('a')
        ),
        AST.Operator('+'),
        AST.BinaryExpression(
          AST.GroupingExpression(
            AST.BinaryExpression(
              AST.NumberLiteral(1),
              AST.Operator('-'),
              AST.GroupingExpression(
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    Utils.Relational(AST.NumberLiteral(0), AST.ArgumentIdentifier('c')),
                    AST.Operator('+'),
                    Utils.Relational(AST.ArgumentIdentifier('c'), AST.NumberLiteral(0))
                  )
                )
              )
            )
          ),
          AST.Operator('*'),
          AST.ArgumentIdentifier('b')
        )
      )
    ),
  '||': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      AST.BinaryExpression(
        AST.BinaryExpression(
          AST.GroupingExpression(
            AST.BinaryExpression(
              AST.BinaryExpression(
                AST.NumberLiteral(1),
                AST.Operator('-'),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.GroupingExpression(
                      AST.BinaryExpression(
                        AST.ArgumentIdentifier('a'),
                        AST.Operator('|'),
                        AST.GroupingExpression(
                          AST.BinaryExpression(
                            AST.UnaryExpression(AST.Operator('~'), AST.ArgumentIdentifier('a')),
                            AST.Operator('+'),
                            AST.NumberLiteral(1)
                          )
                        )
                      )
                    ),
                    AST.Operator('>>'),
                    AST.NumberLiteral(31)
                  )
                )
              ),
              AST.Operator('&'),
              AST.NumberLiteral(1)
            )
          ),
          AST.Operator('*'),
          AST.ArgumentIdentifier('b')
        ),
        AST.Operator('+'),
        AST.ArgumentIdentifier('a')
      )
    ),
  '&&': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      AST.BinaryExpression(
        AST.GroupingExpression(
          AST.BinaryExpression(
            AST.GroupingExpression(
              AST.BinaryExpression(
                AST.ArgumentIdentifier('a'),
                AST.Operator('|'),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.UnaryExpression(AST.Operator('~'), AST.ArgumentIdentifier('a')),
                    AST.Operator('+'),
                    AST.NumberLiteral(1)
                  )
                )
              )
            ),
            AST.Operator('>>'),
            AST.NumberLiteral(31)
          )
        ),
        AST.Operator('&'),
        AST.BinaryExpression(
          AST.BinaryExpression(
            AST.NumberLiteral(1),
            AST.Operator('*'),
            AST.GroupingExpression(
              AST.BinaryExpression(AST.ArgumentIdentifier('b'), AST.Operator('-'), AST.ArgumentIdentifier('a'))
            )
          ),
          AST.Operator('+'),
          AST.ArgumentIdentifier('a')
        )
      )
    ),
  '==': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      AST.BinaryExpression(
        AST.NumberLiteral(1),
        AST.Operator('-'),
        AST.BinaryExpression(Helpers.Gtr, AST.Operator('-'), Helpers.Lss)
      )
    ),
  '!=': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      AST.BinaryExpression(Helpers.Gtr, AST.Operator('+'), Helpers.Lss)
    ),
  '>': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      Helpers.Gtr
    ),
  '<': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      Helpers.Lss
    ),
  '>=': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      AST.BinaryExpression(AST.NumberLiteral(1), AST.Operator('-'), Helpers.Lss)
    ),
  '<=': (name: string) =>
    AST.AssignmentStatement(
      AST.FunctionDefinition(name, [AST.FunctionParameter('a'), AST.FunctionParameter('b')]),
      AST.Operator('='),
      AST.BinaryExpression(AST.NumberLiteral(1), AST.Operator('-'), Helpers.Gtr)
    )
}

// Prepare a lookup table of the unknown operators to replace
const binaryOpNeedToConvert: Record<UnknownOperator & BinaryOperator, boolean> = {
  '!=': true,
  '&&': true,
  '<': true,
  '<=': true,
  '==': true,
  '>': true,
  '>=': true,
  '||': true
}

export const UnknownOperators = Object.keys(binaryOpNeedToConvert) as Array<UnknownOperator>

export interface CompressorReduceOptions {
  customPolyfillNamer: (operator: Operator, requested: string, solved: string) => string
}

class Compressor {
  private program: ProgramNode
  private newDefs: Array<string> = []

  constructor(program: ProgramNode) {
    this.program = AST.clone(program)
  }

  public getAddedSymbols(): Array<string> {
    return [...this.newDefs]
  }

  public getProgram(): ProgramNode {
    return AST.clone(this.program)
  }

  public inject(): void {
    const program = this.program
    const functions: Record<string, AssignmentStatementNode> = {}
    const zero = AST.NumberLiteral(0)

    const injectArgsToFunction = (
      symbol: FunctionDefinitionNode,
      body: ExpressionNode,
      args: Array<ExpressionNode>,
      targetArgs: Array<string>
    ): void => {
      const correspondancies: Record<string, ExpressionNode> = {}
      for (let i = 0; i < symbol.params.length; i++) {
        const param = symbol.params[i].name
        correspondancies[param] = args[i]
      }

      const lookupTargetArg: Record<string, boolean> = {}
      for (const argName of targetArgs) lookupTargetArg[argName] = true
      const lookupFnDefArg: Record<string, boolean> = {}
      for (const argName of symbol.params) lookupFnDefArg[argName.name] = true

      AST.visit(body, (node, parent, key): void => {
        if (node.type !== 'IdentifierLiteral' && node.type !== 'ArgumentIdentifier') return

        if (node.type === 'IdentifierLiteral' && typeof lookupFnDefArg[node.name] === 'undefined') {
          node.isGlobal = true
        } else if (node.type === 'ArgumentIdentifier' && typeof lookupFnDefArg[node.name] === 'undefined') {
          parent[key] = AST.IdentifierLiteral(node.name, true, node.metadata)
        }

        if (node.type !== 'IdentifierLiteral' && node.type !== 'ArgumentIdentifier') return

        if (typeof correspondancies[node.name] === 'undefined' || (node.type === 'IdentifierLiteral' && node.isGlobal))
          return

        if (AST.isPrimary(correspondancies[node.name])) {
          parent[key] = AST.clone(correspondancies[node.name])
        } else {
          parent[key] = AST.GroupingExpression(AST.clone(correspondancies[node.name]))
        }
      })
    }

    const process = (statement: AssignmentStatementNode): TreeVisitor => {
      return (node, parent, key) => {
        if (node.type !== 'CallExpression') return
        if (typeof functions[node.symbol.name] === 'undefined') {
          parent[key] = zero
          return
        }
        const fn = AST.clone(functions[node.symbol.name])
        const fnSymbol = fn.symbol as FunctionDefinitionNode
        if (node.args.length !== fnSymbol.params.length) {
          throw new Error(
            `Symbol function '${node.symbol.name}' expect ${fnSymbol.params.length} arguments, but got ${node.args.length}.`
          )
        }
        injectArgsToFunction(
          fnSymbol,
          fn.expression,
          node.args,
          statement.symbol.type === 'FunctionDefinition' ? statement.symbol.params.map((p) => p.name) : []
        )
        if (AST.isPrimary(fn.expression) || AST.isPrimary(statement.expression)) {
          parent[key] = fn.expression
        } else {
          parent[key] = AST.GroupingExpression(fn.expression)
        }
      }
    }

    for (const statement of program.statements) {
      if (statement.type !== 'AssignmentStatement') continue
      const symbol = statement.symbol
      if (symbol.type === 'FunctionDefinition') {
        functions[symbol.name] = AST.clone(statement)
      }
      AST.visit(statement, process(statement))
      if (symbol.type === 'FunctionDefinition') {
        functions[symbol.name] = AST.clone(statement)
      }
    }

    // TODO: injection should respect declaration order
    // TODO: check infinite circular def
  }

  /**
   * Transfrom unkown operator to know operator with the following conversion table:
   *
   * TODO: implement pow
   *
   * ```
   * c ? a : b                               <=> (c != 0) * a + (1 - (c != 0)) * b
   * || -> (1-((a|(~a+1))>>31)&1)*b+a        <=> a == 0 ? b : a
   * && -> ((a|(~a+1))>>31)&1*(b-a)+a        <=> a == 0 ? a : b
   * == -> 1-(((b-a)>>31)&1)-(((a-b)>>31)&1) <=> a == b ? 1 : 0
   * != -> (((b-a)>>31)&1)+(((a-b)>>31)&1)   <=> a != b ? 1 : 0
   * >  -> ((b-a)>>31)&1                     <=> a > b ? 1 : 0
   * <  -> ((a-b)>>31)&1                     <=> a < b ? 1 : 0
   * <= -> 1-((b-a)>>31)&1                   <=> a <= b ? 1 : 0
   * >= -> 1-((a-b)>>31)&1                   <=> a >= b ? 1 : 0
   * ** -> see pow.bat
   * ```
   */
  public reduce(options?: Partial<CompressorReduceOptions>): void {
    const functionOperators: Record<string, AssignmentStatementNode> = {}
    const allSymbols: Record<string, AssignmentStatementNode> = {}

    // Register all symbols (currently not storing recurrence)
    for (const statement of this.program.statements) {
      if (statement.type !== 'AssignmentStatement') continue
      allSymbols[statement.symbol.name] = statement
      // TODO: search in statement.expression too?
    }

    // Avoid symbol name collision and compute a unique name
    const getUniqueSymbolName = (operator: Operator, requested: string): string => {
      let n = 0
      while (typeof allSymbols[`_${requested}_${n}`] !== 'undefined') {
        n++
      }
      const solved = `_${requested}_${n}`
      if (typeof options?.customPolyfillNamer === 'function') {
        const forced = options?.customPolyfillNamer(operator, requested, solved)
        if (typeof allSymbols[forced] !== 'undefined')
          throw new Error('Symbol name choosen by options.customPolyfillNamer already exists.')
        return forced
      }
      return solved
    }

    // Register operator polyfill function if needed
    const getFunctionOperatorName = (operator: UnknownOperator): string => {
      if (typeof functionOperators[operator] !== 'undefined') return functionOperators[operator].symbol.name
      let uniqueName
      if (operator === '?:') {
        uniqueName = getUniqueSymbolName(operator, 'ternary')
      } else {
        uniqueName = getUniqueSymbolName(operator, BinaryOperatorToTokenTypeName(operator).toLowerCase())
      }
      functionOperators[operator] = OperatorConversionTable[operator](uniqueName)
      this.newDefs.push(uniqueName)
      allSymbols[uniqueName] = functionOperators[operator]
      return uniqueName
    }

    // Replace unknow operators with equivalent polyfill function operators
    const process: TreeVisitor = (node, parent, key) => {
      if (node.type === 'BinaryExpression') {
        const op = node.operator.sign as UnknownOperator & BinaryOperator
        if (binaryOpNeedToConvert[op]) {
          const fnName = getFunctionOperatorName(op)
          parent[key] = AST.CallExpression(fnName, [node.left, node.right])
        }
      } else if (node.type === 'TernaryExpression') {
        const op: UnknownOperator = '?:'
        const fnName = getFunctionOperatorName(op)
        parent[key] = AST.CallExpression(fnName, [node.condition, node.expressions[0], node.expressions[1]])
      }
    }

    // Process each statement of the program
    for (const statement of this.program.statements) {
      if (statement.type !== 'AssignmentStatement') continue
      AST.visit(statement, process)
    }

    // Insert polyfill functions that emulate unknow operators
    this.program.statements = [...Object.values(functionOperators), ...this.program.statements]
  }
}

export default Compressor
