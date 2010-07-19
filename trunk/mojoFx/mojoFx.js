/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window){ 
	
	var 
		//需要动画的元素
		elems,
		
		//执行动画元素
		animEls = [],
		
		//动画id
		tid,

	    /**
 	 	 * 动画缓冲算法
	     * 每个效果都分三个缓动方式:
 	     * easeIn：   从0开始加速的缓动
 	     * easeOut：  减速到0的缓动
 	     * easeInOut：前半段从0开始加速,后半段减速到0的缓动
	     */
	    tween = {
			/**
		 	 * @param {Number} t current time    当前时间
		 	 * @param {Number} b beginning value 初始值
		 	 * @param {Number} c change value    变化量
		     * @param {Number} d duration        持续时间
		 	 */
			swing : function(t, b, c, d) { 
				return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
			}
		},
		
		/**
		 * 动画功能实现类
		 */
		mojoFx = {
			
			/**
			 * 应用动画的元素
			 * 
			 * @param {HTMLElement/Array} els  应用动画的元素或元素数组
			 * @return mojoFx
			 * 
			 */
			on : function(els) {
				
				elems = [].concat(els);
				
				return this;
			},

			/**
			 * 配置动画参数
			 * 
			 * @param  info 动画信息
			 * @return mojoFx
			 */
			animTo : function(info) {
				var 
					args = arguments, 
					opt  = args[1] || "",
					dur  = opt.dur || 400,
					fn   = opt.fn  || null,
					twn  = opt.twn || "swing",				
				    val, len;
				
				//不定参数形式
				if (typeof opt !== "object") {
					for (opt = 1, len = args.length; opt < len; opt++) {
						val = args[opt];
						switch (typeof val) {
							case "number":
								dur = val;
								break;
							case "function":
								fn = val
								break;
							case "string":
								twn = val;
								break;
						}
					}
				} 
				
				fxUtil.addElStep({
					info : info,
					dur  : dur,
					fn   : fn,
					twn  : twn
				});
				
				if(!tid) {
					fxUtil.animStart();
				} 
				
				return this;
			},
			
			/**
			 * 动画队列延迟
			 * 
			 * @param  {Number} t  延迟时间
			 * @return mojoFx
			 */
			delay : function(t) {
				fxUtil.addElStep({
					isDelay : true,
					dur     : t,
					p   	: "delay",
					t       : 0
				});
				
				return this;
			},
			
			/**
			 * 
			 * @param {Object} twnObj
			 */
			addTween : function(twnObj) {
				var p;
				
				for(p in twnObj) {
					tween[p] = twnObj[p];
				}	
				
				return this;
			}				
		},
		
		/**
		 * 辅助对象
		 */
		fxUtil = {
			
			/**
			 * 设置el对应style属性
			 * 
			 * @param {HTMLElement} el   HTMLElement元素
			 * @param {String}      p    style属性名
			 * @param {Number}      val  style属性值
			 */
			setElStyle : function(el, p, val) {
				var elSty = el.style;

  				switch (p) {
					case "float":
						typeof elSty.styleFloat === "string" ? 
						              elSty.styleFloat = val : elSty.cssFloat = val;
						break;
					case "opacity":
						el.filters ? elSty.filter = (el.currentStyle.filter || "")
							         .replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + val*100 + ")"
								   : elSty.opacity = val;
						break;
					default:
						elSty[p] = val;
				}				
			},
			
			/**
			 * 获取el当前对应style属性值
			 * 
			 * @param  {HTMLElement} el HTMLElement元素
			 * @param  {String}      p  style属性名
			 * @return {String}      el 元素style的p属性值
			 */
			getElStyle : function(el, p) {
				var curElSty =  el.currentStyle || window.getComputedStyle(el, null);
				
				switch (p) {
					case "float":
						return typeof curElSty.styleFloat === "string" ? 
						                           curElSty.styleFloat : curElSty.cssFloat;
					case "opacity":
						return el.filters ? (el.filters.alpha ? el.filters.alpha.opacity : 100) / 100
						                  : curElSty.opacity;
					default:
						return curElSty[p];
				}				
			},
			
			/**
			 * 转换颜色属性为十进制
			 * 
			 * @param  {String} color 颜色字符串
			 * @return {Array}  rgb   三色十进制值的数组
			 */
			colorTen : function(color) {
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
                   if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
				   	    color = "rgb(255,255,255)";
				   }		
				   rgb = color.match(/\d+/g);
				   for(i = 0; i < 3; i++) {
				   	 rgb[i] = parseInt(rgb[i]);
				   }		
				}

				return rgb;				
			},
			
			/**
			 * 动画信息附加到el元素上
			 * 
			 * @param {Object} cfg
			 */
			addElStep : function(cfg) {
				var 
					i    = 0,
					els  = elems,
					aEls = animEls,
					len  = els.length,
					el;
				
				for(; i < len; i++) {
					el = els[i];
					//el元素是否存在动画队列
					el.mojoFxQue ? el.mojoFxQue.push(cfg) : el.mojoFxQue = [cfg];
					//el元素是不存在于动画数组中
					if(!el.isMojoFxAnim) {
						aEls.push(el);
						el.isMojoFxAnim = true;
					}
				}
			},
						
			/**
			 * 计算动画步骤
			 * 
			 * @param {Object} el   HTMLElement元素
			 * @param {Object} cfg  动画信息对象
			 */
			getElStep : function(el, cfg) {
				var 
					i    = 0,
					info = cfg.info,
					dur  = cfg.dur,
					twn  = cfg.twn,
					fxs  = cfg.fxs,
					p, val;
				
				if (!fxs) {
					//存放属性名,符号,属性值,单位,动画持续时间,动画类型
					fxs = [];
					
					//计算每个动画属性
					for (p in info) {
						//属性名
						fxs[i]     = p;
						//动画持续时间
						fxs[i + 4] = dur;
						//动画类型
						fxs[i + 5] = tween[twn];
						//属性值
						val = info[p]; 
						
						switch (typeof val) {
							//属性值是数字
							case "number":
								//符号
								fxs[i + 1] = "";
								//值
								fxs[i + 2] = val;
								//单位
								fxs[i + 3] = "px";
								break;
							//属性值是数组形式,是字符就是twn值,是数字就是dur值	
							case "object":
								fx = val.length;
								while (fx !== 1) {
									fx--;
									typeof val[fx] === "string" ? 
									fxs[i + 5] = tween[val[fx]] : fxs[i + 4] = val[fx];
								}
								val = val[0];
							case "string":
							
								//非颜色属性
								if (p.toLowerCase().indexOf("color") === -1) {
									//字符串形式
									//解析符号单位
									/(\+=|-=)?(-?\d+)(\D*)/.test(val);
									//符号
									fxs[i + 1] = RegExp.$1;
									//值
									fxs[i + 2] = RegExp.$2;
									//单位
									fxs[i + 3] = RegExp.$3 || "px";
									
								//颜色属性							
								} else {
									//单位用"#"
									fxs[i + 3] = "#";
									fxs[i + 2] = val;
								}
						}
						
						i += 6;
					}
					
					cfg.fxs = fxs;
				}
				
				return this.setBc(el, fxs, cfg.fn);	
			},
			
			/**
			 * 计算动画步骤的初始值和变化值
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Array}  fxs
			 * @param  {Function} fn
			 * @return {Array} prop 动画步骤数组
			 */
			setBc : function(el, fxs, fn) {
				var 
					i    = 0,
					prop = [],
					len  = fxs.length,
					b, c, p, s, unit;
				
				//回调函数	
				prop.fn = fn;
					
				for(; i < len; i += 6) {
					p    = fxs[i];//属性名
					s    = fxs[i + 1];//符号
					c    = fxs[i + 2];//最终值
					unit = fxs[i + 3];//单位
					
					//非颜色属性
					if (unit !== "#") {
						//style属性
						if (typeof el[p] === "undefined") {
							//获得当前元素对应属性值
							b = parseFloat(this.getElStyle(el, p));
							if (isNaN(b)) {
								b = 0;
							}
							
						//非style属性
						} else {
							b = el[p];
							//非style属性单位用"&"
							unit = "&";
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
						b = this.colorTen(this.getElStyle(el, p));
						c = this.colorTen(c);
						
						//计算颜色变化量
						c[0] -= b[0];//red
						c[1] -= b[1];//green
						c[2] -= b[2];//blue
						
						if (c.join("") === "000") {
							continue;
						}
					}
					
					prop.push({
						p    : p,
						b    : b,
						c    : c,
						unit : unit,
						dur  : fxs[i + 4],
						twn  : fxs[i + 5],
						t    : 0						
					});
				}
				
				return prop;
			},
			
			/**
			 * 开始执行动画
			 */
			animStart : function() {
				var 
				    ths   = this,
					aEls  = animEls,
					start = +new Date();	
				
				tid = setInterval(function(){
					var end = +new Date();
					ths.updateEl(aEls, end - start);
					start = end;
				}, 13);
			},
			
			/**
			 * 更新el动画属性
			 * 
			 * @param {Array} aEls       执行动画元素
			 * @param {Number} stepTime  每次更新属性消耗的时间
			 */
			updateEl : function(aEls, stepTime) {
				var 
					i   = 0,
					len = aEls.length,
					el, que, cur;
				
				for(; i < len; i++) {
					el = aEls[i];
					
					//el动画队列数组
					que = el.mojoFxQue;
					//el当前正在执行的动画属性
					cur = el.mojoFxCur || [];
					
					//当前动画属性完成,从队列中取出一个
					while(!cur.length) {
						if (cur.fn) {
							//执行回调函数
							cur.fn.call(el);
						}
						
						if (cur = que.shift()) {
							cur = el.mojoFxCur = cur.isDelay ? [cur] : this.getElStep(el, cur);
							
						//el所有动画属性完成
						} else {
							aEls.splice(i, 1);
							el.isMojoFxAnim = false;
							delete el.mojoFxCur;
							len--;
							i--;
							
							//动画元素数组执行完成
							if (len === 0) {
								clearInterval(tid);
								tid = 0;
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
			 * @param {HTMLElement} el    HTMLElement元素
			 * @param {Array} prop        动画属性信息数组
			 * @param {Number} stepTime   每次执行step的时间差
			 */
			step : function(el, prop, stepTime) {
				var 
					i   = 0,
					sty = ";",
					len = prop.length,
					n, fx,
					p, b, c, unit, dur, twn, t;
				
				for(; i < len; i++) {
					fx   = prop[i];
					
					p    = fx.p;
					b    = fx.b;
					c    = fx.c;
					unit = fx.unit;
					dur  = fx.dur; 
					twn  = fx.twn; 
					t    = fx.t += stepTime;
					
					if(t > dur) {
						t = dur;
						prop.splice(i, 1);
						len--;
						i--;
					}
					
					switch (unit) {
						//非style属性
						case "&" :
							el[p] = twn(t, b, c, dur);
							continue;
						//颜色属性	
						case "#" :
							sty += p.replace(/[A-Z]/g, "-$&") + ":#";
											
							for (n = 0; n < 3; n++) {
								unit = Math.ceil(twn(t, b[n], c[n], dur)).toString(16);
								sty += unit.length === 1 ? "0" + unit : unit;
							}
						
							sty += ";"			
							break;
						//style属性	
						default:
							switch (p) {
								//透明属性
								case "opacity":
									this.setElStyle(el, p, twn(t, b, c, dur));
									continue;
								case "delay":
									return;
								default:
									sty += p.replace(/[A-Z]/g, "-$&") +
									":" +
									twn(t, b, c, dur) +
									unit +
									";";
							}					
					}
				}	

				el.style.cssText += sty;
			}
		};
		
		//mojoFx注册到window对象上
		window.mojoFx = mojoFx;	
	
})(window);
