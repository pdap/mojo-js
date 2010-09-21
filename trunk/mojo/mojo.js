/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-9-1
 * Nightly Builds
 */ 
(function(window, mojoQuery){ 
	var 
		document = window.document,
		
		mojo = function(selector, context) {
			return new mo(selector, mojoQuery.get(selector, context));
		},
		
		/**
		 * mojo构造返回的对象
		 * 
		 * @param {String} selector
		 * @param {Array} elements
		 */
		mo = function(selector, elements) {
			this.selector = selector;
			this.elements = elements;
		},
		
		elFn = {
			/**
			 * 注册在每个HTMLElement上调用的函数
			 * 
			 * @param {Function} fn 调用函数
			 * @param {Object} ctxArgs  设置调用函数的参数和上下文
			 */
			each: function(fn, ctxArgs) {
				var 
					jo = this.jo,
					args = [this.el, this.index];
					
				ctxArgs = jo.getCtxArgs(ctxArgs);
				fn.apply(ctxArgs.ctx, ctxArgs.args.concat(args));
			},
			
			/**
			 * 绑定标签事件
			 */
			on: function() { 
				var	
					jo = this.jo,
					x = arguments[0],
					p, el, args, ctxArgs;
					
				if(typeof x === "string") {
					ctxArgs = jo.getCtxArgs(arguments[2]);
					el = this.el;
					args = [null ,el, this.index];
					p = arguments[1];
					
					el["on" + x] = function(event){
						args[0] = window.event || event;
						p.apply(ctxArgs.ctx, ctxArgs.args.concat(args));
					};			
				} else if (typeof x === "object") {
					args = arguments[1] || {};
					ctxArgs = jo.getCtxArgs(args);
					
					for(p in x) {
						this.mo.on(p, x[p], args[p] || ctxArgs);
					}
				}
			},
			
			fire: function(evtName, evtVal) {
				var
					el = this.el,
					jo = this.jo,
					evt = jo.createEvent();
				
				jo.initEvent(evtName, evt, evtVal || {});
				jo.fireEvent(el, evt, evtName);
			}		
		},
		
		jo = {
			
			/**
			 * 创建事件对象
			 * 
			 * @param {String} evtType 事件类型
			 * @return {Object} event 事件对象
			 */
			createEvent: function(evtType){
				if(document.createEvent) {
					return document.createEvent(evtType || "HTMLEvents");
				} else if(document.createEventObject) {
					return document.createEventObject();
				}
			},
			
			/**
			 * 初始化事件对象
			 * 
			 * @param {String} evtName 事件名称
			 * @param {Object} evt	   事件对象
			 * @param {Object} evtVal  事件值对象
			 * @param {Object} initMethod 事件初始化方法
			 */
			initEvent: function(evtName, evt, evtVal, initMethod) {
				var p;
				initMethod = initMethod || "initEvent";
				if(evt[initMethod]) {
					switch(initMethod) {
						case "initEvent":
							evt.initEvent(evtName, evtVal.bubbles || true, evtVal.cancelable || false);
							break;
					}
				} else {
					for(p in evtVal) {
						evt[p] = evtVal[p];
					}
				}
			},
			
			/**
			 * 触发事件
			 * 
			 * @param {HTMLElement} el
			 * @param {Object} evt		事件对象
			 * @param {String} evtName  事件名称
			 */
			fireEvent: function(el, evt, evtName) {
				if(el.dispatchEvent) {
					el.dispatchEvent(evt);
				} else if(el.fireEvent) {
					el.fireEvent("on" + evtName, evt);
				}
			},
			
			/**
			 * 获得包含有上下文和参数的对象
			 * 
			 * @param {Object} ctxArgs 含有上下文和参数的对象
			 * @return  包含有上下文和参数的对象
			 */
			getCtxArgs: function(ctxArgs) {
				var 
					obj = {
						ctx: window,
						args: []
					};
					
				if (ctxArgs) {
					if (typeof ctxArgs.ctx !== "undefined") {
						obj.ctx = ctxArgs.ctx;
					}
					
					if (ctxArgs.args) {
						obj.args = ctxArgs.args;
					}
				}	
				
				return obj;
			},
			
			/**
			 * 对mo对象原型链上的方法切面处理
			 * 
			 * @param {Object} target 目标对象
			 * @param {String} name   目标方法名
			 * @param {Function} method  目标方法
			 */
			aspect: function(target, name, method) {
				target[name] = function() {
					var 
						els = this.elements, 
						len = els.length, 
						i = 0, 
						retVal = [], 
						el, ctx;	

					for (; i < len; i++) {
						el = els[i];
						ctx = {
							el: el,
							mo: this,
							jo: jo,
							index: i,
							retVal: retVal
						};
						if (method.apply(ctx, arguments) === false) {
							break;
						}
					}
					
					return retVal.length ? retVal : this;										
				};	
			}
		};
		
	// 注册mo对象的原型链对象到mojo
	mojo.fn = mo.prototype;
	
	/**
	 * 扩展mo对象原型链和mojo对象上的方法
	 * 
	 * @param {Object} o 扩展方法的对象
	 * @param {Boolean} isEach 扩展方法是否在每一个HTMLElement上调用
	 */
	mojo.extend = mojo.fn.extend = function(o, isEach) {
		var p;
		if (isEach) {
			for (p in o) {
				jo.aspect(this, p, o[p]);
			}
		} else {
			for (p in o) {
				this[p] = o[p];
			}
		}
		
		return this;
	};
	
	// 注册mo对象方法
	mojo.fn.extend(elFn, true);
	
	// 注册mojo到window对象
	window.mojo = mojo;
	
})(window, mojoQuery);
