import { sum } from '../src/index'

describe('sum ', () => {
  test('This is sum test', () => {
    expect(sum(1, 2)).toBe(3)
  })
})
