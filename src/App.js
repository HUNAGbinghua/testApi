import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Drag from './components/drag';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeIndex: "",
    }
  }
  componentDidMount(){
   
  }

  render() {
    const { activeIndex } = this.state;
    let arr = [];
    for(let i=0; i < 130; i++ ){
      arr.push(i+".测试文本");
    }
    return (
      <div className="warp">
        <Drag> 
         {arr.map((i,index)=><li key={index} onClick={()=>{this.setState({ activeIndex: index });console.log(index);}} className={index===activeIndex ? "activeStyle": ""}>{i}</li>)}
        </Drag>
      </div>
    );
  }
}

export default App;
