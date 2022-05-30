export * from './api/index.js'
export * from './app-api/index.js'
export * from './devices/index.js'
export * from './pairing/index.js'
export * from './push-authentication/index.js'
export { default as Operation, OperationID } from './Operation.js'
/** Custom type to replace the typoe of some properties with another type
 *  Example:
 * ```
 * type A = {
 * prop1: string
 * prop2: string
*}

*type B = Replace<A, 'prop2', number>
* //B is of type
*{
*    prop1: string;
*    prop2: number;
*}
*
 * ```
*/
export type Replace<T, K extends keyof T, U> = {
  [P in keyof T]: P extends K ? U : T[P]
}
