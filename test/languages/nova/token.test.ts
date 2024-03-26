import Token, { TokenType } from '../../../src/languages/nova/token'

describe('Token', () => {
  it('should build a token', () => {
    expect(new Token(TokenType.And, 1, 1, 1, 1, 0)).not.toBeNull()
  })
})
