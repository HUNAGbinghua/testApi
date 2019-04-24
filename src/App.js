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
    this.changeValue = this.changeValue.bind(this);
    this.textParseObj = this.textParseObj.bind(this);
    this.sliceKeyName = this.sliceKeyName.bind(this);
    this.state = {
      activeIndex: "",
      urlValue: "",
      method: "post",
      trArr: [],
      xiaGuaArr: [],
      isShowDemoModel: false,
      isFetchLoading: false,
      testValue: ""
    }
  }
  componentDidMount(){
    if(!(readTodos("urlValue") instanceof Array)){
      this.setState({ urlValue: readTodos("urlValue") });
    }
  }

  async onFetchData(){
    // {name: "abc",age:"19"}
    // return console.log(this.textParseObj(this.state.testValue,","));
    // 更新子组件中得状态
    await this.refs.tables.refStatus();
    const { 
      trArr, 
      xiaGuaArr, 
      urlValue, method } = this.state;
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

  sliceKeyName(keyNameStr, symbol=":"){
   return keyNameStr.split(symbol).map((i)=>i);
  }

  textParseObj(str,sliceSymbol=","){
    /*
      1.先拆分字符串
      2.找出key和value组合成对象
      3.返回对象
    */ 
   if(typeof str !=="string")return{}
   const hasBraces = /^\{/.test(str);
   const isSurplusSymbol =/\s+|\'|\"|/g;
   //  去除多余得空格和符号
   str = str.replace(isSurplusSymbol,"");
    // 是否有大括号 有则删除
    let newObj = {};
    const value = str.substring(str.search(":")+1);
    const reg = /^\[.*\]$/g;
    // 判断是否是数组格式
    if(reg.test(value)){
      const key = str.substring(0,str.search(":"));
      newObj[key] = [{value}];
      console.log("是数组的");
      return newObj;
    }else{
      const splitReg = /,(?![^{}]*?})/;
      const keyNameArr = str.split(splitReg);
      keyNameArr.forEach((item)=>{
        const keyNameStrArr = item.split(/:(?![^{}]*?})/);
        const value = item.substring(str.search(":")+1);
        if(/^\[.*\]$/.test(keyNameStrArr[1])){
          // 去除数组中的
          const arrStr = keyNameStrArr[1].replace(/^\[|{|\}|\]$/g,"");
          const ArrKeyName = arrStr.split(splitReg);
          let arrData = [];
          ArrKeyName.forEach((ArrItem)=>{
            const key = ArrItem.substring(0,ArrItem.search(":"));
            const value = ArrItem.substring(ArrItem.search(":")+1);
            arrData.push({[key]:value})
          })
          keyNameStrArr[1] = arrData;
        }
        if(keyNameStrArr[1]==="{}"){
          keyNameStrArr[1] = {};
        }
        newObj[keyNameStrArr[0]] = keyNameStrArr.length > 2 ? this.textParseObj(value) : keyNameStrArr[1]; 
      })
      console.log("没有括号的对象");
      return newObj;
   }
  }

  changeValue(urlValue, type){
    this.setState({ [type]: urlValue });
    saveTodos(type,urlValue);
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
      <div className="warp" style={{ textAlign: "center" }}>
        <div style={{ textAlign: "center", marginTop: "150px",  position: "relative" }}>
          <select style={{width: 50, display: "inline-block", height: 40, marginRight: 5}} onChange={(e)=>this.setState({ method: e.target.value })} placeholder="请选择">
            {["post","get"].map((item,index)=><option label={item} key={index}>{item}</option>)}
          </select> 
          <Input style={{ width: 500 }} value={urlValue} onChange={(urlValue)=>this.changeValue(urlValue,"urlValue")}/>
          <Button style={{ position: "absolute", marginLeft: 5 }} type="text" onClick={this.isShowDemoModel}>查看示例</Button>
        </div>
        {/*<Input type="textarea" style={{marginTop: 50, width: 500 }} ref={(el)=>this.testValue=el} rows={9} value={testValue} onChange={(testValue)=>this.changeValue(testValue,"testValue")}/>*/}
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
