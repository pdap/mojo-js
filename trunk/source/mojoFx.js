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
		
		//动画队列
		animQue,

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
			animTo : function(info, dur, fn, isQue, twn) {
				var opt;
				
				//多参数形式
				if(typeof dur === "number") {
					dur   = dur   || 400;
					fn    = fn    || null;
					isQue = isQue || true;
					twn   = twn   || "swing";
				
				//对象参数形式
				} else {
					opt   = dur;
					dur   = opt.dur   || 400;
					fn    = opt.fn    || null;
					isQue = opt.isQue || true;
					twn   = opt.twn   || "swing";
				}
				
				opt = fxUtil.getOpt(info, dur, twn);

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
				var rgb = [], 
					i = 0, 
					pInt = parseInt;
					
				//#000000形式	
				if (color.length === 7) {				
					for (; i < 3; i++) {
						rgb[i] = pInt(color.substring(2 * i + 1, 2 * i + 3), 16);
					}
					
				//#000形式	
				} else if (color.length === 4) {
					color = color.replace(/\w{3}/, "$&$&");
					for (; i < 3; i++) {
						rgb[i] = pInt(color.substring(2 * i + 1, 2 * i + 3), 16);
					}
				
				//rgb(0,0,0)形式	
				} else {
					if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
						color = "rgb(255,255,255)";
					}
					rgb = color.match(/\d+/g);
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
			getOpt : function(info, dur, twn) {
				var 
				    //属性名,符号,属性值,单位,动画时间,动画类型
					opt = [],
					i   = 0,
					p, val;

				for(p in info) {
					//属性名
					opt[i]     = p;
					//时间
					opt[i + 4] = dur;
					//动画类型
					opt[i + 5] = twn;
					val        = info[p];
					
					//非颜色属性
					if (p.toLowerCase().indexOf("color") !== -1) {
						if (typeof val === "number") {
							//符号
							opt[i + 1] = "";
							//值
							opt[i + 2] = val;
							//单位
							opt[i + 3] = "px";
						} else {
							//数组形式
							if (fxUtil.isArray(val)) {
								if(val.length === 2) {
									typeof val[1] === "string" ?
									       opt[i + 5] = val[1] : opt[i + 4] = val[1];
								
								//val.length === 3	
								}  else {
									opt[i + 4] = val[1];
									opt[i + 5] = val[2];
								}
								val = val[0];
							}
							
							//字符串形式
							//解析符号单位
							/(\+=|-=|-)?(\d+)(\D*)/.test(val);
							//符号
							opt[i + 1] = RegExp.$1;
							//值
							opt[i + 2] = RegExp.$2;
							//单位
							opt[i + 3] = RegExp.$3 || "px";							
						}
					
					//颜色属性
					} else {
						//颜色符号位用"#"
						opt[i + 1] = "#";
						opt[i + 2] = val;
					}
					i += 6;
				}
								
				return opt;	
			},
			
			getStep : function(els, opt) {
				var 
					len    = els.length,
					l      = opt.length / 6,
					props  = [],
					pFloat = parseFloat,
					isNan  = isNaN,
					i, el, n, arr, val,
					p, b;
				
				for(i = 0; i < len; i++) {
					el = els[i];
					for(n = 0; n < l; n += 6) {
						//克隆每一条属性信息
						arr = opt.slice(n, 6);
						//属性名
						p   = arr[1];
						//非颜色属性
						if(p !== "#") {
							//属性为style的属性
							if(!el[p]) {
								//获得当前元素对应属性值
								b = pFloat(this.getStyle(el, p));
								if (isNan(b)) {
									b = 0;
								}
								
							} else {
								
							}
						
						//颜色属性	
						} else {
							
						}
					}				
				}	
			}
		};
		
		//
		window.mojoFx = mojoFx;	
	
})(window);
