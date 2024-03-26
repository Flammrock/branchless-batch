import Parser from '../../../src/languages/nova/parser'
import AST, { BinaryOperator } from '../../../src/languages/nova/ast'

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

describe('Parser', () => {
  it('should parse an assignment statement', async () => {
    const parser = new Parser(`hello = 2 + 8 * 5`)
    const program = parser.parse()
    expect(program).toStrictEqual(
      AST.Program(
        [
          AST.AssignmentStatement(
            AST.VariableDefinition('hello', AST.metadata(0, 5)),
            AST.Operator('=', AST.metadata(6, 7)),
            AST.BinaryExpression(
              AST.NumberLiteral(2, AST.metadata(8, 9)),
              AST.Operator('+', AST.metadata(10, 11)),
              AST.BinaryExpression(
                AST.NumberLiteral(8, AST.metadata(12, 13)),
                AST.Operator('*', AST.metadata(14, 15)),
                AST.NumberLiteral(5, AST.metadata(16, 17)),
                AST.metadata(12, 17)
              ),
              AST.metadata(8, 17)
            ),
            AST.metadata(0, 17)
          )
        ],
        AST.metadata(0, 17)
      )
    )
  })

  it('should parse an assignment function statement', async () => {
    const parser = new Parser(`logicalOr(a,b) = (1-((a|(~a+1))>>31)&1)*b+a`)
    const program = parser.parse()
    expect(program).toStrictEqual(
      AST.Program(
        [
          AST.AssignmentStatement(
            AST.FunctionDefinition(
              'logicalOr',
              [AST.FunctionParameter('a', AST.metadata(10, 11)), AST.FunctionParameter('b', AST.metadata(12, 13))],
              AST.metadata(0, 14)
            ),
            AST.Operator('=', AST.metadata(15, 16)),
            AST.BinaryExpression(
              AST.BinaryExpression(
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.BinaryExpression(
                      AST.NumberLiteral(1, AST.metadata(18, 19)),
                      AST.Operator('-', AST.metadata(19, 20)),
                      AST.GroupingExpression(
                        AST.BinaryExpression(
                          AST.GroupingExpression(
                            AST.BinaryExpression(
                              AST.ArgumentIdentifier('a', AST.metadata(22, 23)),
                              AST.Operator('|', AST.metadata(23, 24)),
                              AST.GroupingExpression(
                                AST.BinaryExpression(
                                  AST.UnaryExpression(
                                    AST.Operator('~', AST.metadata(25, 26)),
                                    AST.ArgumentIdentifier('a', AST.metadata(26, 27)),
                                    AST.metadata(25, 27)
                                  ),
                                  AST.Operator('+', AST.metadata(27, 28)),
                                  AST.NumberLiteral(1, AST.metadata(28, 29)),
                                  AST.metadata(25, 29)
                                ),
                                AST.metadata(24, 30)
                              ),
                              AST.metadata(22, 30)
                            ),
                            AST.metadata(21, 31)
                          ),
                          AST.Operator('>>', AST.metadata(31, 33)),
                          AST.NumberLiteral(31, AST.metadata(33, 35)),
                          AST.metadata(21, 35)
                        ),
                        AST.metadata(20, 36)
                      ),
                      AST.metadata(18, 36)
                    ),
                    AST.Operator('&', AST.metadata(36, 37)),
                    AST.NumberLiteral(1, AST.metadata(37, 38)),
                    AST.metadata(18, 38)
                  ),
                  AST.metadata(17, 39)
                ),
                AST.Operator('*', AST.metadata(39, 40)),
                AST.ArgumentIdentifier('b', AST.metadata(40, 41)),
                AST.metadata(17, 41)
              ),
              AST.Operator('+', AST.metadata(41, 42)),
              AST.ArgumentIdentifier('a', AST.metadata(42, 43)),
              AST.metadata(17, 43)
            ),
            AST.metadata(0, 43)
          )
        ],
        AST.metadata(0, 43)
      )
    )
  })

  it('should respect operator precedence', async () => {
    const parser = new Parser(`
      hello = 2 % foo + (8 * 785 + bar()) ** !2 + ~4 >> 789 / (
        5 >= (45 << 3 ** 45237) < 5 > -78 != 4 & 9 || 2 | 4 & 5 | -6 | 3 & 8 && max(
          4, foo(28 ** 8, 1 << 2, world), 2 % foo + (8 * 5 + bar()) ** !2 + ~4 >> 31 / (
            12 <= (4 << 3 ** 7) < 5 > 7 == 4 & 9 || 2 ^ 5 | 4 & 5 | 62 | 0 & 8 && max(
              42, foo(2 ** 8523, 10 << 20000, world), !!b, f()
            )
          )
        )
      )
    `)
    const program = parser.parse()
    expect(program).toStrictEqual(
      AST.Program(
        [
          AST.EmptyStatement(1, AST.metadata(0, 1)),
          AST.AssignmentStatement(
            AST.VariableDefinition('hello', AST.metadata(7, 12)),
            AST.Operator('=', AST.metadata(13, 14)),
            AST.BinaryExpression(
              AST.BinaryExpression(
                AST.BinaryExpression(
                  AST.NumberLiteral(2, AST.metadata(15, 16)),
                  AST.Operator('%', AST.metadata(17, 18)),
                  AST.IdentifierLiteral('foo', false, AST.metadata(19, 22)),
                  AST.metadata(15, 22)
                ),
                AST.Operator('+', AST.metadata(23, 24)),
                AST.BinaryExpression(
                  AST.BinaryExpression(
                    AST.GroupingExpression(
                      AST.BinaryExpression(
                        AST.BinaryExpression(
                          AST.NumberLiteral(8, AST.metadata(26, 27)),
                          AST.Operator('*', AST.metadata(28, 29)),
                          AST.NumberLiteral(785, AST.metadata(30, 33)),
                          AST.metadata(26, 33)
                        ),
                        AST.Operator('+', AST.metadata(34, 35)),
                        AST.CallExpression(
                          AST.IdentifierLiteral('bar', false, AST.metadata(36, 39)),
                          [],
                          AST.metadata(36, 41)
                        ),
                        AST.metadata(26, 41)
                      ),
                      AST.metadata(25, 42)
                    ),
                    AST.Operator('**', AST.metadata(43, 45)),
                    AST.UnaryExpression(
                      AST.Operator('!', AST.metadata(46, 47)),
                      AST.NumberLiteral(2, AST.metadata(47, 48)),
                      AST.metadata(46, 48)
                    ),
                    AST.metadata(25, 48)
                  ),
                  AST.Operator('+', AST.metadata(49, 50)),
                  AST.UnaryExpression(
                    AST.Operator('~', AST.metadata(51, 52)),
                    AST.NumberLiteral(4, AST.metadata(52, 53)),
                    AST.metadata(51, 53)
                  ),
                  AST.metadata(25, 53)
                ),
                AST.metadata(15, 53)
              ),
              AST.Operator('>>', AST.metadata(54, 56)),
              AST.BinaryExpression(
                AST.NumberLiteral(789, AST.metadata(57, 60)),
                AST.Operator('/', AST.metadata(61, 62)),
                AST.GroupingExpression(
                  AST.BinaryExpression(
                    AST.BinaryExpression(
                      AST.BinaryExpression(
                        AST.BinaryExpression(
                          AST.NumberLiteral(5, AST.metadata(73, 74)),
                          AST.Operator('>=', AST.metadata(75, 77)),
                          AST.BinaryExpression(
                            AST.GroupingExpression(
                              AST.BinaryExpression(
                                AST.NumberLiteral(45, AST.metadata(79, 81)),
                                AST.Operator('<<', AST.metadata(82, 84)),
                                AST.BinaryExpression(
                                  AST.NumberLiteral(3, AST.metadata(85, 86)),
                                  AST.Operator('**', AST.metadata(87, 89)),
                                  AST.NumberLiteral(45237, AST.metadata(90, 95)),
                                  AST.metadata(85, 95)
                                ),
                                AST.metadata(79, 95)
                              ),
                              AST.metadata(78, 96)
                            ),
                            AST.Operator('<', AST.metadata(97, 98)),
                            AST.BinaryExpression(
                              AST.NumberLiteral(5, AST.metadata(99, 100)),
                              AST.Operator('>', AST.metadata(101, 102)),
                              AST.UnaryExpression(
                                AST.Operator('-', AST.metadata(103, 104)),
                                AST.NumberLiteral(78, AST.metadata(104, 106)),
                                AST.metadata(103, 106)
                              ),
                              AST.metadata(99, 106)
                            ),
                            AST.metadata(78, 106)
                          ),
                          AST.metadata(73, 106)
                        ),
                        AST.Operator('!=', AST.metadata(107, 109)),
                        AST.NumberLiteral(4, AST.metadata(110, 111)),
                        AST.metadata(73, 111)
                      ),
                      AST.Operator('&', AST.metadata(112, 113)),
                      AST.NumberLiteral(9, AST.metadata(114, 115)),
                      AST.metadata(73, 115)
                    ),
                    AST.Operator('||', AST.metadata(116, 118)),
                    AST.BinaryExpression(
                      AST.BinaryExpression(
                        AST.NumberLiteral(2, AST.metadata(119, 120)),
                        AST.Operator('|', AST.metadata(121, 122)),
                        AST.BinaryExpression(
                          AST.BinaryExpression(
                            AST.NumberLiteral(4, AST.metadata(123, 124)),
                            AST.Operator('&', AST.metadata(125, 126)),
                            AST.NumberLiteral(5, AST.metadata(127, 128)),
                            AST.metadata(123, 128)
                          ),
                          AST.Operator('|', AST.metadata(129, 130)),
                          AST.BinaryExpression(
                            AST.UnaryExpression(
                              AST.Operator('-', AST.metadata(131, 132)),
                              AST.NumberLiteral(6, AST.metadata(132, 133)),
                              AST.metadata(131, 133)
                            ),
                            AST.Operator('|', AST.metadata(134, 135)),
                            AST.BinaryExpression(
                              AST.NumberLiteral(3, AST.metadata(136, 137)),
                              AST.Operator('&', AST.metadata(138, 139)),
                              AST.NumberLiteral(8, AST.metadata(140, 141)),
                              AST.metadata(136, 141)
                            ),
                            AST.metadata(131, 141)
                          ),
                          AST.metadata(123, 141)
                        ),
                        AST.metadata(119, 141)
                      ),
                      AST.Operator('&&', AST.metadata(142, 144)),
                      AST.CallExpression(
                        AST.IdentifierLiteral('max', false, AST.metadata(145, 148)),
                        [
                          AST.NumberLiteral(4, AST.metadata(160, 161)),
                          AST.CallExpression(
                            AST.IdentifierLiteral('foo', false, AST.metadata(163, 166)),
                            [
                              AST.BinaryExpression(
                                AST.NumberLiteral(28, AST.metadata(167, 169)),
                                AST.Operator('**', AST.metadata(170, 172)),
                                AST.NumberLiteral(8, AST.metadata(173, 174)),
                                AST.metadata(167, 174)
                              ),
                              AST.BinaryExpression(
                                AST.NumberLiteral(1, AST.metadata(176, 177)),
                                AST.Operator('<<', AST.metadata(178, 180)),
                                AST.NumberLiteral(2, AST.metadata(181, 182)),
                                AST.metadata(176, 182)
                              ),
                              AST.IdentifierLiteral('world', false, AST.metadata(184, 189))
                            ],
                            AST.metadata(163, 190)
                          ),
                          AST.BinaryExpression(
                            AST.BinaryExpression(
                              AST.BinaryExpression(
                                AST.NumberLiteral(2, AST.metadata(192, 193)),
                                AST.Operator('%', AST.metadata(194, 195)),
                                AST.IdentifierLiteral('foo', false, AST.metadata(196, 199)),
                                AST.metadata(192, 199)
                              ),
                              AST.Operator('+', AST.metadata(200, 201)),
                              AST.BinaryExpression(
                                AST.BinaryExpression(
                                  AST.GroupingExpression(
                                    AST.BinaryExpression(
                                      AST.BinaryExpression(
                                        AST.NumberLiteral(8, AST.metadata(203, 204)),
                                        AST.Operator('*', AST.metadata(205, 206)),
                                        AST.NumberLiteral(5, AST.metadata(207, 208)),
                                        AST.metadata(203, 208)
                                      ),
                                      AST.Operator('+', AST.metadata(209, 210)),
                                      AST.CallExpression(
                                        AST.IdentifierLiteral('bar', false, AST.metadata(211, 214)),
                                        [],
                                        AST.metadata(211, 216)
                                      ),
                                      AST.metadata(203, 216)
                                    ),
                                    AST.metadata(202, 217)
                                  ),
                                  AST.Operator('**', AST.metadata(218, 220)),
                                  AST.UnaryExpression(
                                    AST.Operator('!', AST.metadata(221, 222)),
                                    AST.NumberLiteral(2, AST.metadata(222, 223)),
                                    AST.metadata(221, 223)
                                  ),
                                  AST.metadata(202, 223)
                                ),
                                AST.Operator('+', AST.metadata(224, 225)),
                                AST.UnaryExpression(
                                  AST.Operator('~', AST.metadata(226, 227)),
                                  AST.NumberLiteral(4, AST.metadata(227, 228)),
                                  AST.metadata(226, 228)
                                ),
                                AST.metadata(202, 228)
                              ),
                              AST.metadata(192, 228)
                            ),
                            AST.Operator('>>', AST.metadata(229, 231)),
                            AST.BinaryExpression(
                              AST.NumberLiteral(31, AST.metadata(232, 234)),
                              AST.Operator('/', AST.metadata(235, 236)),
                              AST.GroupingExpression(
                                AST.BinaryExpression(
                                  AST.BinaryExpression(
                                    AST.BinaryExpression(
                                      AST.BinaryExpression(
                                        AST.NumberLiteral(12, AST.metadata(251, 253)),
                                        AST.Operator('<=', AST.metadata(254, 256)),
                                        AST.BinaryExpression(
                                          AST.GroupingExpression(
                                            AST.BinaryExpression(
                                              AST.NumberLiteral(4, AST.metadata(258, 259)),
                                              AST.Operator('<<', AST.metadata(260, 262)),
                                              AST.BinaryExpression(
                                                AST.NumberLiteral(3, AST.metadata(263, 264)),
                                                AST.Operator('**', AST.metadata(265, 267)),
                                                AST.NumberLiteral(7, AST.metadata(268, 269)),
                                                AST.metadata(263, 269)
                                              ),
                                              AST.metadata(258, 269)
                                            ),
                                            AST.metadata(257, 270)
                                          ),
                                          AST.Operator('<', AST.metadata(271, 272)),
                                          AST.BinaryExpression(
                                            AST.NumberLiteral(5, AST.metadata(273, 274)),
                                            AST.Operator('>', AST.metadata(275, 276)),
                                            AST.NumberLiteral(7, AST.metadata(277, 278)),
                                            AST.metadata(273, 278)
                                          ),
                                          AST.metadata(257, 278)
                                        ),
                                        AST.metadata(251, 278)
                                      ),
                                      AST.Operator('==', AST.metadata(279, 281)),
                                      AST.NumberLiteral(4, AST.metadata(282, 283)),
                                      AST.metadata(251, 283)
                                    ),
                                    AST.Operator('&', AST.metadata(284, 285)),
                                    AST.NumberLiteral(9, AST.metadata(286, 287)),
                                    AST.metadata(251, 287)
                                  ),
                                  AST.Operator('||', AST.metadata(288, 290)),
                                  AST.BinaryExpression(
                                    AST.BinaryExpression(
                                      AST.BinaryExpression(
                                        AST.NumberLiteral(2, AST.metadata(291, 292)),
                                        AST.Operator('^', AST.metadata(293, 294)),
                                        AST.NumberLiteral(5, AST.metadata(295, 296)),
                                        AST.metadata(291, 296)
                                      ),
                                      AST.Operator('|', AST.metadata(297, 298)),
                                      AST.BinaryExpression(
                                        AST.BinaryExpression(
                                          AST.NumberLiteral(4, AST.metadata(299, 300)),
                                          AST.Operator('&', AST.metadata(301, 302)),
                                          AST.NumberLiteral(5, AST.metadata(303, 304)),
                                          AST.metadata(299, 304)
                                        ),
                                        AST.Operator('|', AST.metadata(305, 306)),
                                        AST.BinaryExpression(
                                          AST.NumberLiteral(62, AST.metadata(307, 309)),
                                          AST.Operator('|', AST.metadata(310, 311)),
                                          AST.BinaryExpression(
                                            AST.NumberLiteral(0, AST.metadata(312, 313)),
                                            AST.Operator('&', AST.metadata(314, 315)),
                                            AST.NumberLiteral(8, AST.metadata(316, 317)),
                                            AST.metadata(312, 317)
                                          ),
                                          AST.metadata(307, 317)
                                        ),
                                        AST.metadata(299, 317)
                                      ),
                                      AST.metadata(291, 317)
                                    ),
                                    AST.Operator('&&', AST.metadata(318, 320)),
                                    AST.CallExpression(
                                      AST.IdentifierLiteral('max', false, AST.metadata(321, 324)),
                                      [
                                        AST.NumberLiteral(42, AST.metadata(340, 342)),
                                        AST.CallExpression(
                                          AST.IdentifierLiteral('foo', false, AST.metadata(344, 347)),
                                          [
                                            AST.BinaryExpression(
                                              AST.NumberLiteral(2, AST.metadata(348, 349)),
                                              AST.Operator('**', AST.metadata(350, 352)),
                                              AST.NumberLiteral(8523, AST.metadata(353, 357)),
                                              AST.metadata(348, 357)
                                            ),
                                            AST.BinaryExpression(
                                              AST.NumberLiteral(10, AST.metadata(359, 361)),
                                              AST.Operator('<<', AST.metadata(362, 364)),
                                              AST.NumberLiteral(20000, AST.metadata(365, 370)),
                                              AST.metadata(359, 370)
                                            ),
                                            AST.IdentifierLiteral('world', false, AST.metadata(372, 377))
                                          ],
                                          AST.metadata(344, 378)
                                        ),
                                        AST.UnaryExpression(
                                          AST.Operator('!', AST.metadata(380, 381)),
                                          AST.UnaryExpression(
                                            AST.Operator('!', AST.metadata(381, 382)),
                                            AST.IdentifierLiteral('b', false, AST.metadata(382, 383)),
                                            AST.metadata(381, 383)
                                          ),
                                          AST.metadata(380, 383)
                                        ),
                                        AST.CallExpression(
                                          AST.IdentifierLiteral('f', false, AST.metadata(385, 386)),
                                          [],
                                          AST.metadata(385, 388)
                                        )
                                      ],
                                      AST.metadata(321, 402)
                                    ),
                                    AST.metadata(291, 402)
                                  ),
                                  AST.metadata(251, 402)
                                ),
                                AST.metadata(237, 414)
                              ),
                              AST.metadata(232, 414)
                            ),
                            AST.metadata(192, 414)
                          )
                        ],
                        AST.metadata(145, 424)
                      ),
                      AST.metadata(119, 424)
                    ),
                    AST.metadata(73, 424)
                  ),
                  AST.metadata(63, 432)
                ),
                AST.metadata(57, 432)
              ),
              AST.metadata(15, 432)
            ),
            AST.metadata(7, 432)
          )
        ],
        AST.metadata(0, 432)
      )
    )
  })

  describe('Operator precedence', () => {
    const itShouldPrecede = (lower: BinaryOperator, higher: BinaryOperator) => {
      it(`should precede '${lower}' over '${higher}'`, () => {
        const parser = new Parser(
          `hello = foo ${lower} bar ${higher} 42 ${lower} 1 ${lower} 52 ${higher} a ${higher} b ${higher} c ${lower} d`
        )
        const program = parser.parse()
        const ml = lower.length - 1
        const mh = higher.length - 1
        expect(program).toStrictEqual(
          AST.Program(
            [
              AST.AssignmentStatement(
                AST.VariableDefinition('hello', AST.metadata(0, 5)),
                AST.Operator('=', AST.metadata(6, 7)),
                AST.BinaryExpression(
                  AST.IdentifierLiteral('foo', false, AST.metadata(8, 11)),
                  AST.Operator(lower, AST.metadata(12, 13 + ml)),
                  AST.BinaryExpression(
                    AST.BinaryExpression(
                      AST.IdentifierLiteral('bar', false, AST.metadata(14 + ml, 17 + ml)),
                      AST.Operator(higher, AST.metadata(18 + ml, 19 + ml + mh)),
                      AST.NumberLiteral(42, AST.metadata(20 + ml + mh, 22 + ml + mh)),
                      AST.metadata(14 + ml, 22 + ml + mh)
                    ),
                    AST.Operator(lower, AST.metadata(23 + ml + mh, 24 + 2 * ml + mh)),
                    AST.BinaryExpression(
                      AST.NumberLiteral(1, AST.metadata(25 + 2 * ml + mh, 26 + 2 * ml + mh)),
                      AST.Operator(lower, AST.metadata(27 + 2 * ml + mh, 28 + 3 * ml + mh)),
                      AST.BinaryExpression(
                        AST.BinaryExpression(
                          AST.NumberLiteral(52, AST.metadata(29 + 3 * ml + mh, 31 + 3 * ml + mh)),
                          AST.Operator(higher, AST.metadata(32 + 3 * ml + mh, 33 + 3 * ml + 2 * mh)),
                          AST.BinaryExpression(
                            AST.IdentifierLiteral('a', false, AST.metadata(34 + 3 * ml + 2 * mh, 35 + 3 * ml + 2 * mh)),
                            AST.Operator(higher, AST.metadata(36 + 3 * ml + 2 * mh, 37 + 3 * ml + 3 * mh)),
                            AST.BinaryExpression(
                              AST.IdentifierLiteral(
                                'b',
                                false,
                                AST.metadata(38 + 3 * ml + 3 * mh, 39 + 3 * ml + 3 * mh)
                              ),
                              AST.Operator(higher, AST.metadata(40 + 3 * ml + 3 * mh, 41 + 3 * ml + 4 * mh)),
                              AST.IdentifierLiteral(
                                'c',
                                false,
                                AST.metadata(42 + 3 * ml + 4 * mh, 43 + 3 * ml + 4 * mh)
                              ),
                              AST.metadata(38 + 3 * ml + 3 * mh, 43 + 3 * ml + 4 * mh)
                            ),
                            AST.metadata(34 + 3 * ml + 2 * mh, 43 + 3 * ml + 4 * mh)
                          ),
                          AST.metadata(29 + 3 * ml + mh, 43 + 3 * ml + 4 * mh)
                        ),
                        AST.Operator(lower, AST.metadata(44 + 3 * ml + 4 * mh, 45 + 4 * ml + 4 * mh)),
                        AST.IdentifierLiteral('d', false, AST.metadata(46 + 4 * ml + 4 * mh, 47 + 4 * ml + 4 * mh)),
                        AST.metadata(29 + 3 * ml + mh, 47 + 4 * ml + 4 * mh)
                      ),
                      AST.metadata(25 + 2 * ml + mh, 47 + 4 * ml + 4 * mh)
                    ),
                    AST.metadata(14 + ml, 47 + 4 * ml + 4 * mh)
                  ),
                  AST.metadata(8, 47 + 4 * ml + 4 * mh)
                ),
                AST.metadata(0, 47 + 4 * ml + 4 * mh)
              )
            ],
            AST.metadata(0, 47 + 4 * ml + 4 * mh)
          )
        )
      })
    }

    itShouldPrecede('||', '&&')
    itShouldPrecede('||', '|')
    itShouldPrecede('||', '^')
    itShouldPrecede('||', '&')
    itShouldPrecede('||', '==')
    itShouldPrecede('||', '!=')
    itShouldPrecede('||', '<')
    itShouldPrecede('||', '>')
    itShouldPrecede('||', '>=')
    itShouldPrecede('||', '<=')
    itShouldPrecede('||', '<<')
    itShouldPrecede('||', '>>')
    itShouldPrecede('||', '>>>')
    itShouldPrecede('||', '+')
    itShouldPrecede('||', '-')
    itShouldPrecede('||', '*')
    itShouldPrecede('||', '/')
    itShouldPrecede('||', '%')
    itShouldPrecede('||', '**')

    itShouldPrecede('&&', '|')
    itShouldPrecede('&&', '^')
    itShouldPrecede('&&', '&')
    itShouldPrecede('&&', '==')
    itShouldPrecede('&&', '!=')
    itShouldPrecede('&&', '<')
    itShouldPrecede('&&', '>')
    itShouldPrecede('&&', '>=')
    itShouldPrecede('&&', '<=')
    itShouldPrecede('&&', '<<')
    itShouldPrecede('&&', '>>')
    itShouldPrecede('&&', '>>>')
    itShouldPrecede('&&', '+')
    itShouldPrecede('&&', '-')
    itShouldPrecede('&&', '*')
    itShouldPrecede('&&', '/')
    itShouldPrecede('&&', '%')
    itShouldPrecede('&&', '**')

    itShouldPrecede('|', '^')
    itShouldPrecede('|', '&')
    itShouldPrecede('|', '==')
    itShouldPrecede('|', '!=')
    itShouldPrecede('|', '<')
    itShouldPrecede('|', '>')
    itShouldPrecede('|', '>=')
    itShouldPrecede('|', '<=')
    itShouldPrecede('|', '<<')
    itShouldPrecede('|', '>>')
    itShouldPrecede('|', '>>>')
    itShouldPrecede('|', '+')
    itShouldPrecede('|', '-')
    itShouldPrecede('|', '*')
    itShouldPrecede('|', '/')
    itShouldPrecede('|', '%')
    itShouldPrecede('|', '**')

    itShouldPrecede('^', '&')
    itShouldPrecede('^', '&')
    itShouldPrecede('^', '==')
    itShouldPrecede('^', '!=')
    itShouldPrecede('^', '<')
    itShouldPrecede('^', '>')
    itShouldPrecede('^', '>=')
    itShouldPrecede('^', '<=')
    itShouldPrecede('^', '<<')
    itShouldPrecede('^', '>>')
    itShouldPrecede('^', '>>>')
    itShouldPrecede('^', '+')
    itShouldPrecede('^', '-')
    itShouldPrecede('^', '*')
    itShouldPrecede('^', '/')
    itShouldPrecede('^', '%')
    itShouldPrecede('^', '**')

    itShouldPrecede('&', '==')
    itShouldPrecede('&', '!=')
    itShouldPrecede('&', '<')
    itShouldPrecede('&', '>')
    itShouldPrecede('&', '>=')
    itShouldPrecede('&', '<=')
    itShouldPrecede('&', '<<')
    itShouldPrecede('&', '>>')
    itShouldPrecede('&', '>>>')
    itShouldPrecede('&', '+')
    itShouldPrecede('&', '-')
    itShouldPrecede('&', '*')
    itShouldPrecede('&', '/')
    itShouldPrecede('&', '%')
    itShouldPrecede('&', '**')

    itShouldPrecede('==', '<')
    itShouldPrecede('==', '>')
    itShouldPrecede('==', '>=')
    itShouldPrecede('==', '<=')
    itShouldPrecede('==', '<<')
    itShouldPrecede('==', '>>')
    itShouldPrecede('==', '>>>')
    itShouldPrecede('==', '+')
    itShouldPrecede('==', '-')
    itShouldPrecede('==', '*')
    itShouldPrecede('==', '/')
    itShouldPrecede('==', '%')
    itShouldPrecede('==', '**')

    itShouldPrecede('!=', '<')
    itShouldPrecede('!=', '>')
    itShouldPrecede('!=', '>=')
    itShouldPrecede('!=', '<=')
    itShouldPrecede('!=', '<<')
    itShouldPrecede('!=', '>>')
    itShouldPrecede('!=', '>>>')
    itShouldPrecede('!=', '+')
    itShouldPrecede('!=', '-')
    itShouldPrecede('!=', '*')
    itShouldPrecede('!=', '/')
    itShouldPrecede('!=', '%')
    itShouldPrecede('!=', '**')

    itShouldPrecede('<', '<<')
    itShouldPrecede('<', '>>')
    itShouldPrecede('<', '>>>')
    itShouldPrecede('<', '+')
    itShouldPrecede('<', '-')
    itShouldPrecede('<', '*')
    itShouldPrecede('<', '/')
    itShouldPrecede('<', '%')
    itShouldPrecede('<', '**')

    itShouldPrecede('>', '<<')
    itShouldPrecede('>', '>>')
    itShouldPrecede('>', '>>>')
    itShouldPrecede('>', '+')
    itShouldPrecede('>', '-')
    itShouldPrecede('>', '*')
    itShouldPrecede('>', '/')
    itShouldPrecede('>', '%')
    itShouldPrecede('>', '**')

    itShouldPrecede('<=', '<<')
    itShouldPrecede('<=', '>>')
    itShouldPrecede('<=', '>>>')
    itShouldPrecede('<=', '+')
    itShouldPrecede('<=', '-')
    itShouldPrecede('<=', '*')
    itShouldPrecede('<=', '/')
    itShouldPrecede('<=', '%')
    itShouldPrecede('<=', '**')

    itShouldPrecede('>=', '<<')
    itShouldPrecede('>=', '>>')
    itShouldPrecede('>=', '>>>')
    itShouldPrecede('>=', '+')
    itShouldPrecede('>=', '-')
    itShouldPrecede('>=', '*')
    itShouldPrecede('>=', '/')
    itShouldPrecede('>=', '%')
    itShouldPrecede('>=', '**')

    itShouldPrecede('<<', '+')
    itShouldPrecede('<<', '-')
    itShouldPrecede('<<', '*')
    itShouldPrecede('<<', '/')
    itShouldPrecede('<<', '%')
    itShouldPrecede('<<', '**')

    itShouldPrecede('>>', '+')
    itShouldPrecede('>>', '-')
    itShouldPrecede('>>', '*')
    itShouldPrecede('>>', '/')
    itShouldPrecede('>>', '%')
    itShouldPrecede('>>', '**')

    itShouldPrecede('>>>', '+')
    itShouldPrecede('>>>', '-')
    itShouldPrecede('>>>', '*')
    itShouldPrecede('>>>', '/')
    itShouldPrecede('>>>', '%')
    itShouldPrecede('>>>', '**')

    itShouldPrecede('+', '*')
    itShouldPrecede('+', '/')
    itShouldPrecede('+', '%')
    itShouldPrecede('+', '**')

    itShouldPrecede('-', '*')
    itShouldPrecede('-', '/')
    itShouldPrecede('-', '%')
    itShouldPrecede('-', '**')

    itShouldPrecede('*', '**')
    itShouldPrecede('/', '**')
    itShouldPrecede('%', '**')
  })
})
