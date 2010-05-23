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
		
		//动画时间
		dur,
		
		//回调函数
		fn,
		
		//动画属性
		animInfo,
		
		//动画是否进入队列
		que,
		
		//动画效果
		twn,
		
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
			 * 配置动画参数
			 * 
			 * @param {Object}  ai	动画信息
			 * @param {Number}  d	完成动画时间
			 * @param {Boolean} q	是否队列动画
			 */
			animTo : function(ai, d, q) {
				animInfo = ai; 
				dur      = d;
				que      = q || true;
			},
			
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
			 * 设置动画缓冲效果
			 * 
			 * @param {Object/String} twnObj
			 * 
			 * twn(Object)
			 * twn(String)
			 */
			twn : function(twnObj) {
				if(typeof twnObj === "sring") {
					twn = {def : "swing"}
					
				// typeof twnObj === "object"
				} else {
					twn = twnObj;
					if(!twn.def) {
						twn.def = "swing";
					}
				}			
			},
			
			/**
			 * 设置回调函数
			 * 
			 * @param {Object} f
			 */
			callback : function(f) {
				fn = f;	
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
						typeof styObj.styleFloat === "string" ? styObj.styleFloat = val : styObj.cssFloat = val;
						break;
					case "opacity":
						el.filters ? styObj.filter = (el.currentStyle.filter || "").replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + val + ")" : styObj.opacity = val / 100;
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
						return typeof curStyObj.styleFloat === "string" ? curStyObj.styleFloat : curStyObj.cssFloat;
					case "opacity":
						return el.filters ? (el.filters.alpha ? e.filters.alpha.opacity : 100) : curStyObj.opacity * 100;
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
			
			config : function() {
				var arr = [], 
					els = elems,
					info = animInfo,
					len = els.length,
					i, el, p;
				
				for(i = 0; i < len; i++) {
					el = els[i];
					for(p in info) {
						
					}
					
				}
				
			}
		};
		
		//
		window.mojoFx = mojoFx;	
	
})(window);
