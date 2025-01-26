import { isEmoji } from './is-emoji.mjs'

/**
 * Matches all emojis from a string
 * @param string
 * @returns {string[]}
 * @see https://stackoverflow.com/a/71619350/2379235
 */
export const matchEmojis = (string) => [ ...new Intl.Segmenter().segment(string) ]
  .map(x => x.segment)
  .filter(isEmoji)
