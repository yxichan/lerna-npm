import { printName } from '../src/index'

describe('test ', () => {
  test('This is printName test', () => {
    const consoleSpy = jest.spyOn(console, 'log')
    printName('yx', 'chan')
    expect(consoleSpy).toHaveBeenCalledWith('yxchan')
  })
})
