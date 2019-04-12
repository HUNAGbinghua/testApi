import React, { Component } from 'react';
import './App.css';
import axios from "axios";
import Tables from './components/tables';
import XiaGuaTables from './components/xiaGuaTables';
import { Button, Input, Dialog, MessageBox, Card, Message } from 'element-react/next';
import img from "./imgs/demoImg.png";
import JSONFormatter from "json-formatter-js";
import { readTodos, saveTodos } from "./utils/localStorage.js";

class App extends Component {
  constructor(props){
    super(props);
    this.onFetchData = this.onFetchData.bind(this);
    this.changeInputValue = this.changeInputValue.bind(this);
    this.getRequestData = this.getRequestData.bind(this);
    this.getXiaGuaData = this.getXiaGuaData.bind(this);
    this.renderDemoHtml = this.renderDemoHtml.bind(this);
    this.isShowDemoModel = this.isShowDemoModel.bind(this);
    this.changeUrlValue = this.changeUrlValue.bind(this);
    this.state = {
      activeIndex: "",
      urlValue: "",
      method: "post",
      trArr: [],
      xiaGuaArr: [],
      isShowDemoModel: false,
      isFetchLoading: false
    }
  }
  componentDidMount(){
    if(!(readTodos("urlValue") instanceof Array)){
      this.setState({ urlValue: readTodos("urlValue") });
    }
  }

  async onFetchData(){
    await this.refs.tables.refStatus();
    const { trArr, xiaGuaArr, urlValue, method } = this.state;
    this.setState({ isFetchLoading: true });
    let requestData = {};
    trArr.forEach((item)=>{
      requestData[item.key] = item.value;
    });
    xiaGuaArr.forEach((item)=>requestData[item.xiaGuaName] = item.data);
    axios.defaults.headers['Access-Control-Allow-Origin'] = '*';
    axios.defaults.headers['X-Requested-With'] = 'X'; 
    axios({
      method,
      url: `/sap/opu/odata/sap/${ urlValue }`,
      data: requestData
    }).then((data)=>{
      const formatter = new JSONFormatter(data.data);
      const dataBox = document.getElementById("dataBox");
      MessageBox.alert("提交成功", "提示", { type: "success" });
      if(dataBox){
        dataBox.appendChild(formatter.render());
        [].slice.call(dataBox.children).forEach((node)=>node.style.borderBottom = "1px solid #f0f0f0")
      }
    this.setState({ isFetchLoading: false });
    },(err)=>{
      MessageBox.alert(err.response.data.error.message.value||"请求错误","接口错误", { type: "warning" });
      this.setState({ isFetchLoading: false });
    })
  }

  changeUrlValue(urlValue){
    this.setState({ urlValue: urlValue.trim() });
    saveTodos("urlValue",urlValue);
  }

  renderDemoHtml(){
    return  (
      <div>
        <img alt="演示" className="imgStyle" src={img}/>
      </div>
    )
  }

  isShowDemoModel(){
    this.setState({ isShowDemoModel: !this.state.isShowDemoModel })
  }

  getRequestData(trArr){
    this.setState({ trArr });
    saveTodos("trArr", trArr);
  }

  changeInputValue(type,value,index){
    let { trArr } = this.state;
    trArr[index][type] = value;
    this.setState({ trArr });
  }

  getXiaGuaData(xiaGuaArr){
    this.setState({ xiaGuaArr });
  }

  render() {
    const { urlValue, isShowDemoModel, isFetchLoading } = this.state;
    return (
      <div className="warp">
        <div style={{ textAlign: "center", marginTop: "150px",  position: "relative" }}>
          <select style={{width: 50, display: "inline-block", height: 40, marginRight: 5}} onChange={(e)=>this.setState({ method: e.target.value })} placeholder="请选择">
            {["post","get"].map((item,index)=><option label={item} key={index}>{item}</option>)}
          </select> 
          <Input style={{ width: 500 }} value={urlValue} onChange={(urlValue)=>this.changeUrlValue(urlValue)}/>
          <Button style={{ position: "absolute", marginLeft: 5 }} type="text" onClick={this.isShowDemoModel}>查看示例</Button>
        </div>
        <Tables getRequestData={this.getRequestData} localStorageData={()=>readTodos("trArr")} ref="tables"/>
        <XiaGuaTables getXiaGuaData={this.getXiaGuaData}/>
        <div style={{ textAlign: "center" }}>
          <Button type={isFetchLoading ? "info":"primary"} style={{ margin: "100px auto 0" }} loading={isFetchLoading} onClick={this.onFetchData}>点击发送请求</Button>
        </div>
        <Dialog
          title="使用说明"
          closeOnClickModal={true}
          showClose={true}
          visible={isShowDemoModel}
          size="full"
          style={{ width: "90%" }}
          onCancel={this.isShowDemoModel}
          >
          {this.renderDemoHtml()}
          <div style={{ textAlign: "right", padding: 20 }} className="dialog-footer">
            <Button type="primary" onClick={this.isShowDemoModel}>确定</Button>
          </div>
        </Dialog>
        <Card style={{ width: 900, margin: "100px auto" }}>
          <div id="dataBox"></div>
        </Card>
      </div>
    );
  }
}

export default App;
