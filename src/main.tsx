import ReactDom from 'react-dom/client'
// import { myJsx } from '@/react'

const App = function () {
  return (
    <h1>
      <h2>
        <h3>333</h3>
      </h2>
    </h1>
  )
}

const root = document.querySelector('#main')
console.log('App element', App())
// ReactDom.createRoot(root as HTMLElement).render(<App />)
