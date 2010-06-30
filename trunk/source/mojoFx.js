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
				var i, len, el, p;
				
				if(arguments.length === 2) {
					if(fxUtil.isArray(els)) {
						for(i = 0, len = els.length; i < len; i++) {
							el = els[i];
							for(p in init) {
								fxUtil.setStyle(el, p, init[p]);
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
				
				fxUtil.addElStep([info, dur, fn, twn]);
				
				if(!tid) {
					fxUtil.animStart();
				} 
				
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
			 * 设置style对应属性
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
							         .replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + val + ")"
								   : elSty.opacity = val / 100;
						break;
					default:
						elSty[p] = val;
				}				
			},
			
			/**
			 * 获取style对应属性值
			 * 
			 * @param  {HTMLElement} el HTMLElement元素
			 * @param  {String}      p  style属性名
			 * @return {String}      el元素style的p属性值
			 */
			getStyle : function(el, p) {
				var curElSty =  el.currentStyle || window.getComputedStyle(el, null);
				
				switch (p) {
					case "float":
						return typeof curElSty.styleFloat === "string" ? 
						                           curElSty.styleFloat : curElSty.cssFloat;
					case "opacity":
						return el.filters ? (el.filters.alpha ? e.filters.alpha.opacity : 100) 
						                  : curElSty.opacity * 100;
					default:
						return curElSty[p];
				}				
			},
			
			/**
			 * 转换颜色属性为十进制
			 * 
			 * @param  {String} color 颜色字符串
			 * @return {Array}  rgb   rgb十进制颜色值的数组
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
			 * @param {Array} arrInfo
			 */
			addElStep : function(arrInfo) {
				var i = 0, el,
					els = elems,
					len = els.length;
				
				for(; i < len; i++) {
					el = els[i];
					//el元素是否存在动画队列
					el.mojoFxQue ? el.mojoFxQue.push(arrInfo) : el.mojoFxQue = [arrInfo];
					//el元素是不存在于动画数组中
					if(!el.isInAnimEls) {
						animEls.push(el);
						el.isInAnimEls = true;
					}
				}	
			},
						
			/**
			 * 计算动画信息
			 * 
			 * @param {Object} info 动画信息
			 * @param {Number} dur  动画持续时间
			 * @param {String} twn  动画缓冲效果
			 * 
			 * @return {Array} cfg  动画信息数组
			 */
			getConfig : function(info, dur, fn, twn) {
				var 
				    //存放属性名,符号,属性值,单位,动画持续时间,动画类型,当前动画时间
					cfg = [],
					i   = 0,
					p, val, len;
				
				//存储每个动画属性相关信息的个数
				cfg.len = len = 7;
				cfg.fn  = fn;
				
				//计算每个动画属性
				for(p in info) {
					//属性名
					cfg[i]     = p;
					//动画持续时间
					cfg[i + 4] = dur;
					//动画类型
					cfg[i + 5] = tween[twn];
					//当前动画时间
					cfg[i + 6] = 0;
					//属性值
					val        = info[p];
					
					//属性值是数字
					if (typeof val === "number") {
						//符号
						cfg[i + 1] = "";
						//值
						cfg[i + 2] = val;
						//单位
						cfg[i + 3] = "px";
						
					} else {
						//属性值是数组形式
						if (fxUtil.isArray(val)) {
							//数组形式至少需要2个元素,第二个元素是字符就是twn值,是数字就是dur值
							typeof val[1] === "string" ? 
						    cfg[i + 5] = tween[val[1]] : cfg[i + 4] = val[1];			
							
							//第三个元素同上判断
							if(val.length === 3) {
								typeof val[2] === "string" ? 
						   	    cfg[i + 5] = tween[val[2]] : cfg[i + 4] = val[2];
							}		
							
							val = val[0];
						}
						
						//非颜色属性
						if (p.toLowerCase().indexOf("color") === -1) {
							//字符串形式
							//解析符号单位
							/(\+=|-=)?(-?\d+)(\D*)/.test(val);
							//符号
							cfg[i + 1] = RegExp.$1;
							//值
							cfg[i + 2] = RegExp.$2;
							//单位
							cfg[i + 3] = RegExp.$3 || "px";
							
						//颜色属性							
						} else {
							//单位用"#"
							cfg[i + 3] = "#";
							cfg[i + 2] = val;
						}
					}
					
					i += len;
				}

				return cfg;	
			},
			
			/**
			 * 计算动画步骤
			 * 
			 * @param {HTMLElement} el   HTMLElement元素
			 * @param {Array}       prop 动画信息数组
			 */
			getElStep: function(el, prop) {
				var 
					l      = prop.len,
					len    = prop.length,
					pFloat = parseFloat, 
					isNan  = isNaN, 
					n, p, b, c;
				
				for (n = 0; n < len; n += l) {
					//属性名
					p = prop[0 + n];
					//非颜色属性
					if (prop[3 + n] !== "#") {
						//属性为style的属性
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
							prop[3 + n] = "&";
						}
						
						//判断符号,设置变化量
						switch (prop[1 + n]) {
							case "+=":
								c = prop[2 + n] * 1;
								break;
							case "-=":
								c = prop[2 + n] * 1 - prop[2 + n] * 2;
								break;
							default:
								c = prop[2 + n] * 1 - b;
						}
						
						prop[1 + n] = b;
						prop[2 + n] = c;
						
					//颜色属性	
					} else {
						prop[1 + n] = b = this.colorTen(this.getStyle(el, p));
						c = this.colorTen(prop[2 + n]);
						
						//计算颜色变化量
						c[0] -= b[0];//red
						c[1] -= b[1];//green
						c[2] -= b[2];//blue
						
						prop[2 + n] = c;
					}
				}
				
				return prop;
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
			 * @param {Object} stepTime  每次更新属性的时间
			 */
			updateEl : function(els, stepTime) {
				var 
					len = els.length,
					sty = [],
					i   = 0,
					el, que, cur;
				
				for(; i < len; i++) {
					el = els[i];
					
					//el动画队列数组
					que = el.mojoFxQue;
					//el当前正在执行的动画属性
					cur = el.mojoFxCurAnim || [];
					
					//当前动画属性完成,从队列中取出一个
					if(!cur.length && que.length) {
						cur = el.mojoFxCurAnim = this.getElStep(el, 
												 this.getConfig.apply(this, que.shift()));
					}						
					
					//所有动画属性完成
					if(!cur.length) {
						els.splice(i, 1);
						el.isInAnimEls = false;
						len--;
						i--;
						
					} else {
						//更新动画属性
						this.step(el, cur, stepTime, sty);
						
						if(sty.length) {
							el.style.cssText += ";" + sty.join("");
						}
						
						//当前动画属性完成
						if(!cur.length) {
							if(cur.fn) {
								//执行回调函数
								cur.fn.call(el);
							}
						}
					}
					
					//动画元素数组执行完成
					if(len === 0) {
						clearInterval(tid);
						tid = 0;
					}
				}					
			},
			
			/**
			 * 更新动画元素
			 * 
			 * @param {Object} el   HTMLElement元素
			 * @param {Object} prop 动画属性信息数组
			 * @param {Object} stepTime 每次执行step的时间差
			 * @param {Object} sty      更新后的cssText
			 */
			step : function(el, prop, stepTime, sty) {
				var 
					j = sty.length,
					l = prop.len,
					i, len, n,
					p, b, c, unit, dur, twn, t, fn;
				
				for(i = 0, len = prop.length; i < len; i += l) {
					p    = prop[i];
					b    = prop[i + 1];
					c    = prop[i + 2];
					unit = prop[i + 3];
					dur  = prop[i + 4];
					twn  = prop[i + 5]; 
					t    = prop[i + 6] = prop[i + 6] + stepTime;
					
					if(t > dur) {
						t = dur;
						prop.splice(i, l);
						len -= l;
						i   -= l;
					}
					
				    //非style属性
					if(unit === "&") {
						el[p] = twn(t, b, c, dur);
					
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
						if(p === "opacity") {
							this.setStyle(el, p, twn(t, b, c, dur));
							return;
						}
						
						sty[j++] = p.replace(/[A-Z]/g, "-$&");
						sty[j++] = ":";
						sty[j++] = twn(t, b, c, dur);
						sty[j++] = unit;
						sty[j++] = ";";						
					}
				}	
			}
		};
		
		//mojoFx注册到window对象上
		window.mojoFx = mojoFx;	
	
})(window);
