import { Ref, useRef } from 'react'
import ReactDom from 'react-dom/client'
// import { myJsx } from '@/react'

const App = function () {
  // const ref = useRef<HTMLDivElement>(null)
  return (
    <h1 id="idh1" key="h-Key">
      <h2>
        <h3 id="idh3" key="h3-Key">
          333
        </h3>
        <div></div>
      </h2>
    </h1>
  )
}

const root = document.querySelector('#main')
console.log('App element', App())
console.log('App', <App />)
const root1 = ReactDom.createRoot(root as HTMLElement)
debugger

root1.render(<App />)
