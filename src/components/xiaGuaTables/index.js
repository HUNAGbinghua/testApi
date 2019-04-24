import React, { Component } from 'react';
import Tables from '../tables';
import { Input, Button } from 'element-react/next';

let i = 0;

class Index extends Component {
  constructor(props){
    super(props);
    this.addXiaGuaTables = this.addXiaGuaTables.bind(this);
    this.deleteXiaGua = this.deleteXiaGua.bind(this);
    this.changeValue = this.changeValue.bind(this);
    this.getTablesData = this.getTablesData.bind(this);
    this.state = {
      xiaGuaArr: []
    }
  }
  componentDidMount(){
   
  }

  deleteXiaGua(index){
    let { xiaGuaArr } = this.state;
    xiaGuaArr.splice(index,1);
    this.setState({ xiaGuaArr });
  }

  addXiaGuaTables(){
    let { xiaGuaArr } = this.state;
    xiaGuaArr.push({xiaGuaName: "", data: []});
    this.setState({ xiaGuaArr });
    
  }

  changeValue(value,index){
    let { xiaGuaArr } = this.state;
    const { getXiaGuaData } = this.props;
    xiaGuaArr[index].xiaGuaName = value.trim();
    this.setState({ xiaGuaArr });
    if(getXiaGuaData){
      getXiaGuaData(xiaGuaArr);
    }
  }

  getTablesData(data, index){
    const { xiaGuaArr } = this.state;
    xiaGuaArr[index].data = data
    this.setState({ xiaGuaArr });
  }

  render() {
    const { xiaGuaArr } = this.state;
    return (
      <div style={{ width: 550, margin: "auto" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ margin: "10px 0", textAlign: "left" }}><Button type="primary" style={{ width: 100 }} plain onClick={this.addXiaGuaTables}>添加下挂</Button></div>
        </div>
        {
          xiaGuaArr.map((item,index)=>(
            <div key={index}>
              <h4 style={{ textAlign: "center" }}> 下挂结构 <Button style={{ float: "right" }} plain type="danger" onClick={()=>this.deleteXiaGua(index)}><i className="el-icon-delete"></i>删除下挂</Button></h4>
              <div style={{ textAlign: "center" }}><Input value={item.xiaGuaName} style={{ width: 550 }} onChange={(value)=>this.changeValue(value,index)} placeholder="请输入下挂名称" /></div>
              <Tables getRequestData={(data)=>this.getTablesData(data, index)}/>
            </div>
          )) 
        }
      </div>
    );
  }
}

export default Index;
