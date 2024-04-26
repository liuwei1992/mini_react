import { Ref, useRef, useState } from 'react'
import ReactDom from 'react-dom/client'
// import { myJsx } from '@/react'

// const App = function () {
//   // const ref = useRef<HTMLDivElement>(null)
//   return (
//     <h1 id="idh1" key="h-Key">
//       <h2>
//         <h3 id="idh3" key="h3-Key">
//           333
//         </h3>
//         <div></div>
//       </h2>
//     </h1>
//   )
// }

// function App() {
//   const [num, setNum] = useState(3)
//   return num === 3 ? (
//     <Child onClick={() => setNum(111)}></Child>
//   ) : (
//     <div>{num}</div>
//   )
// }

// function Child() {
//   return <span>childComponent</span>
// }

// sibling
function App() {
  return (
    <div>
      <span>span</span>
      <p>p</p>
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
    </div>
  )
}

const root = document.querySelector('#main')
console.log('App element', App())
console.log('App', <App />)
ReactDom.createRoot(root as HTMLElement).render(<App />)
