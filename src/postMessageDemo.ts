const popup = window.open('...popup detailesa...')

popup?.postMessage(',', 'https://secure.example.net')

popup?.postMessage('hello', 'http://example.com')

function receiveMessage(event: any) {
  if (event.origin !== 'http://example.com') {
    return
  }
}

window.addEventListener('message', receiveMessage, false)
