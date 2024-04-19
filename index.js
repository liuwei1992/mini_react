const TEXT_ELEMENT = "TEXT_ELEMENT"
function createElement(type, props, ...children){
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => 
      typeof child === "object" ? child : createTextElement(child))
    }
  }
}

function createTextElement(text){
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function render(vDom, container){
  let dom 
  const {type, props} = vDom

  if(type === TEXT_ELEMENT){
    dom = document.createTextNode(props.nodeValue)
  }else{
    dom = document.createElement(type)
  }

  Object.keys(props).filter(v => v!=="children" && v!=="nodeValue").forEach(attr=>{
    dom.setAttribute(attr, props[attr])
  })

  if(props.children?.length > 0){
    props.children.forEach(child=>{
      render(child, dom)
    })
  }
  
  container.appendChild(dom)
}

{/* <div id='myId'>
  hello react
  <span>this is span</span>
</div> */}
const element = createElement(
  "div",
  {
    id: "myId"
  },
  "hello react",
  createElement("span", null, "this is span")
)

console.log('element',element)

render(element, document.querySelector("#main"))