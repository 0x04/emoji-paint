export const copyToClipboard = (text) => {
  const previousFocus = window.activeElement
  const textarea = document.createElement('textarea')
  textarea.className = 'copy-button-helper'
  textarea.value = text

  document.body.appendChild(textarea)

  textarea.select()
  // For mobile devices
  textarea.setSelectionRange(0, textarea.value.length)
  document.execCommand('copy')
  textarea.remove()

  previousFocus && previousFocus.focus()
}
