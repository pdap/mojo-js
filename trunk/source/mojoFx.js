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
		elems = [],
		
		//动画队列
		animQue = [],
		
		
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
			
		},
		
		/**
		 * 辅助类
		 */
		fxUtil = {
			/**
			 * 配置动画参数
			 */
			config : function() {
				var args = this,
					obj  = args[0], 
					dur, fn, p, infos;

				dur  =  args[1] || 400;
				fn   =  args[2] || null;

				for(p in obj) {
					
				}
				
				
			}	
		};
		
	
	
	
	/**
	 * 绑定mojoFx
	 */
	window.mojoFx = function(){
		fxUtil.config.apply(arguments);
		return fx;
	};
	
		
	
})(window);
