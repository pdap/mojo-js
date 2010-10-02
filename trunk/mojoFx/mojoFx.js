/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window){ 
	
	var 
		// 动画功能接口
		mojoFx = {
			
			/**
			 * 添加动画的元素
			 * 
			 * @param  {HTMLElement/Array/NodeList} arg  应用动画的元素或元素数组
			 * @return {Object} mojoFx
			 * 
			 */
			set: function(arg) {
				joFx.elems = arg.length ? arg : [arg];
				return this;
			},

			/**
			 * 执行动画
			 * 
			 * @param  {Object} prop 动画属性信息
			 * @return {Object} mojoFx
			 */
			anim: function(prop) {
				var 
					// 动画配置信息
					cfg = {
						prop: prop,
						
						// 动画时间
						dur: 400,
						
						// 动画完成回调函数
						callback: null,
						
						// 动画缓冲效果
						easing: "swing",
						
						// 回调函数上下文
						context: window,
						
						// 回调函数参数
						args: []
					},
					len = arguments.length,
					i   = 1,
					p, param;

				for(; i < len; i++) {
					param = arguments[i];
					switch(typeof param) {
						case "number":
							cfg.dur = param;
							break;
						
						case "string":
							cfg.easing = param;
							break;
							
						case "function":
							cfg.callback = param;
							break;
						
						// 对象配置参数	
						case "object":
							for(p in param) {
								cfg[p] = param[p];
							}			
					}
				}
				
				// 动画配置信息绑定到HTMLElement
				joFx.addElStep(cfg);
				
				if(!joFx.tid) {
					joFx.animStart();
				} 
				
				return this;				
			},
			
			/**
			 * 动画队列延迟
			 * 
			 * @param  {Number} t  延迟时间
			 * @return {Object} mojoFx
			 */
			delay: function(t) {

				return this;
			},
			
			/**
			 * 停止动画
			 * 
			 * @param stopNow 是否立即停止
			 */
			stop: function(stopNow) {
				var 
					els = joFx.elems,
					len = els.length,
					i = 0, el;
				
				for(; i < len; i++) {
					el = els[i];
					
					(el = el.mojoFxQue).length = 0;
					if(stopNow) {
						el.curStep.length = 0;
					}
				}	
				
				return this;
			},
			
			/**
			 * 添加缓冲算法
			 * 
			 * @param  {Object} tween 补间动画算法
			 * @return {Object} mojoFx
			 */
			addTween: function(tween) {
				var 
					twn = joFx.tween, p;
				
				for(p in tween) {
					twn[p] = tween[p];
				}	
				
				return this;
			},
			
			/**
			 * 
			 * @param {String} n
			 * @param {Function} f
			 */
			setTween: function(n, f) {
				joFx[n] = v;
				return this;
			},
			
			/**
			 * 
			 */
			getTween: function() {
				return joFx.tween;
			}				
		},
		
		// 动画辅助对象
		joFx = {
			
			// 动画缓冲算法
			tween: {
			   /**
		 	    * @param {Number} t current time    当前时间
		 	    * @param {Number} b beginning value 初始值
		 	    * @param {Number} c change value    变化量
		        * @param {Number} d duration        持续时间
		 	    */
				swing: function(t, b, c, d){
					return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
				}				
			},
			
			// 动画时钟句柄
			tid: 0,
			
			// 需要动画的元素数组
			elems: null,
			
			// 正在动画元素数组
			animEls: [],

			/**
			 * 获取HTMLElement当前对应style属性值
			 * 
			 * @param  {HTMLElement} el 
			 * @param  {String}      p  style属性名
			 */
			getElStyle: function(el, p) { 
				var 
					curElSty = el.currentStyle || window.getComputedStyle(el, null),
					elSty    = el.style;
				
				if(p === "opacity") {
					return elSty.opacity || 
						curElSty.opacity ||
						(el.filters.alpha ? el.filters.alpha.opacity : 100) / 100;
				}
				
				return elSty[p] || curElSty[p];
			},
			
			/**
			 * 转换颜色属性值为十进制
			 * 
			 * @param  {String} color 颜色字符串
			 * @return {Array}  rgb   三色十进制值的数组
			 */
			getColorTen: function(color) {
				var 
					rgb, i;
				
				if(color.indexOf("#") === 0) {
					//#000形式
					if(color.length === 4) {
						color = color.replace(/\w/g, "$&$&");
					}
					
					rgb = [];
					
					//#000000形式
					for (i = 0; i < 3; i++) {
						rgb[i] = parseInt(color.substring(2 * i + 1, 2 * i + 3), 16);
					}					
				
				//rgb(0,0,0)形式	
				} else {	
				   // 元素透明,没有颜色
				   if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
				   		rgb = [255, 255, 255];
				   } else {
				   		rgb = color.match(/\d+/g);
				   		for (i = 0; i < 3; i++) {
				   			rgb[i] = parseInt(rgb[i]);
				   		}
				   }
				}

				return rgb;				
			},
			
			/**
			 * 动画配置信息绑定到HTMLElement
			 * 
			 * @param {Object} cfg 动画配置信息对象
			 */
			addElStep: function(cfg) {
				var 
					els   = this.elems,
					aEls  = this.animEls,
					len   = els.length,
					i     = 0,
					el, que;
					
				for(; i < len; i++) {
					el = els[i];

					que = el.mojoFxQue;
					
					if(que) {
						que.push(cfg);
					} else {
						aEls.push(el);
						el.mojoFxQue = [cfg];
					}
				}					
				
			},
			
			/**
			 * 计算动画步骤
			 * 
			 * @param {HTMLElement} el   
			 * @param {Object} cfg  动画配置对象
			 */
			getElStep: function(el, cfg) {
				var 
					easing = cfg.easing,
					prop   = cfg.prop,
					fxs    = cfg.fxs,
					step   = [],
					p, val, fx;
				
				if (!fxs) {
					fxs = [];
					
					// 计算每个动画属性
					for (p in prop) {
						fx  = {};
						
						// 属性名
						fx.name = p;
						// 动画类型
						fx.easing = this.tween[easing];
						// 属性值
						val = prop[p]; 
						
						switch (typeof val) {
							// 属性值是数字
							case "number":
								// 符号
								fx.symbol = "";
								// 值
								fx.val = val;
								// 单位
								fx.unit = "px";
								
								break;
								
							// 属性值是数组形式,第2个参数是easing值	
							case "object":
								if (val.length > 1) {
									fx.easing = this.tween[val[1]];
								}
								val = val[0];
								// 这里没有break
								
							case "string":
								// 非颜色属性
								if (p.toLowerCase().indexOf("color") === -1) {
									// 字符串形式
									// 解析符号单位
									val = /(\+=|-=)?(-?\d+)(\D*)/.exec(val);
									// 符号
									fx.symbol = val[1];
									// 值
									fx.val = val[2];
									// 单位
									fx.unit = val[3] || "px";
									
								// 颜色属性							
								} else {
									fx.val = val;
									// 单位用"#"
									fx.unit = "#";
								}
						}
						
						fxs.push(fx);
					}
					
					cfg.fxs = fxs;
				}
				
				// 回调函数
				step.callback = cfg.callback;
				// 回调函数上下文
				step.context = cfg.context;
				// 回调函数参数
				step.args = cfg.args;
				// 动画持续时间
				step.dur = cfg.dur;
				// 动画执行时间
				step.t   = 0;
				
				
				return this.setBc(el, fxs, step);	
			},

			/**
			 * 计算动画步骤的初始值和变化值
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Array}       fxs  动画步骤信息数组
			 * @return {Array}       step 动画步骤对象数组
			 */
			setBc : function(el, fxs, step) {
				var 
					len = fxs.length,
					i   = 0,
					fx, b, c, p, s, u;
					
				for(; i < len; i++) {
					fx = fxs[i];
					
					// 属性名
					p = fx.name;
					// 符号
					s = fx.symbol;
					// 最终值
					c = fx.val;
					// 单位
					u = fx.unit;
					
					// 非颜色属性
					if (u !== "#") {
						// style属性
						if (typeof el[p] === "undefined") {
							// 获得当前元素对应属性值
							(b = this.getElStyle(el, p)) ? b = parseFloat(b) : b = 0;
							
						} else {
							b = el[p];
							// 非style属性单位用"&"
							u = "&";
						}
						
						// 判断符号,设置变化值
						switch (s) {
							case "+=":
								c = c * 1;
								break;
								
							case "-=":
								c = c * 1 - c * 2;
								break;
								
							default:
								c = c * 1 - b;
						}
						
						if (c === 0) {
							continue;
						}
						
					} else {
						b = this.getColorTen(this.getElStyle(el, p));
						c = this.getColorTen(c);
						
						// 计算颜色变化量
						c[0] -= b[0];// red
						c[1] -= b[1];// green
						c[2] -= b[2];// blue
						
						if (c.join("") === "000") {
							continue;
						}
					}
					
					step.push({
						p    : p.replace(/[A-Z]/g, "-$&"),
						b    : b,
						c    : c,
						u    : u,
						twn  : fx.easing
					});
				}
				
				return step;
			},
			
			/**
			 * 启动动画时钟
			 */
			animStart : function() {
				var 
				    ths   = this,
					start = new Date().getTime();	
				
				this.tid = window.setInterval(function(){
					var end = new Date().getTime();
					ths.updateEl(end - start);
					start = end;
				}, 13);
			},
			
			/**
			 * 更新HTMLElement动画属性
			 * 
			 * @param {Number} stepTime  每次更新属性消耗的时间
			 */
			updateEl : function(stepTime) {
				var 
					aEls = this.animEls,
					len  = aEls.length,
					i    = 0,
					el, que, cur;
			
				for(; i < len; i++) {
					el = aEls[i];
					
					// HTMLElement动画队列数组
					que = el.mojoFxQue;
					// HTMLElement当前正在执行的动画属性数组
					cur = que.curStep || (que.curStep = this.getElStep(el, que.shift()));
					
					// 当前动画属性完成,从队列中取出一个
					while(!cur.length) {
						if (cur = que.shift()) { 
							cur = que.curStep = this.getElStep(el, cur);
							
						// el所有动画属性完成
						} else {
							break;
						}
					}			
					
					if (cur) {
						if((cur.t += stepTime) > cur.dur) {
							cur.t = cur.dur;
							this.step(el, cur);
							cur.length = 0;
							
							if (cur.callback) {
								cur.args.push(el);
								cur.callback.apply(cur.context, cur.args);
							}
							
							continue;
						}
						this.step(el, cur);
					} else {
						aEls.splice(i, 1);
						el.mojoFxQue = null;
						i--;
						
						// 动画元素数组执行完成
						if ((len = aEls.length) === 0) {
							window.clearInterval(this.tid);
							this.tid = 0;
							return;
						}
					}
				}					
			},
			
			/**
			 * 更新动画元素
			 * 
			 * @param {HTMLElement} el    
			 * @param {Array}       step 动画配置对象数组
			 */
			step: function(el, step) {
				var 
					len = step.length,
					dur = step.dur,
					t   = step.t,
					sty = ";",
					i   = 0,
					fx, p, b, c, u, twn;

				for(; i < len; i++) {
					fx  = step[i]; 
					
					p   = fx.p; 
					b   = fx.b;
					c   = fx.c;
					u   = fx.u;
					twn = fx.twn; 
					
					switch (u) {
						// 非style属性
						case "&" :
							el[p] = twn(t, b, c, dur);
							continue;
						
						// 颜色属性	
						case "#" :
							sty += p + ":rgb(" +
								   Math.ceil(twn(t, b[0], c[0], dur)) + "," +
								   Math.ceil(twn(t, b[1], c[1], dur)) + "," +
								   Math.ceil(twn(t, b[2], c[2], dur)) + ");";
							break;
							
						// style属性	
						default:				
							if(p === "opacity") {
								p = twn(t, b, c, dur);
								sty += "opacity:" + p + ";filter:alpha(opacity=" + p * 100 + ");";								
							} else {
								sty += p + ":" + twn(t, b, c, dur) + u + ";";								
							}
					}
				}	

				el.style.cssText += sty;
			}															
		};
		
		// mojoFx注册到window对象上
		window.mojoFx = mojoFx;	
	
})(window);
