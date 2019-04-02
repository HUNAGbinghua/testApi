import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.drag = this.drag.bind(this);
    this.transformCss = this.transformCss.bind(this);
    this.callBack = this.callBack.bind(this);
    this.state = {
      ActiveIndex: "",
      scrollHeight: document.documentElement.clientHeight,
      arr: []
    }
  }
  componentDidMount(){
    const { arr } = this.state;
    const footer = document.querySelector(".footer");
    this.transformCss(footer,"scale",0);
    for(let i=0; i < 100; i++ ){
      arr.push(i+".测试文本");
    }
    this.setState({ arr });
    const dom = document.querySelector(".warp");
    this.drag(dom,this.callBack())
  }

  callBack(){
    let isBottom = false;
    const content = document.querySelector(".content");
    const wrap = document.querySelector(".warp");
    const footer = document.querySelector(".footer");
    const footerH = footer.offsetHeight;
    return {
      start: ()=>{
        console.log("start...");
        //判断是否是底部，isBottom = true;
					var minH = content.offsetHeight - wrap.clientHeight - 10,
          translateY = this.transformCss(content,"translateY");
        if(Math.abs(translateY)>=minH){
          isBottom = true;
        }
      },
      move: ()=>{
        console.log("move...");
        //底部出现
					if(isBottom){
						let minH = content.offsetHeight - wrap.clientHeight - 10,
							translateY = this.transformCss(content,"translateY"),
							footerScale = (Math.abs(translateY) - minH)/footerH;
						footerScale = footerScale > 1?1:footerScale;
            this.transformCss(footer,"scale",Math.abs(footerScale));
            if(isBottom && ((Math.abs(translateY) - minH)>footerH)){
              //禁止回弹
              clearInterval(this.timer);
              //创建li
              
            }
					}

					//加载对应的图片
					// lazyload();//懒加载
      },
      end: ()=>{
        console.log("end.....");
        //isBottom=true,footer必须全部显示
					let minH = content.offsetHeight - wrap.clientHeight - 10,
          translateY = this.transformCss(content,"translateY");
        if(isBottom && ((Math.abs(translateY) - minH)>footerH)){
          //禁止回弹
          clearInterval(this.timer);
          //创建li
          
        }
      }
    };
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
              if (s === undefined) s = 1.70158;
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
      const touch = ev.changedTouches[0];
      if(!isY){
        return
      };
      //定义当前手指位置
      const nowY = touch.clientY;
      const disY = nowY - startY;
      const nowX = touch.clientX;
      const disX = nowX - startX;
      if(isFirst){
        isFirst = false;
        if(Math.abs(disX)>Math.abs(disY)){
          isY = false;
        }
      }
      
      //限定范围,越来越难拖
      let translateY = eleY+disY;
      //var minWidth = document.documentElement.clientHeight-bannerList.offsetHeight;
      const minWidth =	banner.clientHeight - bannerList.offsetHeight;
      let scale = 0;
      if(translateY > 0){
        //translateY增加，scale减小
        scale = 0.9 - translateY/document.documentElement.clientHeight;
        //translateY整体是增加状态，但是每一步是增加的越来越少
        translateY = translateY * scale;
      }else if(translateY < minWidth){
        //右边的留白区域
        const over = minWidth - translateY;
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
      //速度
      const speed = disPoint / (nowTime - lastTime) ;
      let target = this.transformCss(bannerList,'translateY') + speed*600;
      //const minWidth = document.documentElement.clientHeight-bannerList.offsetHeight;
      const minWidth =	banner.clientHeight - bannerList.offsetHeight;
      //回弹效果
      let type = 'Linear';
      if(target>0){
        target = 0;
        type = 'easeOut';
      }else if(target < minWidth){
        target = minWidth;
        type = 'easeOut';
      };
      const time = 1;
      move(target,type,time);
    });
    const move = (target,type,time)=>{
      let t = 0;
      const b = this.transformCss(bannerList,'translateY');
      const c = target - b;
      //总次数
      const d = time/0.02;
      clearInterval(this.timer);
      this.timer = setInterval(()=>{
        t++;
        if(t>d){
          if(callback&&callback['end']){
            callback['end']();
          };
          clearInterval(this.timer);
        }else{
          if(callback&&callback['move']){
            callback['move']();
          };
          //返回值，每一步的位置
          const point = Tween[type](t,b,c,d)
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
			let result = "";
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
            default:
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
    const { ActiveIndex, scrollHeight, arr } = this.state;
    return (
      <div className="warp" style={{ height: scrollHeight }}>
          <div className="content">
            <ul className="listWarp">
              {
                arr.map((i,index)=><li key={index} onClick={()=>this.setState({ ActiveIndex: index })} className={index===ActiveIndex ? "activeStyle": ""}>{i}</li>)
              }
            </ul>
            {<div className="footer" >上滑加载更多</div>}
          </div>
      </div>
    );
  }
}

export default App;
