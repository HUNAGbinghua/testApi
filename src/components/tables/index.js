import React, { Component } from 'react';
import { Button, Input } from 'element-react/next';

class Index extends Component {
  constructor(props){
    super(props);
    this.addTrItem = this.addTrItem.bind(this);
    this.deleteTrItem = this.deleteTrItem.bind(this);
    this.changeInputValue = this.changeInputValue.bind(this);
    this.renderTableList = this.renderTableList.bind(this);
    this.refStatus = this.refStatus.bind(this);
    this.state = {
      trArr: [{key: "", value: ""}]
    }
  }
  componentDidMount(){
    const { localStorageData } = this.props;
    if(localStorageData){
      this.setState({ trArr: localStorageData() })
    }
  }

  deleteTrItem(index){
    let { trArr } = this.state;
    trArr.splice(index, 1);
    this.setState({ trArr });
    this.refStatus();
  }

  addTrItem(){
    let { trArr } = this.state;
    trArr.push({ key: "", value: "" });
    this.setState({ trArr });
  }

  changeInputValue(type,value,index){
    let { trArr } = this.state;
    trArr[index][type] = value.trim();
    this.setState({ trArr });
    this.refStatus();
  }

  refStatus(){
    return new Promise((reject)=>{
      const { getRequestData } = this.props;
      let { trArr } = this.state;
      if(getRequestData){
        trArr = trArr.filter((data)=>data.key.trim()&&data.value.trim()).map((data)=>({key: data.key.trim(), value: data.value.trim()}));
        getRequestData(trArr);
        reject();
      }
    })
  }

  renderTableList(){
    const { trArr } = this.state;
    return (
      <div>
       {trArr.length>0? <table className="tableWarp">
          <thead>
            <tr>
              <td>key</td>
              <td>value</td>
              <td>操作</td>
            </tr>
          </thead>
          <tbody>
            {
              trArr.map((item,index)=>(
                <tr key={index}>
                  <td><Input placeholder="请输入参数名称" value={item.key} onChange={(key)=>this.changeInputValue("key",key,index)}/></td>
                  <td><Input placeholder="请输入参数值" value={item.value} onChange={(value)=>this.changeInputValue("value",value,index)}/></td>
                  <td><Button onClick={()=>this.deleteTrItem(index)} plain type="danger"><i className="el-icon-delete"></i></Button></td>
              </tr>
              ))
            }
          </tbody>
        </table>: <div style={{ textAlign: "center", lineHeight: 15 }}>暂无数据</div>}
        <div style={{ textAlign: "center" }}>
          <Button onClick={this.addTrItem} type="primary" plain><i className="el-icon-plus"></i>添加</Button>
      </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderTableList()}
      </div>
    );
  }
}

export default Index;
