import { REGEXP_EMOJI } from '../constants/globals.mjs'

export const isEmoji = (character) => {
  return REGEXP_EMOJI.test(character)
}
