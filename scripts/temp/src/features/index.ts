/**
 * print 'Hello world!'
 * @return {void}
 */
interface Isay {
  (): void
}
export let say: Isay
say = () => {
  console.log('Hello world!')
}
