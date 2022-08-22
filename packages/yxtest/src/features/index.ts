import { say } from 'lernanpm-yxutils'
/**
 * 打印名字
 * @param { string } sFirstName
 * @param { string } sFirstName
 * @returns { void }
 */
interface IprintName {
  (sFirstName: string, sLastName: string): void
}
export let printName: IprintName
printName = (sFirstName: string, sLastName: string) => {
  say(sFirstName + sLastName)
}
