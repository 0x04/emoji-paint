import { version as versionString } from '../../package.json'

const { 0: major, 1: minor, 2: patch } = versionString.split('.')
export const versionObject = { major, minor, patch }
export { versionString }
