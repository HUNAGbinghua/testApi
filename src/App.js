import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.foo = this.foo.bind(this);
    this.drag = this.drag.bind(this);
    this.transformCss = this.transformCss.bind(this);
    this.state = {
      ActiveIndex: "",
      scrollHeight: document.documentElement.clientHeight
    }
  }
  componentDidMount(){
    const f1 = new this.foo();
    console.log(this.foo.prototype===f1._proto_);
    const o1 = new Object();
    console.log({}.prototype===o1._proto_);
    const dom = document.querySelector(".App");
    this.drag(dom,()=>{
      console.log("滑动啦！！！");
    })
  }

  foo(){

  }

  drag(banner,callback){
    //快速滑屏，橡皮筋效果，即点即停

    const bannerList = banner.children[0];   //获取到外包裹容器的第一个子节点
    this.transformCss(bannerList,'translateZ',0.01);
    
    //定义手指和元素初始位置
    let startY = 0;
    let eleY = 0;
    
    //上一点的位置和时间
    let lastPoint = 0;
    let lastTime = 0;
    //现在的位置和时间
    let nowPoint = 0;
    let nowTime = 0;
    //位移差和时间差
    let disPoint = 0;
//			var disTime = 1;
    let disTime = 0;
    
    //抖动
    let startX = 0;
    let isFirst = true;
    let isY = true;
    
    
    const Tween = {
      //匀速效果
      Linear: (t,b,c,d)=>{ return c*t/d + b; },
      //回弹效果			
      easeOut: (t,b,c,d,s)=>{
              if (s == undefined) s = 1.70158;
              return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
          }		
    };
    
    banner.addEventListener('touchstart',(ev)=>{
      ev.preventDefault();
      const touch = ev.changedTouches[0];
      
      clearInterval(bannerList.timer);
      
      bannerList.style.transition = 'none';
      
      startY = touch.clientY;
      eleY = this.transformCss(bannerList,'translateY');
        
      startX= touch.clientX;
        
      //上一点的位置和时间
      lastPoint = eleY;
      lastTime = new Date().getTime();//毫秒
      
      //清空速度
      disPoint = 0;
      
      if(callback&&callback['start']){
        callback['start']();
      };
      
      isFirst = true;
      isY = true;
      
    });
    banner.addEventListener('touchmove',(ev)=>{
      var touch = ev.changedTouches[0];
      
      if(!isY){
        return
      };
      
      
      //定义当前手指位置
      var nowY = touch.clientY;
      var disY = nowY - startY;
      
      var nowX = touch.clientX;
      var disX = nowX - startX;
      
      if(isFirst){
        
        isFirst = false;
        if(Math.abs(disX)>Math.abs(disY)){
          isY = false;
        }
                  
      }
      
      //限定范围,越来越难拖
      var translateY = eleY+disY;
      //var minWidth = document.documentElement.clientHeight-bannerList.offsetHeight;
      var minWidth =	banner.clientHeight - bannerList.offsetHeight;
      
      var scale = 0;
      if(translateY > 0){

        //translateY增加，scale减小
        scale = 0.9 - translateY/document.documentElement.clientHeight;
        //translateY整体是增加状态，但是每一步是增加的越来越少
        translateY = translateY * scale;
        
      }else if(translateY < minWidth){
        //右边的留白区域
        var over = minWidth - translateY;
        scale = 0.9 - over/document.documentElement.clientHeight;
        
        translateY = minWidth - over*scale;
      };
      
      this.transformCss(bannerList,'translateY',translateY);
      
      //现在的位置和时间
      nowPoint = translateY;
      nowTime = new Date().getTime();
      
      //位移差和时间差
      disPoint = nowPoint - lastPoint;
      disTime = nowTime - lastTime;
      
      
      if(callback&&callback['move']){
        callback['move']();
      };
    });
    //快速滑屏和回弹
    banner.addEventListener('touchend',(ev)=>{
      var touch = ev.changedTouches[0];
      //速度
      var speed = disPoint / (nowTime - lastTime) ;
      
      
      var target = this.transformCss(bannerList,'translateY') + speed*600;
      //var minWidth = document.documentElement.clientHeight-bannerList.offsetHeight;
      var minWidth =	banner.clientHeight - bannerList.offsetHeight;
      
      //回弹效果

      var type = 'Linear';
      if(target>0){
        target = 0;
        type = 'easeOut';
      }else if(target < minWidth){
        target = minWidth;
        type = 'easeOut';
      };
              
      var time = 1;
      move(target,type,time);
      
              
    });
    const move = (target,type,time)=>{
      var t = 0;
      var b = this.transformCss(bannerList,'translateY');
      var c = target - b;
      //总次数
      var d = time/0.02;
      clearInterval(bannerList.timer);
      bannerList.timer = setInterval(()=>{
        t++;
        
        if(t>d){
          if(callback&&callback['end']){
            callback['end']();
          };
          clearInterval(bannerList.timer);
        }else{
          if(callback&&callback['move']){
            callback['move']();
          };
          //返回值，每一步的位置
          var point = Tween[type](t,b,c,d)
          this.transformCss(bannerList,'translateY',point);
        }
        
      },20);				
      
    }
    
  };

  transformCss(node,name,value){
		if(!node.transform){
			node.transform = {};
		}
		if(arguments.length > 2){
			node.transform[name]= value;
			var result = "";
			for (var item in node.transform) {
				switch (item){
					case "rotate":
					case "skew":
					case "skewX":
					case "skewY":
						result += item+"("+node.transform[item]+"deg)";
						break;
					case "scale":
					case "sclaeX":
					case "sclaeY":
						result += item+"("+node.transform[item]+")";
						break;
					case "translate":
					case "translateX":
					case "translateY":
					case "translateZ":
						result += item+"("+node.transform[item]+"px)";
						break;
				}
			}
			node.style.transform = result;
		}else{
			if(typeof node.transform[name] === "undefined"){
				if(name==="scale" || name==="scaleX" || name==="scaleY"){
					value = 1;
				}else{
					value = 0;
				}
			}else{
				value = node.transform[name];
			}
			return value;
		}
	}

  render() {
    let arr = [];
    for(let i=0; i < 100; i++ ){
      arr.push(i+".测试文本");
    }
    const { ActiveIndex, scrollHeight } = this.state;
    return (
      <div className="App" style={{ height: scrollHeight }}>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <ul className="listWarp">
            {
              arr.map((i,index)=><li key={index} onClick={()=>this.setState({ ActiveIndex: index })} className={index===ActiveIndex ? "activeStyle": ""}>{i}</li>)
            }
          </ul>
            黄炳华
        </header>
      </div>
    );
  }
}

export default App;
