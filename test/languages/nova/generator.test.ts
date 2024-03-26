import Generator from '../../../src/languages/nova/generator'

describe('Generator', () => {
  it('should remove unknow operators', () => {
    const generator = new Generator()
    const source = generator.generate(`
      max(a, b) = a > b + p * (4 + d)
      out(d) = 4 + max(c, d)

      v = out(15)
      h(c) = out(32)



      f(c) = out(c)
    `)
    console.log(source)
  })
})
