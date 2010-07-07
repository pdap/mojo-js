/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window, undefined){
	
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
		 	 * @param {Number} c change in value 变化量
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
			 * @param {Object} (optional) init 元素的初始化信息
			 * @return mojoFx
			 * 
			 * on(HTMLElement)
			 * on(Array)
			 * on(HTMLElement, Object)
			 * on(Array, Object)
			 */
			on : function(els, init) {
				var i, len, p;
				
				if(arguments.length === 2) {
					if(fxUtil.isArray(els)) {
						for(i = 0, len = els.length; i < len; i++) {
							for(p in init) {
								fxUtil.setStyle(els[i], p, init[p]);
							}
						}
						
					} else {
						for(p in init) {
							fxUtil.setStyle(els, p, init[p]);
						}
					}
				} 
				
				elems = [].concat(els);
				
				return this;
			},

			/**
			 * 配置动画参数
			 * 
			 * @param  info 动画信息
			 * @return mojoFx
			 * 
			 * 
			 * animTo(Object,Object)
			 * animTo(Object,Number)
			 * animTo(Object,Function)
			 * animTo(Object,String)
			 */
			animTo : function(info) {
				var args  = arguments, 
					dur, fn, twn,
				    opt, val, len;
				 
				opt   = args[1]   || "";
				
				dur   = opt.dur   || 400;
				fn    = opt.fn    || null;
				twn   = opt.twn   || "swing";
				
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
			}				
		},
		
		/**
		 * 辅助类
		 */
		fxUtil = {
			/**
			 * 判断数组
			 * 
			 * @param  {Object}  obj  要判断的对象
			 * @return {Boolean} true:对象为数组
			 */
			isArray : function(obj) {
				return Object.prototype.toString.call(obj) === "[object Array]";
			},
			
			/**
			 * 设置el对应style属性
			 * 
			 * @param {HTMLElement} el   HTMLElement元素
			 * @param {String}      p    style属性名
			 * @param {Number}      val  style属性值
			 */
			setStyle : function(el, p, val) {
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
			getStyle : function(el, p) {
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
				var rgb, i, 
					pInt = parseInt;
				
				if(color.indexOf("#") === 0) {
					//#000形式
					if(color.length === 4) {
						color = color.replace(/\w{3}/, "$&$&");
					}
					
					rgb = [];
					
					//#000000形式
					for (i = 0; i < 3; i++) {
						rgb[i] = pInt(color.substring(2 * i + 1, 2 * i + 3), 16);
					}					
				
				//rgb(0,0,0)形式	
				} else {
                   if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
				   	    color = "rgb(255,255,255)";
				   }		
				   rgb = color.match(/\d+/g);
				   for(i = 0; i < 3; i++) {
				   	 rgb[i] = pInt(rgb[i]);
				   }		
				}

				return rgb;				
			},
			
			/**
			 * 动画信息附加到el元素上
			 * 
			 * @param {Array} cfg
			 */
			addElStep : function(cfg) {
				var i = 0, el,
					els = elems,
					len = els.length;
				
				for(; i < len; i++) {
					el = els[i];
					//el元素是否存在动画队列
					el.mojoFxQue ? el.mojoFxQue.push(cfg) : el.mojoFxQue = [cfg];
					//el元素是不存在于动画数组中
					if(!el.isInAnimEls) {
						animEls.push(el);
						el.isInAnimEls = true;
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
					prop = [],
					fx, i = 0,
					info = cfg.info,
					dur  = cfg.dur,
					twn  = cfg.twn,
					p, val, fxs;
				
				//一组属性动画的回调函数
				prop.fn  = cfg.fn;
				fxs = cfg.fxs;
				
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
						
						//属性值是数字
						if (typeof val === "number") {
							//符号
							fxs[i + 1] = "";
							//值
							fxs[i + 2] = val;
							//单位
							fxs[i + 3] = "px";
							
						} else {
							//属性值是数组形式
							if (fxUtil.isArray(val)) {
								//数组形式至少需要2个元素,第二个元素是字符就是twn值,是数字就是dur值
								typeof val[1] === "string" ? 
						    	fxs[i + 5] = tween[val[1]] : fxs[i + 4] = val[1];
								
								//第三个元素同上判断
								if (val.length === 3) {
									typeof val[2] === "string" ? 
						   	    	fxs[i + 5] = tween[val[2]] : fxs[i + 4] = val[2];
								}
								
								val = val[0];
							}

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
				
				for(i = 0, p = fxs.length; i < p; i += 6) {
					fx = {
						p    : fxs[i],
						b    : fxs[i + 1],
						c    : fxs[i + 2],
						unit : fxs[i + 3],
						dur  : fxs[i + 4],
						twn  : fxs[i + 5],
						t    : 0
					};
					
					if(this.setBc(el, fx)) {
						prop.push(fx);
					}
				}
				
				return prop;	
			},
			
			/**
			 * 设置fx的b,c值
			 * 
			 * @param {Object} el  HTMLElement元素
			 * @param {Object} fx  存放动画步骤对象
			 * 
			 * @return b和c的值不同返回true
			 */
			setBc : function(el, fx) {
				var 
					p      = fx.p,
					pFloat = parseFloat, 
					isNan  = isNaN;
				
				//非颜色属性
				if (fx.unit !== "#") {
					//style属性
					if (typeof el[p] === "undefined") {
						//获得当前元素对应属性值
						b = pFloat(this.getStyle(el, p));
						if (isNan(b)) {
							b = 0;
						}
						
					//非style属性
					} else {
						b = el[p];
						//非style属性单位用"&"
						fx.unit = "&";
					}
					
					//判断符号,设置变化量
					switch (fx.b) {
						case "+=":
							c = fx.c * 1;
							break;
						case "-=":
							c = fx.c * 1 - fx.c * 2;
							break;
						default:
							c = fx.c * 1 - b;
					}
					
					if(c === 0) {
						return false;
					}
					
					fx.b = b;
					fx.c = c;
					
				//颜色属性
				} else {
					fx.b = b = this.colorTen(this.getStyle(el, p));
					c = this.colorTen(fx.c);
					
					//计算颜色变化量
					c[0] -= b[0];//red
					c[1] -= b[1];//green
					c[2] -= b[2];//blue
					
					if(c[0] === 0 && c[1] === 0 && c[2] === 0) {
						return false;
					}
					
					fx.c = c;
				}
				
				return true;
			},
			
			/**
			 * 开始执行动画
			 */
			animStart : function() {
				var 
				    ths   = this,
					els   = animEls,
					start = new Date().getTime();	
				
				tid = setInterval(function(){
					var end = new Date().getTime();
					ths.updateEl(els, end - start);
					start = end;
				}, 13);
			},
			
			/**
			 * 更新el动画属性
			 * 
			 * @param {Object} els       执行动画元素
			 * @param {Object} stepTime  每次更新属性消耗的时间
			 */
			updateEl : function(els, stepTime) {
				var 
					len = els.length,
					i   = 0,
					el, que, cur;
				
				for(; i < len; i++) {
					el = els[i];
					
					//el动画队列数组
					que = el.mojoFxQue;
					//el当前正在执行的动画属性
					cur = el.mojoFxCurAnim || [];
					
					//当前动画属性完成,从队列中取出一个
					while(!cur.length && que.length) {
						cur = que.shift();
						cur = el.mojoFxCurAnim = cur.isDelay ? [cur] 
															 : this.getElStep(el, cur);
					}						
					
					if (cur.length) {
						//计算更新动画属性值
						this.step(el, cur, stepTime);
						
						//当前动画属性完成
						if (!cur.length) {
							if (cur.fn) {
								//执行回调函数
								cur.fn.call(el);
							}
						}
						
					//el所有动画属性完成						
					} else {
						els.splice(i, 1);
						el.isInAnimEls = false;
						len--;
						i--;
						
						//动画元素数组执行完成
						if (len === 0) {
							clearInterval(tid);
							tid = 0;
						}
					}
				}					
			},
			
			/**
			 * 更新动画元素
			 * 
			 * @param {Object} el       HTMLElement元素
			 * @param {Object} prop     动画属性信息数组
			 * @param {Object} stepTime 每次执行step的时间差
			 */
			step : function(el, prop, stepTime) {
				var 
					i   = 0,
					j   = 0,
					sty = [],
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
						len -= 1;
						i   -= 1;
					}
					
				    //非style属性
					if(unit === "&") {
						el[p] = twn(t, b, c, dur);
						continue;
					
					//颜色属性
					} else if(unit === "#") {
						sty[j++] = p.replace(/[A-Z]/g, "-$&");
						sty[j++] = ":#";
											
						for(n = 0; n < 3; n++) {
							unit = Math.ceil(twn(t, b[n], c[n], dur)).toString(16); 
							sty[j++] = unit.length === 1 ? "0" + unit : unit;
						}
						
						sty[j++] = ";"
					
					//style属性	
					} else {
						//透明属性
						if (p === "opacity") {
							this.setStyle(el, p, twn(t, b, c, dur));
							continue;
							
						//延迟动画
						} else if (p === "delay") {
							return;
							
						} else {
							sty[j++] = p.replace(/[A-Z]/g, "-$&");
							sty[j++] = ":";
							sty[j++] = twn(t, b, c, dur);
							sty[j++] = unit;
							sty[j++] = ";";
						}
					}
				}	
				
				el.style.cssText += ";" + sty.join("");
			}
		};
		
		//mojoFx注册到window对象上
		window.mojoFx = mojoFx;	
	
})(window);
