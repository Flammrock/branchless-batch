import Parser from '../../../src/languages/nova/parser'
import Compressor, {
  OperatorConversionTable,
  UnknownOperator,
  UnknownOperators
} from '../../../src/languages/nova/compressor'
import AST from '../../../src/languages/nova/ast'

// TODO: test that OperatorTable give name to polyfill function

describe('Compress', () => {
  it('should preserve empty program', () => {
    const parser = new Parser('')
    const program = parser.parse()
    const compressor = new Compressor(program)
    compressor.reduce()
    expect(compressor.getProgram()).toStrictEqual(program)
  })

  it('should preserve program if operators are all known', () => {
    const parser = new Parser(`logicalOr(a,b) = (1-((a|(~a+1))>>31)&1)*b+a`)
    const program = parser.parse()
    const compressor = new Compressor(program)
    compressor.reduce()
    expect(compressor.getProgram()).toStrictEqual(program)
  })

  describe('Polyfill unknow operators', () => {
    const itShouldPolyfill = (operator: UnknownOperator) => {
      it(`should polyfill unknow operator '${operator}'`, () => {
        const parser = new Parser(`fn(a, b) = a ${operator} b`)
        const program = parser.parse()
        const compressor = new Compressor(program)
        const customPolyfillNamer = () => 'foo'
        compressor.reduce({ customPolyfillNamer })
        const m = operator.length - 1
        expect(compressor.getProgram()).toStrictEqual(
          AST.Program(
            [
              OperatorConversionTable[operator](customPolyfillNamer()),
              AST.AssignmentStatement(
                AST.FunctionDefinition(
                  'fn',
                  [AST.FunctionParameter('a', AST.metadata(3, 4)), AST.FunctionParameter('b', AST.metadata(6, 7))],
                  AST.metadata(0, 8)
                ),
                AST.Operator('=', AST.metadata(9, 10)),
                AST.CallExpression(AST.IdentifierLiteral('foo', false), [
                  AST.ArgumentIdentifier('a', AST.metadata(11, 12)),
                  AST.ArgumentIdentifier('b', AST.metadata(15 + m, 16 + m))
                ]),
                AST.metadata(0, 16 + m)
              )
            ],
            AST.metadata(0, 16 + m)
          )
        )
      })
    }
    for (const operator of UnknownOperators) {
      itShouldPolyfill(operator)
    }
  })

  describe('Definitions injection', () => {
    it('should inject simple function definition', () => {
      const parser = new Parser(`
        max(a, b) = a > b + p * (4 + d)
        out(d) = 4 + max(c, d)
        v = out(15)
        h(c) = out(32)
        f(c) = out(c)
      `)
      const program = parser.parse()
      const compressor = new Compressor(program)
      compressor.inject()
      expect(compressor.getProgram()).toStrictEqual(
        AST.Program(
          [
            AST.EmptyStatement(1, AST.metadata(0, 1)),
            AST.AssignmentStatement(
              AST.FunctionDefinition(
                'max',
                [AST.FunctionParameter('a', AST.metadata(13, 14)), AST.FunctionParameter('b', AST.metadata(16, 17))],
                AST.metadata(9, 18)
              ),
              AST.Operator('=', AST.metadata(19, 20)),
              AST.BinaryExpression(
                AST.ArgumentIdentifier('a', AST.metadata(21, 22)),
                AST.Operator('>', AST.metadata(23, 24)),
                AST.BinaryExpression(
                  AST.ArgumentIdentifier('b', AST.metadata(25, 26)),
                  AST.Operator('+', AST.metadata(27, 28)),
                  AST.BinaryExpression(
                    AST.IdentifierLiteral('p', false, AST.metadata(29, 30)),
                    AST.Operator('*', AST.metadata(31, 32)),
                    AST.GroupingExpression(
                      AST.BinaryExpression(
                        AST.NumberLiteral(4, AST.metadata(34, 35)),
                        AST.Operator('+', AST.metadata(36, 37)),
                        AST.IdentifierLiteral('d', false, AST.metadata(38, 39)),
                        AST.metadata(34, 39)
                      ),
                      AST.metadata(33, 40)
                    ),
                    AST.metadata(29, 40)
                  ),
                  AST.metadata(25, 40)
                ),
                AST.metadata(21, 40)
              ),
              AST.metadata(9, 40)
            ),
            AST.AssignmentStatement(
              AST.FunctionDefinition('out', [AST.FunctionParameter('d', AST.metadata(53, 54))], AST.metadata(49, 55)),
              AST.Operator('=', AST.metadata(56, 57)),
              AST.BinaryExpression(
                AST.NumberLiteral(4, AST.metadata(58, 59)),
                AST.Operator('+', AST.metadata(60, 61)),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.IdentifierLiteral('c', false, AST.metadata(66, 67)),
                    AST.Operator('>', AST.metadata(23, 24)),
                    AST.BinaryExpression(
                      AST.ArgumentIdentifier('d', AST.metadata(69, 70)),
                      AST.Operator('+', AST.metadata(27, 28)),
                      AST.BinaryExpression(
                        AST.IdentifierLiteral('p', true, AST.metadata(29, 30)),
                        AST.Operator('*', AST.metadata(31, 32)),
                        AST.GroupingExpression(
                          AST.BinaryExpression(
                            AST.NumberLiteral(4, AST.metadata(34, 35)),
                            AST.Operator('+', AST.metadata(36, 37)),
                            AST.IdentifierLiteral('d', true, AST.metadata(38, 39)),
                            AST.metadata(34, 39)
                          ),
                          AST.metadata(33, 40)
                        ),
                        AST.metadata(29, 40)
                      ),
                      AST.metadata(25, 40)
                    ),
                    AST.metadata(21, 40)
                  )
                ),
                AST.metadata(58, 71)
              ),
              AST.metadata(49, 71)
            ),
            AST.AssignmentStatement(
              AST.VariableDefinition('v', AST.metadata(80, 81)),
              AST.Operator('=', AST.metadata(82, 83)),
              AST.BinaryExpression(
                AST.NumberLiteral(4, AST.metadata(58, 59)),
                AST.Operator('+', AST.metadata(60, 61)),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.IdentifierLiteral('c', true, AST.metadata(66, 67)),
                    AST.Operator('>', AST.metadata(23, 24)),
                    AST.BinaryExpression(
                      AST.NumberLiteral(15, AST.metadata(88, 90)),
                      AST.Operator('+', AST.metadata(27, 28)),
                      AST.BinaryExpression(
                        AST.IdentifierLiteral('p', true, AST.metadata(29, 30)),
                        AST.Operator('*', AST.metadata(31, 32)),
                        AST.GroupingExpression(
                          AST.BinaryExpression(
                            AST.NumberLiteral(4, AST.metadata(34, 35)),
                            AST.Operator('+', AST.metadata(36, 37)),
                            AST.IdentifierLiteral('d', true, AST.metadata(38, 39)),
                            AST.metadata(34, 39)
                          ),
                          AST.metadata(33, 40)
                        ),
                        AST.metadata(29, 40)
                      ),
                      AST.metadata(25, 40)
                    ),
                    AST.metadata(21, 40)
                  )
                ),
                AST.metadata(58, 71)
              ),
              AST.metadata(80, 91)
            ),
            AST.AssignmentStatement(
              AST.FunctionDefinition('h', [AST.FunctionParameter('c', AST.metadata(102, 103))], AST.metadata(100, 104)),
              AST.Operator('=', AST.metadata(105, 106)),
              AST.BinaryExpression(
                AST.NumberLiteral(4, AST.metadata(58, 59)),
                AST.Operator('+', AST.metadata(60, 61)),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.IdentifierLiteral('c', true, AST.metadata(66, 67)),
                    AST.Operator('>', AST.metadata(23, 24)),
                    AST.BinaryExpression(
                      AST.NumberLiteral(32, AST.metadata(111, 113)),
                      AST.Operator('+', AST.metadata(27, 28)),
                      AST.BinaryExpression(
                        AST.IdentifierLiteral('p', true, AST.metadata(29, 30)),
                        AST.Operator('*', AST.metadata(31, 32)),
                        AST.GroupingExpression(
                          AST.BinaryExpression(
                            AST.NumberLiteral(4, AST.metadata(34, 35)),
                            AST.Operator('+', AST.metadata(36, 37)),
                            AST.IdentifierLiteral('d', true, AST.metadata(38, 39)),
                            AST.metadata(34, 39)
                          ),
                          AST.metadata(33, 40)
                        ),
                        AST.metadata(29, 40)
                      ),
                      AST.metadata(25, 40)
                    ),
                    AST.metadata(21, 40)
                  )
                ),
                AST.metadata(58, 71)
              ),
              AST.metadata(100, 114)
            ),
            AST.AssignmentStatement(
              AST.FunctionDefinition('f', [AST.FunctionParameter('c', AST.metadata(125, 126))], AST.metadata(123, 127)),
              AST.Operator('=', AST.metadata(128, 129)),
              AST.BinaryExpression(
                AST.NumberLiteral(4, AST.metadata(58, 59)),
                AST.Operator('+', AST.metadata(60, 61)),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.IdentifierLiteral('c', true, AST.metadata(66, 67)),
                    AST.Operator('>', AST.metadata(23, 24)),
                    AST.BinaryExpression(
                      AST.ArgumentIdentifier('c', AST.metadata(134, 135)),
                      AST.Operator('+', AST.metadata(27, 28)),
                      AST.BinaryExpression(
                        AST.IdentifierLiteral('p', true, AST.metadata(29, 30)),
                        AST.Operator('*', AST.metadata(31, 32)),
                        AST.GroupingExpression(
                          AST.BinaryExpression(
                            AST.NumberLiteral(4, AST.metadata(34, 35)),
                            AST.Operator('+', AST.metadata(36, 37)),
                            AST.IdentifierLiteral('d', true, AST.metadata(38, 39)),
                            AST.metadata(34, 39)
                          ),
                          AST.metadata(33, 40)
                        ),
                        AST.metadata(29, 40)
                      ),
                      AST.metadata(25, 40)
                    ),
                    AST.metadata(21, 40)
                  )
                ),
                AST.metadata(58, 71)
              ),
              AST.metadata(123, 136)
            )
          ],
          AST.metadata(0, 136)
        )
      )
    })
  })
})
