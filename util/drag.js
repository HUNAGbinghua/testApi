	function transformCss(node,name,value){
		//检测node上面到底有没有transform属性，如果没有，添加进去
		if(!node.transform){
			node.transform = {};
		}
		
		//通过实参的数量，判断是否是写的操作
		if(arguments.length > 2){
			// 写
			//把对应的name和value添加到对象中
			node.transform[name] = value;
			//用来保存各个name和value的js拼串代码
			var result = '';
			//对象里面的属性，进行遍历
			for(var item in node.transform){
				//根据name，写出相应的执行代码
				switch (item){
					case 'rotate':
					case 'skew':
					case 'skewX':
					case 'skewY':
						result += item +'('+ node.transform[item] +'deg) '
						break;
					case 'scale':
					case 'scaleX':
					case 'scaleY':
						result += item +'('+ node.transform[item] +') '
						break;
					case 'translate':
					case 'translateX':
					case 'translateY':
					case 'translateZ':
						result += item +'('+ node.transform[item] +'px) '
						break;						
				}					
			}
			
			//给node添加style样式
			node.style.transform = result;
			
		}else{
			//读
			//通过数据类型，判断是否是默认情况
			if(typeof node.transform[name] == 'undefined'){
				//默认情况
				if(name == 'scale' || name == 'scaleX' || name == 'scaleY'){
					value = 1
				}else{
					value = 0
				}
			}else{
				//正常情况
				value = node.transform[name];
			}
			//返回值
			return value;
		}
					
	}
	
		function drag(banner,callback){
			//快速滑屏，橡皮筋效果，即点即停
//			var banner = document.getElementById('wrap');
//			var bannerList = document.getElementById('content');
			var bannerList = banner.children[0];
			transformCss(bannerList,'translateZ',0.01);
			
			//定义手指和元素初始位置
			var startY = 0;
			var eleY = 0;
			
			//上一点的位置和时间
			var lastPoint = 0;
			var lastTime = 0;
			//现在的位置和时间
			var nowPoint = 0;
			var nowTime = 0;
			//位移差和时间差
			var disPoint = 0;
//			var disTime = 1;
			var disTime = 0;
			
			//抖动
			var startX = 0;
			var isFirst = true;
			var isY = true;
			
			var Tween = {
				//匀速效果
				Linear: function(t,b,c,d){ return c*t/d + b; },
				//回弹效果			
				easeOut: function(t,b,c,d,s){
		            if (s == undefined) s = 1.70158;
		            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		        }		
			};
			
			banner.addEventListener('touchstart',function(ev){
				var touch = ev.changedTouches[0];
				
				clearInterval(bannerList.timer);
				
				bannerList.style.transition = 'none';
				
				startY = touch.clientY;
				eleY = transformCss(bannerList,'translateY');
					
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
			banner.addEventListener('touchmove',function(ev){
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
				var minWidth = document.documentElement.clientHeight-bannerList.offsetHeight;
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
				
				transformCss(bannerList,'translateY',translateY);
				
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
			banner.addEventListener('touchend',function(ev){
				var touch = ev.changedTouches[0];
				//速度
//				var speed = disPoint / disTime;
				var speed = disPoint / (nowTime - lastTime) ;
				
				var target = transformCss(bannerList,'translateY') + speed*100;
				var minWidth = document.documentElement.clientHeight-bannerList.offsetHeight;
				
//				console.log(target)
				
				//回弹效果
				var type = 'Linear';
				if(target>0){
					target = 0;
					type = 'easeOut';
				}else if(target < minWidth){
					target = minWidth;
					type = 'easeOut';
				};
				var time = 3;
				move(target,type,time);
			});
			function move(target,type,time){
				
				var t = 0;
				var b = transformCss(bannerList,'translateY');
				var c = target - b;
				//总次数
				var d = time/0.02;
				clearInterval(bannerList.timer);
				bannerList.timer = setInterval(function(){
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
						transformCss(bannerList,'translateY',point);
					}
					
				},20);
			}
		};