const saveTodos = (key, todos)=>{
  localStorage.setItem(key,JSON.stringify(todos)) 
}

const readTodos = (key)=>{
  return JSON.parse(localStorage.getItem(key)||"[]") 
}

export { saveTodos, readTodos }