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
			 * @return {Object}                     mojoFx
			 * 
			 */
			set : function(arg) {
				joFx.elems = arg.length ? arg : [arg];
				return this;
			},

			/**
			 * 执行动画
			 * 
			 * @param  {Object} info 动画配置信息
			 * @return {Object} mojoFx
			 */
			anim : function(info) {
				var 
					opt      = arguments[1] || "",
					// 动画时间
					dur      = opt.dur || 400,
					// 动画完成回调函数
					complete = opt.complete  || null,
					// 动画缓冲效果
					easing   = opt.easing || "swing",		
					// 回调函数上下文
					ctx      = opt.ctx || null,
					// 回调函数参数
					args     = opt.args,
				    val, len;
				
				//不定参数形式
				if (typeof opt !== "object") {
					for (opt = 1, len = arguments.length; opt < len; opt++) {
						val = arguments[opt];
						switch (typeof val) {
							case "number":
								dur = val;
								break;
							case "function":
								complete = val
								break;
							case "string":
								easing = val;
						}
					}
				} 
				
				// 动画配置对象绑定到HTMLElement上
				joFx.addElStep({
					complete : complete,
					easing   : easing,
					info     : info,
					args     : args,
					dur      : dur,
					ctx      : ctx
				});
				
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
			delay : function(t) {
				joFx.addElStep({
					isDelay : true,
					dur     : t,
					p   	: "delay",
					t       : 0
				});
				
				return this;
			},
			
			/**
			 * 添加缓冲算法
			 * 
			 * @param  {Object} tween
			 * @return {Object} mojoFx
			 */
			addTween : function(tween) {
				var 
					twn = joFx.tween,
					p;
				
				for(p in tween) {
					twn[p] = tween[p];
				}	
				
				return this;
			}				
		},
		
		// 动画辅助对象
		joFx = {
			
			// 动画缓冲算法
			tween : {
			   /**
		 	    * @param {Number} t current time    当前时间
		 	    * @param {Number} b beginning value 初始值
		 	    * @param {Number} c change value    变化量
		        * @param {Number} d duration        持续时间
		 	    */
				swing : function(t, b, c, d){
					return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
				}				
			},
			
			// 动画时钟句柄
			tid : 0,
			
			// 需要动画的元素数组
			elems : null,
			
			// 正在动画元素数组
			animEls : [],
			
			/**
			 * 设置el对应style属性
			 * 
			 * @param {HTMLElement} el   
			 * @param {String}      p    style属性名
			 * @param {Number}      val  style属性值
			 */
			setElStyle : function(el, p, val) {
				var 
					elSty = el.style;

  				switch (p) {
					case "float":
						typeof elSty.styleFloat === "string" ? elSty.styleFloat = val 
															 : elSty.cssFloat   = val;
						break;
						
					case "opacity":
						el.filters ? elSty.filter = (el.currentStyle.filter || "")
							         .replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + val * 100 + ")"
								   : elSty.opacity = val;
						break;
						
					default:
						elSty[p] = val;
				}				
			},
			
			/**
			 * 获取el当前对应style属性值
			 * 
			 * @param  {HTMLElement} el 
			 * @param  {String}      p  style属性名
			 */
			getElStyle : function(el, p) { 
				var 
					curElSty = el.currentStyle || window.getComputedStyle(el, null),
					elSty    = el.style;
				
				switch (p) {
					case "float":
						return typeof elSty.styleFloat === "string" ? 
						    elSty.styleFloat || curElSty.styleFloat : 
							elSty.cssFloat   || curElSty.cssFloat;
							
					case "opacity":
						return el.filters ? (el.filters.alpha ? el.filters.alpha.opacity : 100) / 100
						                  :  elSty.opacity || curElSty.opacity;
					default:
						return elSty[p] || curElSty[p];
				}				
			},
			
			/**
			 * 转换颜色属性值为十进制
			 * 
			 * @param  {String} color 颜色字符串
			 * @return {Array}  rgb   三色十进制值的数组
			 */
			getColorTen : function(color) {
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
			 * 动画配置对象绑定到el上
			 * 
			 * @param {Array} cfg 动画配置信息数组
			 */
			addElStep : function(cfg) {
				var 
					els  = this.elems,
					aEls = this.animEls,
					len  = els.length,
					i    = 0,
					el;
					
				for(; i < len; i++) {
					el = els[i];
					// el元素是否存在动画队列
					el.mojoFxQue ? el.mojoFxQue.push(cfg) : el.mojoFxQue = [cfg];
					// el元素是否存在于动画数组中
					if(!el.isMojoFxAnim) {
						aEls.push(el);
						el.isMojoFxAnim = true;
					}					
				}					
			},
			
			/**
			 * 计算动画步骤
			 * 
			 * @param {HTMLElement} el   HTMLElement
			 * @param {Object}      cfg  动画配置对象
			 */
			getElStep : function(el, cfg) {
				var 
					easing  = cfg.easing,
					info    = cfg.info,
					dur     = cfg.dur,
					fxs     = cfg.fxs,
					prop    = [],
					i       = 0,
					p, val, len;
				
				if (!fxs) {
					// 依次存放属性名,符号,属性值,单位,动画持续时间,动画类型
					fxs = [];
					
					// 计算每个动画属性
					for (p in info) {
						// 属性名
						fxs[i]     = p;
						// 动画持续时间
						fxs[i + 4] = dur;
						// 动画类型
						fxs[i + 5] = this.tween[easing];
						// 属性值
						val = info[p]; 
						
						switch (typeof val) {
							// 属性值是数字
							case "number":
								// 符号
								fxs[i + 1] = "";
								// 值
								fxs[i + 2] = val;
								// 单位
								fxs[i + 3] = "px";
								break;
								
							// 属性值是数组形式,第2,3个参数是字符就是easing值,是数字就是dur值	
							case "object":
								len = val.length;
								while (len !== 1) {
									len--;
									typeof val[len] === "string" ? 
									fxs[i + 5] = this.tween[val[len]] : fxs[i + 4] = val[len];
								}
								val = val[0];
								// 这里没有break
								
							case "string":
								// 非颜色属性
								if (p.toLowerCase().indexOf("color") === -1) {
									// 字符串形式
									// 解析符号单位
									len = /(\+=|-=)?(-?\d+)(\D*)/.exec(val);
									// 符号
									fxs[i + 1] = len[1];
									// 值
									fxs[i + 2] = len[2];
									// 单位
									fxs[i + 3] = len[3] || "px";
									
								//颜色属性							
								} else {
									//单位用"#"
									fxs[i + 2] = val;
									fxs[i + 3] = "#";
								}
						}
						
						i += 6;
					}
					
					cfg.fxs = fxs;
				}
				
				// 回调函数
				prop.complete = cfg.complete;
				// 回调函数上下文
				prop.ctx = cfg.ctx;
				// 回调函数参数
				prop.args = cfg.args;
				
				return this.setBc(el, fxs, prop);	
			},

			/**
			 * 计算动画步骤的初始值和变化值
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Array}       fxs  动画步骤信息数组
			 * @return {Array}       prop 动画步骤对象数组
			 */
			setBc : function(el, fxs, prop) {
				var 
					len = fxs.length,
					i   = 0,
					b, c, p, s, u;
					
				for(; i < len; i += 6) {
					p    = fxs[i];//属性名
					s    = fxs[i + 1];//符号
					c    = fxs[i + 2];//最终值
					u    = fxs[i + 3];//单位
					
					//非颜色属性
					if (u !== "#") {
						//style属性
						if (typeof el[p] === "undefined") {
							//获得当前元素对应属性值
							(b = this.getElStyle(el, p)) ? b = parseFloat(b) : b = 0;
							
						} else {
							b = el[p];
							//非style属性单位用"&"
							u = "&";
						}
						
						//判断符号,设置变化值
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
						
						//计算颜色变化量
						c[0] -= b[0];//red
						c[1] -= b[1];//green
						c[2] -= b[2];//blue
						
						if (c.join("") === "000") {
							continue;
						}
					}
					
					prop.push({
						p    : p.replace(/[A-Z]/g, "-$&"),
						b    : b,
						c    : c,
						u    : u,
						dur  : fxs[i + 4],
						twn  : fxs[i + 5],
						t    : 0						
					});
				}
				
				return prop;
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
			 * 更新el动画属性
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
					
					// el动画队列数组
					que = el.mojoFxQue;
					// el当前正在执行的动画属性数组
					cur = el.mojoFxCur || [];
					
					// 当前动画属性完成,从队列中取出一个
					while(!cur.length) {
						if (cur.complete) {
							// 执行回调函数
							cur.complete.apply(cur.ctx, [el].concat(cur.args));
						}
						
						if (cur = que.shift()) { 
							cur = el.mojoFxCur = cur.isDelay ? [cur] : this.getElStep(el, cur);
							
						// el所有动画属性完成
						} else {
							aEls.splice(i, 1);
							el.isMojoFxAnim = false;
							el.mojoFxCur = [];
							el.mojoFxQue = [];
							len--;
							i--;
							
							// 动画元素数组执行完成
							if (len === 0) {
								window.clearInterval(this.tid);
								this.tid = 0;
								return;
							}
							
							break;
						}
					}			
					
					if(cur) { 
						this.step(el, cur, stepTime);
					}
				}					
			},
			
			/**
			 * 更新动画元素
			 * 
			 * @param {HTMLElement} el    
			 * @param {Array}       prop        动画配置对象数组
			 * @param {Number}      stepTime    每次更新的时间差
			 */
			step : function(el, prop, stepTime) {
				var 
					len = prop.length,
					sty = ";",
					i   = 0,
					fx, p, b, c, u, dur, twn, t;
				
				for(; i < len; i++) {
					fx   = prop[i];
					
					p    = fx.p;
					b    = fx.b;
					c    = fx.c;
					u    = fx.u;
					dur  = fx.dur; 
					twn  = fx.twn; 
					t    = fx.t += stepTime;
					
					if(t > dur) {
						t = dur;
						prop.splice(i, 1);
						len--;
						i--;
					}
					
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
							switch (p) {
								case "opacity":
									this.setElStyle(el, p, twn(t, b, c, dur));
									continue;
									
								case "delay":
									return;
									
								default:
									sty += p +
									":" +
									twn(t, b, c, dur) +
									u +
									";";
							}					
					}
				}	

				el.style.cssText += sty;
			}															
		};
		
		// mojoFx注册到window对象上
		window.mojoFx = mojoFx;	
	
})(window);
