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
		info,
		
		//动画是否进入队列
		que,
		
		//动画效果
		twn = {
			dft : {
				type : "swing",
				ease : "easeNone"				
			}
		},
		
	    /**
 	 	 * 动画缓冲算法
	     * 每个效果都分三个缓动方式:
 	     * easeIn：从0开始加速的缓动
 	     * easeOut：减速到0的缓动
 	     * easeInOut：前半段从0开始加速,后半段减速到0的缓动
	     */
	    tween = {
			swing : {
				/**
		 		 * @param {Number} t current time 当前时间
		 		 * @param {Number} b beginning value 初始值
		 		 * @param {Number} c change in value 变化量
		   		 * @param {Number} d duration 持续时间
		 		 */
				easeNone: function(t, b, c, d) {
					return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
				}
			}
		},
		
		/**
		 * 动画功能实现类
		 */
		fx = {
			/**
			 * 配置动画参数
			 */
			animTo : function() {
				var args = arguments;
				
				info = args[0]; 
				dur  = args[1] || 400;
				fn   = args[2] || null;
				que  = args[3] || true;
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
								el.style[p] = init[p];
							}
						}
					} else {
						for(p in init) {
							els.style[p] = init[p];
						}
					}
				} 
				
				elems = [].concat(els);
			},
			
			/**
			 * 动画效果设置
			 * 
			 * @param {String/Object} type
			 * @param {String/Undefined} ease
			 */
			twn : function(type, ease) {
				
				if(typeof type === "object") {
					twn = type;
				
				//typeof type === "string"
				} else {
					
				}
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
			}
		};
		
	
	
	
	/**
	 * 绑定mojoFx
	 */
	window.mojoFx = function(){
		fx.on.apply(arguments);
		return fx;
	};
	
		
	
})(window);
