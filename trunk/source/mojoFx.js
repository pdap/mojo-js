/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window, undefined){
	
	var 
		//动画元素
		elems,
		
		//
		animArr = [],
		
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
			 * @param {HTMLElement/Array} els 应用动画的元素或元素数组
			 * @param {Object/Undefined} init 元素的初始化信息
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
							fxUtil.setStyle(el, p, init[p]);
						}
					}
				} 
				
				elems = [].concat(els);
				
				return this;
			},

			/**
			 * 配置动画参数
			 * 
			 */
			animTo : function(info) {
				var args  = arguments, 
					dur, fn, isQue, twn,
				    opt, val, len;
				 
				opt   = args[1]   || "";
				
				dur   = opt.dur   || 400;
				fn    = opt.fn    || null;
				isQue = opt.isQue || true;
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
							case "boolean":
								isQue = val;
								break;
							case "string":
								twn = val;
								break;
						}
					}
				}
				
				fxUtil.addElStep(elems, fxUtil.getConfig(info, dur, fn, twn), isQue);
				
				fxUtil.run();
				
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
			 * @param {Object} obj
			 */
			isArray : function(obj) {
				return Object.prototype.toString.call(obj) === "[object Array]";
			},
			
			/**
			 * 设置style对应属性
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      sty
			 * @param {Number}      val
			 */
			setStyle : function(el, sty, val) {
				var styObj = el.style;

  				switch (sty) {
					case "float":
						typeof styObj.styleFloat === "string" ? 
						              styObj.styleFloat = val : styObj.cssFloat = val;
						break;
					case "opacity":
						el.filters ? styObj.filter = (el.currentStyle.filter || "")
							         .replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + val + ")"
								   : styObj.opacity = val / 100;
						break;
					default:
						styObj[sty] = val;
				}				
			},
			
			/**
			 * 获取style对应属性值
			 * 
			 * @param {HTMLElement} el
			 * @param {String} sty
			 */
			getStyle : function(el, sty) {
				var curStyObj =  el.currentStyle || window.getComputedStyle(el, null);
				
				switch (sty) {
					case "float":
						return typeof curStyObj.styleFloat === "string" ? 
						                           curStyObj.styleFloat : curStyObj.cssFloat;
					case "opacity":
						return el.filters ? (el.filters.alpha ? e.filters.alpha.opacity : 100) 
						                  : curStyObj.opacity * 100;
					default:
						return curStyObj[sty];
				}				
			},
			
			/**
			 * 转换颜色属性为十进制
			 * 
			 * @param {String} color
			 * @return {Array} rgb
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
			 * 计算动画信息
			 * 
			 * @param {Object} info
			 * @param {Number} dur
			 * @param {String} twn
			 */
			getConfig : function(info, dur, fn, twn) {
				var 
				    //属性名,符号,属性值,单位,动画持续时间,动画类型,当前动画时间,回调函数
					cfg = [],
					i   = 0,
					p, val;

				for(p in info) {
					//属性名
					cfg[i]     = p;
					//时间
					cfg[i + 4] = dur;
					//动画类型
					cfg[i + 5] = tween[twn];
					//当前动画时间
					cfg[i + 6] = 0;
					//回调函数
					cfg[i + 7] = fn;
					
					val        = info[p];
					

					if (typeof val === "number") {
						//符号
						cfg[i + 1] = "";
						//值
						cfg[i + 2] = val;
						//单位
						cfg[i + 3] = "px";
					} else {
						//数组形式
						if (fxUtil.isArray(val)) {
							if (val.length === 2) {
								typeof val[1] === "string" ? 
								       cfg[i + 5] = tween[val[1]] : cfg[i + 4] = val[1];
								
							//val.length === 3	
							} else {
								cfg[i + 4] = val[1];
								cfg[i + 5] = tween[val[2]];
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
					
					i += 8;
				}
								
				return cfg;	
			},
			
			/**
			 * 计算动画步骤
			 * 
			 * @param {Array} els
			 * @param {Array} cfg
			 * @param {Boolean} isQue
			 */
			addElStep : function(els, cfg, isQue) {
				var 
					len    = els.length,
					l      = cfg.length,
					pFloat = parseFloat,
					isNan  = isNaN,
					prop,
					i, el, n, arr,
					p, b, c;
				
				for(i = 0; i < len; i++) {
					el   = els[i];
					prop = [];
					for(n = 0; n < l; n += 8) {
						//克隆每一条属性信息
						arr = cfg.slice(n, n + 8);
						//属性名
						p   = arr[0];
						//非颜色属性
						if(arr[3] !== "#") {
							//属性为style的属性
							if(typeof el[p] === "undefined") {
								//获得当前元素对应属性值
								b = pFloat(this.getStyle(el, p));
								if (isNan(b)) {
									b = 0;
								}
							//非style属性	
							} else {
								b = el[p];
								arr[3] = "&";
							}
							
						    //判断符号,设置变化量
							switch (arr[1]) {
								case "+=":
									c = arr[2] * 1;
									break;
								case "-=":
									c = arr[2] * 1 - arr[2] * 2;
									break;
								default:
									c = arr[2] * 1 - b;
							}
							
							arr[1] = b;
							arr[2] = c;
												
						//颜色属性	
						} else {
							arr[1] = b = this.colorTen(this.getStyle(el, p));
							c      = this.colorTen(arr[2]);
							
							//计算颜色变化量
							c[0] -= b[0];
							c[1] -= b[1];
							c[2] -= b[2];
							
							arr[2] = c;
						}
						
						//属性名,初始值,变化值,单位,时间,动画类型
						prop = prop.concat(arr);
					}				
					
					if(isQue) {
						//队列动画
						el.mojoFxQue ? el.mojoFxQue.push(prop) : el.mojoFxQue = [prop];
					} else {
						//同步动画
						el.mojoFxSyn ? el.mojoFxSyn = el.mojoFxSyn.concat(prop) 
									 : el.mojoFxSyn = prop;						
					}
					
					if(!el.isAnim) {
						animArr.push(el);
					}
				}	
			},
			
			
			run : function() {
				var 
				    ths   = this,
					arr   = animArr,
					t     = 0,
					start = new Date().getTime();	
				
				tid = setInterval(function(){
					var end = new Date().getTime();
					ths.updateEL(arr, end - start);
					start = end;
				}, 13);
			},
			
			updateEL : function(arr, stepTime) {
				var 
					len = arr.length,
					i   = 0,
					sty = [],
					el, fn, syn, que, cur;
				
				for(; i < len; i++) {
					el = arr[i];
					el.isAnim = true;
					
					syn = el.mojoFxSyn || [];
					que = el.mojoFxQue;
					cur = el.mojoFxCur || [];
					
					
					if(!cur.length && que.length) {
						cur = el.mojoFxCur = que.shift();
					}						
					
					if(!cur.length && !syn.length) {
						el.isAnim = false;
						arr.splice(i, 1);
						len--;
						i--;
					} else {
						if(cur.length) {
							this.step(el, cur, stepTime, sty);
						}
						
						if(syn.length) {
							this.step(el, syn, stepTime, sty);
						}
						
						if(sty.length) {
							el.style.cssText += sty.join("");
							//document.getElementById("console").innerHTML += que[0][0] + "<br>";
						}
					}
					
					if(len == 0) {
						clearInterval(tid);
					}
				}					
			},
			
			step : function(el, prop, stepTime, sty) {
				var 
					j    = sty.length,
					i, len, unit, dur, twn, p, b, c, t,
					fn, n;
				
				for(i = 0, len = prop.length; i < len; i += 8) {
					p    = prop[i];
					b    = prop[i + 1];
					c    = prop[i + 2];
					unit = prop[i + 3];
					dur  = prop[i + 4];
					twn  = prop[i + 5];
					t    = prop[i + 6] + stepTime;
					fn   = prop[i + 7];
					
					
					prop[i + 6] = t;
					
					//document.getElementById("console").innerHTML += t + "<br>";
					
					if(t > dur) {
						t = dur;
						prop.splice(i, 8);
						len -= 8;
						i   -= 8;
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
		
		//
		window.mojoFx = mojoFx;	
	
})(window);
