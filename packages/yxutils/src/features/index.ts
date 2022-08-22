/**
 * 打印
 * @return {string} val 打印内容
 */
interface Isay {
  (val: string): void
}
export let say: Isay
say = (val: string) => {
  console.log(val)
}
