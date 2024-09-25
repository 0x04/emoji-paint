// @see https://stackoverflow.com/a/71619350/2379235
export const splitEmoji = (string) => [ ...new Intl.Segmenter().segment(string) ].map(x => x.segment)
