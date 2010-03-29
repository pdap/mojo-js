/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-9-1
 * Version 0.65
 * Date 2009-11-16
 */
(function(window,undefined){
	var 
		//函数域中的文档对象引用
		document = window.document,
		
		slice = Array.prototype.slice,
		
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
				easeIn : function(t, b, c, d) {
					return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
				}
			}
		}, 
		
		//css选择器解析引擎
		shimmer,
		
		//内部对象,mojo方法实现的辅助对象
		jo,

	 	/**
	 	 * 执行jo对象的init方法返回的对象,就是mojo(...)函数返回的对象
	     * @param {String / HTMLElement} selector 选择器,字符串或者DOM元素类型
	     * @param {Array} arr 选择器对应的DOM元素的数组
	     */	
		mo = function(selector,arr) {
			//选择器
			this.selector = selector;
			//选择器对应的HTMLElement元素数组
			this.ems = arr;
			//动画id数组
			this.tids = [];
			//动画回调函数数组,每一个anim函数后回调
			this.ends = [];
			//缓存mojo对像上数据的容器
			this.datas = {};			
		},
		
		/**
		 * mojo变量注册到window上,并赋值为构造mo对象的函数
		 * @param {String/HTMLElement} selector
		 */
	    mojo = window.mojo = function(selector){
			return jo.init(selector);
		};


	//mo对象的原型链,也就是mojo对象原型链
	mojo.fn = mo.prototype = {
		/**
		 * 注册对应HTMLElement元素上的处理函数
		 * @param {Function} fn
		 */
		each: function(fn) {
			var ems = this.ems, 
				len = ems.length,
				i = 0;
			
			for (; i < len; i++) {
				fn.call(this, ems[i], i);
			}
			
			return this;
		},
		
		/**
		 * 注册对应HTMLElement元素数组上的处理函数
		 * @param {Function} fn
		 */
		elems: function(fn) {
			fn.call(this, this.ems);
			return this;
		},
	
		/**
		 * 在mojo对象上缓存的数据
		 * @param {String} key 
		 * @param {Object} value (optional)
		 */
		data: function(key, value) {
			if (arguments.length === 2) {
				this.datas[key] = value;
			
			// arguments.length === 1
			} else { 
				if (typeof key === "function") {
					key.call(this, this.datas);
				
				// typeof key === "string"
				} else { 
					return this.datas[key];
				}
			}
			
			return this;
		},
		
		/**
		 * 删除mojo对象上缓存的数据
		 * @param {String} keys (optional)
		 */
		removeData: function(keys) {
			var datas = this.datas,
				len, 
				i = 0;
			
			if (arguments.length === 1) {
				keys = keys.split(",");
				len = keys.length;
				
				for (; i < len; i++) {
					delete datas[keys[i]];
				}
				
			// arguments.length === 0
			} else { 
				this.datas = {};
			}
			
			return this;
		},
		
		/**
		 * 添加子节点
		 * @param {String/HTMLElement} elem
		 */
		append: function(elem) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				returnVal;
			
			if (typeof elem === "string") {
				for (; i < len; i++) {
					ems[i].innerHTML += elem;
				}
			} else if (typeof elem === "object") {
				for (; i < len; i++) {
					ems[i].appendChild(elem);
				}
				
			// typeof elem === "function"
			} else { 
				for (; i < len; i++) {
					returnVal = elem.call(this, ems[i], i);
					if (typeof returnVal === "string") {
						ems[i].innerHTML += returnVal;
					
					// typeof returnVal === "object"
					} else { 
						ems[i].appendChild(returnVal);
					}
				}
				
			}
			
			return this;
		},
		
		/**
		 * 追加兄弟节点
		 * @param {String/HTMLElement} elem
		 */
		after: function(elem) {
			var ems = this.ems, 
				len = ems.length,
				i = 0,
				joo = jo,
				fragment, returnVal, e;
			
			if (typeof elem === "string") {
				fragment = joo.strToFragment(elem);
				
				for (; i < len; i++) {
					e = ems[i];
					next = joo.getNext(e);
					if (next !== null) {
						e.parentNode.insertBefore(fragment.cloneNode(true), next);
					} else {
						e.parentNode.appendChild(fragment.cloneNode(true));
					}
				}
				
			} else if (typeof elem === "object") {
				for (; i < len; i++) {
					e = ems[i];
					next = joo.getNext(e);
					if (next !== null) {
						e.parentNode.insertBefore(elem, next);
					} else {
						e.parentNode.appendChild(elem);
					}
				}
			
			// typeof elem === "function"	
			} else { 
				for (; i < len; i++) {
					e = ems[i];
					returnVal = elem.call(this, e, i);
					next = joo.getNext(e);
					if (typeof returnVal === "string") {
						fragment = joo.strToFragment(returnVal);
						if (next !== null) {
							e.parentNode.insertBefore(fragment, next);
						} else {
							e.parentNode.appendChild(fragment);
						}
					
					// typeof returnVal === "object"
					} else { 
						if (next !== null) {
							e.parentNode.insertBefore(returnVal, next);
						} else {
							e.parentNode.appendChild(returnVal);
						}
					}
				}
				
			}
			
			return this;
		},
		
		/**
		 * 插入兄弟节点
		 * @param {String/HTMLElement} elem
		 */
		before: function(elem) {
			var ems = this.ems, 
				len = ems.length,
				i = 0,
				joo = jo,
				fragment, returnVal, e;
			
			if (typeof elem === "string") {
				fragment = joo.strToFragment(elem);
				
				for (; i < len; i++) {
					e = ems[i];
					e.parentNode.insertBefore(fragment.cloneNode(true), e);
				}
				
			} else if (typeof elem === "object") {
				for (; i < len; i++) {
					e = ems[i];
					e.parentNode.insertBefore(elem, e);
				}
				
			// typeof elem === "function"	
			} else { 
				for (; i < len; i++) {
					e = ems[i];
					returnVal = elem.call(this, e, i);
					
					if (typeof returnVal === "string") {
						e.parentNode.insertBefore(joo.strToFragment(returnVal), e);
					
					// typeof returnVal === "object"
					} else { 
						e.parentNode.insertBefore(returnVal, e);
					}
				}
				
			}
			
			return this;
		},
		
		/**
		 * 包裹节点
		 * @param {String/HTMLElement} elem
		 */
		wrap: function(elem) {
			var ems = this.ems, 
				len = ems.length,
				i = 0,
				joo = jo,
				fragment, returnVal, e;
			
			if (typeof elem === "string") {
				fragment = joo.strToFragment(elem);
				
				for (; i < len; i++) {
					e = ems[i];
					e.parentNode.insertBefore(fragment.cloneNode(true), e);
					e.previousSibling.appendChild(e);
				}
				
			} else if (typeof elem === "object") {
				for (; i < len; i++) {
					e = ems[i];
					e.parentNode.insertBefore(elem, e);
					elem.appendChild(e);
				}
			
			// typeof elem === "function"	
			} else {
				for (; i < len; i++) {
					e = ems[i];
					returnVal = elem.call(this, e, i);
					
					if (typeof returnVal === "string") {
						e.parentNode.insertBefore(joo.strToFragment(returnVal), e);
						e.previousSibling.appendChild(e);
					
					// typeof returnVal === "object"
					} else { 
						e.parentNode.insertBefore(returnVal, e);
						returnVal.appendChild(e);
					}
				}
				
			}
			
			return this;
		},
		
		/**
		 * 替换节点
		 * @param {String/HTMLElement} elem
		 * @param {Function} fn (optional)
		 */
		replace: function(elem, fn) {
			var ems = this.ems, 
				len = ems.length,
				i = 0,
				joo = jo,
				fragment, e;
			
			if (typeof elem === "string") {
				fragment = joo.strToFragment(elem);
				
				for (; i < len; i++) {
					e = ems[i];
					e.parentNode.replaceChild(fragment.cloneNode(true), e);
					if (fn) { // typeof fn === "function"
						fn.call(this, e, i)
					}
				}
				
			} else if (typeof elem === "object") {
				for (; i < len; i++) {
					e = ems[i];
					e.parentNode.replaceChild(elem, e);
					
					// typeof fn === "function"
					if (fn) { 
						fn.call(this, e, i)
					}
				}
				
			}
			
			return this;
		},
		
		/**
		 * 删除节点
		 * @param {Function} fn (optional)
		 */
		remove: function(fn){
			var ems = this.ems,
				len = ems.length,
				i = 0,
				e;
				
			for (; len < len; i++) {
				e = ems[i];
				e.parentNode.removeChild(e);
				
				// typeof fn === "function"
				if (fn) { 
					fn.call(this, e, i)
				}
			}
			
			return this;
		},
		
		/**
		 * 设置匹配元素的html内容
		 * @param {String} strHtml
		 */	
		html: function(strHtml) {
			var ems = this.ems, 
				len = ems.length,
				i = 0,
				arr;
			
			if (arguments.length === 1) {
				if (typeof strHtml === "string") {
				
					for (; i < len; i++) {
						ems[i].innerHTML = strHtml;
					}
				
				// typeof strHtml === "function"	
				} else { 
					for (; i < len; i++) {
						ems[i].innerHTML = strHtml.call(this.ems[i], i);
					}
					
				}
				
				return this;
			
			// arguments.length === 0	
			} else { 
				arr = [];
				
				for (; i < len; i++) {
					arr[i] = ems[i].innerHTML;
				}
				
				return arr;
			}
		},
		
		/**
		 * 清空节点子元素
		 */
		empty: function() {
			var ems = this.ems, 
				len = ems.length,
				i = 0;
			
			for (; i < len; i++) {
				ems[i].innerHTML = "";
			}
			
			return this;
		},
		
		/**
		 * 设置节点文本
		 * @param {String or Funtion} txt
		 */
     	text: function(txt) {
			var ems = this.ems, 
				len = ems.length,
				i = 0, 
				arr, e;
			
			if (arguments.length === 1) {
				if (typeof txt === "string") {
					
					for (; i < len; i++) {
						e = ems[i];
						typeof e.innerText === "string" ? e.innerText = txt : e.textContent = txt;
					}
				
				// typeof txt === "function"	
				} else { 
					for (; i < len; i++) {
						e = ems[i];
						typeof e.innerText === "string" ? 
							e.innerText = txt.call(this, e.innerText, e, i) : 
								e.textContent = txt.call(this, e.textContent, e, i);
					}
				}
				
				return this;
				
			// arguments.length === 0	
			} else { 
				arr = [];
				
				for (; i < len; i++) {
					e = ems[i];
					arr[i] = e.innerText || e.textContent;
				}
				
				return arr;
			}
		},
		
		/**
		 * 设置节点value值
		 * @param {String or Function} value
		 */
		val: function(value) {
			var ems = this.ems, 
				len = ems.length,
				i = 0, 
				arr;
			
			if (arguments.length === 1) {
				if (typeof value === "string") {
				
					for (; i < len; i++) {
						ems[i].value = value;
					}
					
				// typeof value === "function"	
				} else { 
					for (; i < len; i++) {
						ems[i].value = value.call(this, ems[i].value, i);
					}
				}
				
				return this;
				
			// arguments.length === 0	
			} else { 
				arr = [];
				
				for (; i < len; i++) {
					arr[i] = ems[i].value;
				}
				
				return arr;
			}
		},
		
		/**
		 * @param {Object} attr
		 * @param {Object} value
		 */
		attr: function(attr, value) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				arr, e, p;
			
			if (arguments.length === 2) {
				if (typeof value !== "function") {
					for (; i < len; i++) {
						ems[i][attr] = value;
					}
				} else {
					for (; i < len; i++) {
						e = ems[i];
						p = typeof e[attr] !== "undefined" ? e[attr] : e.getAttribute(attr);
						e[attr] = value.call(this, p, e, i);
					}
				}
			
			// arguments.length === 1	
			} else { 
				if (typeof attr === "string") {
					for (; i < len; i++) {
						e = ems[i];
						arr[i] = typeof e[attr] !== "undefined" ? e[attr] : e.getAttribute(attr);
					}
					
					return arr;
				
				// typeof attr === "object"	
				} else {
					for (; i < len; i++) {
						for (p in attr) {
							ems[i][p] = attr[p];
						}
					}
				}
			}
			
			return this;
		},
		
		/**
		 * @param {String} attr
		 */
		removeAttr: function(attrs) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				e, n, m;
			
			attrs = attrs.split(",");
			m = attrs.length
			
			for (; i < len; i++) {
				e = ems[i];
				for (n = 0; n < m; n++) {
					e.removeAttribute(attrs[n]);
					if (typeof e[attrs[n]] !== "undefined") {
						delete e[attrs[n]];
					}
				}
			}
			
			return this;
		},
		
		/**
		 * 
		 * @param {Object or String} key
		 * @param {String or Function} value
		 */
		css: function(key, value) {
			var ems = this.ems, 
				len = ems.length,
				i = 0, 
				re = /(\d+)(\D*)/, 
				joo = jo, 
				pInt = parseInt, 
				e, arr, p;
			
			if (arguments.length === 2) {
				if (typeof value == "string") {
					if (value.indexOf("+=") !== -1) {
						value = value.match(re);
						
						for (; i < len; i++) {
							e = ems[i];
							joo.setStyle(key, e, pInt(joo.getStyle(key, e)) + value[1] * 1 + value[2]);
						}
					} else if (value.indexOf("-=") !== -1) {
						value = value.match(re);
						
						for (; i < len; i++) {
							e = ems[i];
							joo.setStyle(key, e, pInt(joo.getStyle(key, e)) - value[1] * 1 + value[2]);
						}
					} else {
						for (; i < len; i++) {
							joo.setStyle(key, ems[i], value);
						}
					}
				
				// typeof value === "function"	
				} else { 
					for (; i < len; i++) {
						e = ems[i];
						joo.setStyle(key, e, value.call(this, joo.getStyle(key, e), e, i));
					}
				}
				
			// arguments.length === 1	
			} else { 
				if (typeof key === "string") {
					arr = [];
					
					for (; i < len; i++) {
						arr[i] = joo.getStyle(key, ems[i]);
					}
					
					return arr;
					
				// typeof key === "object"	
				} else { 
					for (p in key) {
						i = 0;
						if (typeof key[p] === "function") {
							for (; i < len; i++) {
								e = ems[i];
								value = key[p].call(this, joo.getStyle(p, e), e, i);
								joo.setStyle(p, e, value);
							}
						
						// typeof key[p] === "string"
						} else { 
							value = key[p];
							
							if (value.indexOf("+=") !== -1) {
								value = value.match(re);
								
								for (; i < len; i++) {
									e = ems[i];
									joo.setStyle(p, e, pInt(joo.getStyle(p, e)) + value[1] * 1 + value[2]);
								}
							} else if (value.indexOf("-=") !== -1) {
								value = value.match(re);
								
								for (; i < len; i++) {
									e = ems[i];
									joo.setStyle(p, e, pInt(joo.getStyle(p, e)) - value[1] * 1 + value[2]);
								}
							} else {
								for (; i < len; i++) {
									joo.setStyle(p, ems[i], value);
								}
							}
						}
					}
				}
			}
			
			return this;
		},
		
		/**
		 * 添加css样式
		 * @param {String} cls
		 */
		addClass: function(cls) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				re = new RegExp("(^| )" + cls + "( |$)"),
				e;
			
			for (; i < len; i++) {
				e = ems[i];
				
				if (e.className) {
					if (!re.test(e.className)) {
						e.className += " " + cls;
					}
				} else {
					e.className = cls;
				}
			}
			
			return this;
		},
		
		/**
		 * 删除Css样式
		 * @param {String} cls
		 */
		removeClass: function(cls) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				re = new RegExp(cls.replace(",", "|"), "g"), 
				e;
			
			if (arguments.length === 1) {
				for (; i < len; i++) {
					e = ems[i];
					cls = e.className;
					
					if (cls) {
						e.className = cls.replace(re, "");
					}
				}
			
			// arguments.length === 0	
			} else { 
				for (; i < len; i++) {
					ems[i].className = "";
				}
			}
			
			return this;
		},
		
		/**
		 * 添加style内嵌形式的字符串
		 * @param {Object} sty
		 */
		style: function(sty) {
			var ems = this.ems, 
				len = ems.length,
				i = 0, 
				arr;
			
			if (arguments.length === 1) {
				for (; i < len; i++) {
					ems[i].style.cssText += ";" + sty;
				}
				
				return this;
			
			// arguments.length === 0	
			} else { 
				arr = [];
				
				for (; i < len; i++) {
					arr[i] = ems[i].style.cssText;
				}
				
				return arr;
			}
		},
		
		/**
		 * 删除style内嵌形式的字符串
		 * @param {String} sty
		 */
		removeStyle: function(sty) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				arr, e, m, n, str;
			
			if (arguments.length === 1) {
				arr = sty.split(",");
				m = arr.length;
				
				for (; i < len; i++) {
					e = ems[i];
					sty = e.style.cssText + ";";
					str = "";
					for (n = 0; n < m; n++) {
						str += arr[n] + "[^;]*;|";
					}
					e.style.cssText = sty.replace(new RegExp(str, "gi"), "");
				}
			} else {
				for (; i < len; i++) {
					ems[i].style.cssText = "";
				}
			}
			
			return this;
		},
		
		anim : function(){//自定义动画
			var args = arguments,obj = args[0],
				dur,fn,type,ease,
				ops,arr,p,
				ems = this.ems,
				tids = this.tids;//存放计时器id
			
			if(args.length === 2 && typeof args[1] === "object"){//参数为对象的形式
				ops = args[1];
				dur = ops.dur || 300;//动画时间
				fn = ops.fn || null;//完成回调函数
				type = ops.type || "swing";//动画类型
				ease = ops.ease || "easeIn";//缓冲类型
			}else{//多参数形式
				dur = args[1] || 300;
				fn =  args[2] || null;
				type =  args[3] || "swing";
				ease =  args[4] || "easeIn";
			}
			
			ops = [];//依次装入:属性名,符号,值,单位
			args = 0;
			for(p in obj){//解析属性值
				ops[args] = p;
				if (p.toLowerCase().indexOf("color") !== -1) {//颜色属性
					ops[args + 1] = obj[p];
					ops[args + 2] = "#";
					ops[args + 3] = "";
				} else {
					arr = obj[p].match(/((-=)?|(\+=)?)(-?\d+)(\D*)/);
					ops[args + 1] = arr[2] || arr[3];
					ops[args + 2] = arr[4];
					ops[args + 3] = arr[5] || "px";
				}		
				args += 4;
			}
			arr = this;//传递给回调函数作为this的值

			for (var i = 0, j = ems.length; i < j; i++){
				tids[i] = jo.parseAnim(ems[i],ops,dur,type,ease,fn,arr);
			}
			return this;
		},
		isAnim : function(){//是否动画中
			if(this.tids.length){
				return true;
			}
			return false;
		},
		stop : function(){//终止动画
			var tids = this.tids;
			for (var i = 0, j = tids.length; i < j; i++) {
				clearInterval(tids[i]);
			}
			tids.length = 0;
			return this;			
		},
		addEnd : function(fn){//动画回调函数
			this.ends.push(fn);
			return this;
		},
		removeEnd : function(fn){//移除动画回调
			var ends = this.ends;
			if (arguments.length === 1) {
				for (var i = 0, j = ends.length; i < j; i++) {
					if (fn === ends[i]) {
						ends.splice(i, 1);
					}
				}
			}else {
				ends.length = 0;
			}
			return this;
		},
		
		bind : function(type,fn){//绑定事件
		    var e,ems = this.ems,ths = this,myfn,
				args = Array.prototype.slice.call(arguments,2);
			for (var i = 0, j = ems.length; i < j; i++){
				e = ems[i];
				myfn = function(event){
					fn.apply(ths,[e, window.event || event].concat(args));
				}
				jo.addEventHandler(e,type,myfn);
				//缓存事件类型和函数
				if (!e.mojoEventHandler) {
					e.mojoEventHandler = {};
				}
				if (!e.mojoEventHandler[type]) {
					e.mojoEventHandler[type] = [];
				}
				e.mojoEventHandler[type].push(myfn);
			}
			return this;	
		},
		unbind : function(){//移除事件
			var args = arguments,len = args.length,type,
				mh,e,ems = this.ems;
			if(len === 1){//移除类型所有处理函数
				type = args[0];
				for (var i = 0, j = ems.length, n, m; i < j; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh && mh[type]) {
						for (n = 0, m = mh[type].length; n < m; n++) {
							jo.removeEventHandler(e, type, mh[type][n]);
						}
						delete mh[type];
					}
				}
			}else if(len === 2){//移除对应类型对应函数
				type = args[0];
				var fn = args[1];
				for (var i = 0, j = ems.length, n, m; i < j; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh && mh[type]) {
						for (n = 0, m = mh[type].length; n < m; n++) {
							if (mh[type][n] === fn) {
								jo.removeEventHandler(e, type, fn);
								mh[type].splice(n, 1);
							}
						}
						if (mh[type].length === 0) {
							delete mh[type]
						}
					}
				}
			}else{//没有参数移除所有事件
				for (var i = 0, j = ems.length, n, m; i < j; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh) {
						for (type in mh) {
							for (n = 0, m = mh[type].length; n < m; n++) {
								jo.removeEventHandler(e, type, mh[type][n]);
							}
							delete mh[type];
						}
						mh = null;
					}
				}				
			}
			return this;
		},
		
		/**
		 * 
		 * on(String,Function)
		 * on({String,Function})
		 */
		on: function(type, fn) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				ths = this, 
				args = slice.call(arguments, 2), 
				p, e;
			
			if (arguments.length === 2) {
				for (; i < len; i++) {
					e = ems[i];
					e["on" + type] = function(event) {
						fn.apply(ths, [this, this.mojoIndex, window.event || event].concat(args));
					}
					e.mojoIndex = i;
				}
			} else { //  arguments.length === 1
				for (p in type) {
					this.on(p,type[p]);
				}
			}
			
			return this;
		}
	};
	
	//内部对象,mojo方法辅助对象
	jo = {
		/**
		 * 根据选择器初始化mo对象
		 * @param {String or Object} selector
		 */
		init : function(selector){
			var i,j,str,obj,
			    arr = [];
			
			//选择器为字符串	
			if (typeof selector === "string") {
				arr = arr.concat(shimmer.selector(selector,document));
			} else if(typeof selector === "object"){//选择器为对象
				arr = arr.concat(selector);
			}
			
			//判断选择器的有效性
			if(arr.length){
				return new mo(selector,arr);
			}
			
			return null;
		},
		
		/**
		 * 返回下一个非空白HTMLElement元素
		 * @param {Object} e
		 */
		getNext : function(e){
			var next; 
			while(next = e.nextSibling){
				if (next.nodeType === 3 && next.nodeValue.replace(/\s/g, "") === "") {
					e = next;
					continue;
				}
				return next;
			}
			
			return null;
		},
		
		/**
		 * html字符串转换成documentFragment
		 * @param {String} strHtml
		 */
		strToFragment : function(strHtml){
			var doc = document,
				div = doc.createElement("div"),
				fragment = doc.createDocumentFragment(),
				cns;
				
			div.innerHTML = strHtml;
			cns = div.childNodes;
			while (cns.length) {
				fragment.appendChild(cns[0]);
			}
			return fragment;				
		},
		
		/**
		 * 去除字符串前后的空白字符
		 * @param {Srting} str
		 */
		trim : function(str){
			return str.replace(/^\s+|\s+$/g,"");
		},
		
		/**
		 * 获取style
		 * @param {Object} sty
		 * @param {Object} e
		 */
		getStyle : function(sty,e){
			var obj =  e.currentStyle || window.getComputedStyle(e, null);
			switch (sty) {
	       		case "float" : return  typeof obj.styleFloat === "string" ?
									   	 obj.styleFloat :
											obj.cssFloat;
	 			case "opacity" : return e.filters ? 
											(e.filters.alpha ? e.filters.alpha.opacity : 100) : 
												obj.opacity * 100;
	  			default : return obj[sty];	 	 
			}
		},
		
		/**
		 * 设置style
		 * @param {Object} sty
		 * @param {Object} e
		 * @param {Object} value
		 */
		setStyle : function(sty, e, value){
			var obj = e.style,
				curObj = e.currentStyle || window.getComputedStyle(e, null);
				
  			switch (sty) {
		 		case "float" : typeof curObj.styleFloat === "string" ? 
							     obj.styleFloat = value : 
									obj.cssFloat = value;
					break;
		 		case "opacity" : e.filters ? 
								 	obj.filter = (curObj.filter || "").replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + value + ")" : 
										obj.opacity = value / 100;
					break;
		  		default : obj[sty] = value;
			}
		},
		
		parseAnim : function(e,ops,dur,type,ease,fn,ths){//配置anim
			var	len = ops.length,
		    	step = [],//属性值数组
				isColor;//是否为颜色属性
		    for (var i = 0,j = 0; i < len; i += 4,j += 5) {
				isColor = ops[i + 2] === "#";
				if (!isColor) {//不是颜色属性
					var b ,c;//初始值,变化值
					if(typeof e[ops[i]] === "undefined"){
						b = parseInt(this.getStyle(ops[i], e));
						if (isNaN(b)) {//设置初始值
							b = 0;
						}						
					} else {
						b = e[ops[i]];
					}
					
					switch (ops[i + 1]) {//判断符号,设置变化量
						case "+=":
							c = ops[i + 2] * 1;
							break;
						case "-=":
							c = ops[i + 2] * 1 - ops[i + 2] * 2;
							break;
						default:
							c = ops[i + 2] * 1 - b;
					}
					step[j] = b;//压入当前属性的初始值
					step[j + 1] = c;//压入当前属性的变化值
				}else {//颜色属性
					var arr = [],//RGB三种颜色的初始值(b1,b2,b3)和变化值(c1,c2,c3)
 						rgb1 = this.color10(this.getStyle(ops[i], e)),//十进制RGB初始颜色
 						rgb2 = this.color10(ops[i + 1]);//十进制RGB最终颜色
					for(var n = 0;n < 3;n++){
						arr[n] = rgb1[n] * 1;
						arr[n + 3] = rgb2[n] * 1 - arr[n];
					}
					
					step[j] = arr;//压入颜色属性的变化数组
					step[j + 1] = "#";//表示为颜色数组
				}
				
				step[j + 2] = 0;//当前属性的动画开始时间
				step[j + 3] = ops[i];//压入当前属性的属性名
				step[j + 4] = ops[i + 3];//当前属性单位
			}
			return this.timer(step,fn,e,ths,dur,type,ease);
		},
		timer : function(step,fn,e,ths,dur,type,ease){
			var j = step.length,k = j/5,
				end,start = new Date().valueOf(),
				tid = setInterval(function(){
					end = new Date().valueOf();
					var step2,step3,step1,stepi;
					for(var i = 0;i < j; i += 5){
						step2 = step[i + 2];
						if (step2 !== dur) {//当前属性动画未完成
							step[i + 2] = step2 += end - start;
							if(step2 > dur){//当前属性动画完成
							        step[i + 2] = step2 = dur;
							}						
							step3 = step[i + 3];
							step1 = step[i + 1];
							stepi = step[i];
							if (step1 === "#") {//颜色属性
								for (var n = 0, m; n < 3; n++) {
									m = Math.ceil(tween[type][ease](step2, stepi[n], stepi[n + 3], dur)).toString(16);
									stepi[n + 6] = m.length === 1 ? "0" + m : m;
								}
								jo.setStyle(step3, e, "#" + stepi[6] + stepi[7] + stepi[8]);
							}else {//非颜色属性
								if (typeof e[step3] === "undefined") {
									jo.setStyle(step3, e, Math.ceil(tween[type][ease](step2, stepi, step1, dur)) + step[i + 4]);
								} else {
								    e[step3] = Math.ceil(tween[type][ease](step2, stepi, step1, dur));
								}
							}
						}else{
							k--;//未完成属性动画计数器
						}
					}				
					
					if (k !== 0) {
						start = end;
					} else {//所有属性动画完成
						clearInterval(tid);
						var ends = ths.ends,tids = ths.tids;
						for (var w = 0, z = tids.length; w < z; w++) {
							if (tids[w] === tid) {
								tids.splice(w, 1);
							}
						}
						if (fn) {
							fn.call(ths, e);
						}
						for (var a = 0, b = ends.length; a < b; a++) {
							ends[a].call(ths, e);
						}
					}					
				},10);
			return tid;
		},
		color10 : function(cor){//转换颜色为十进制值
			var rgb = [],len = cor.length; 
			if(len === 7){//#000000格式				
				for(var i = 0;i < 3;i++){
					rgb[i] = parseInt(cor.substring(2 * i + 1,2 * i + 3),16);
				}
			} else if(len === 4){//#000格式
				cor = cor.replace(/\w{1}/g,"$&$&");	
				for(var i = 0;i < 3;i++){
					rgb[i] = parseInt(cor.substring(2 * i + 1,2 * i + 3),16);
				}				
			} else{//rgb(0,0,0)格式
				if (cor === "transparent") {
					cor = "rgb(255,255,255)";
				}
				rgb = cor.match(/\d+/g).toString().split(",");
			}
			return rgb;
		},		
		addEventHandler : function(e,type,fn){//添加事件函数
			if (e.attachEvent) {
				e.attachEvent("on" + type, fn);
			}else {
				e.addEventListener(type, fn, false);
			}
			
		},
		removeEventHandler : function(e,type,fn){//删除事件函数
			if (e.detachEvent) {
				e.detachEvent("on" + type, fn);
			}else {
				e.removeEventListener(type, fn, false);
			}
		}
	};
	
	
	
	/**
 	 * Copyright (c) 2009 scott.cgi
 	 * under MIT License
 	 * Since  2009-11-11
 	 * Version 1.0
     * Date 2009-11-16
 	 */
	shimmer = {
		//注意选择器除了后代规则外是不能有空格的,可以在高层用正则处理一下在传过来
		selector: function(s, context){//选择器字符串,上下文
			var arr = [], arrs = s.split(","), arr1, arr2, nodes1, nodes2 = [];
			for (var i = 0, j = arrs.length; i < j; i++) {//逗号分隔有效选择器
				arr1 = arrs[i].split(/ |\+|>|~/);//把选择器按照4大规则分开存放到数组(后代,子元素,哥哥,弟弟)
				arr2 = arrs[i].match(/ |\+|>|~/g);//存放4大规则的数组,这个数组比arr1长度小1
				if (arr2 === null) {//没有4大规则的情况
					arr = arr.concat(this.idClassTag(arr1[0], context, " "));//默认为当前上下文的后代规则
				} else {
					nodes1 = this.idClassTag(arr1[0], context, " ");
					for (var n = 0, m = arr2.length, k, l; n < m; n++) {//更具规则组装arr数组,存放既是HTMLElement
						l = nodes1.length
						for (k = 0; k < l; k++) {
							nodes2 = nodes2.concat(this.idClassTag(arr1[n + 1], nodes1[k], arr2[n]));
						}
						//这是为了让下一次应用4大规则之一的时候,上一次的元素作为上下文
						nodes1 = nodes2;
						//nodes2.length = 0本来用这种方式清空数组的,但是发现concat有问题
						nodes2 = [];
					}
					arr = arr.concat(nodes1);
				}
			}
			return arr;
		},
		idClassTag : function(s,context,symbol){//选择器,上下文,规则
			var arr = [];
			if(/#(\S+)/.test(s)){//解析id
				var e = document.getElementById(RegExp.$1);
				if(e){
					arr[0] = e;
				}
			} else if(/\[|:/.test(s)){ //复杂情况有伪类和属性
				var n,tag,attr,pseudo;
				if(/([a-zA-Z]*\.[^\[:]+)/.test(s)){//带有伪类,属性的class规则
					//把去除伪类和属性的部分调用自己,这部分含有class规则
					n = this.idClassTag(RegExp.$1,context,symbol);
				} else {
					//这部分仅含有tag,或只有伪类和属性时候使用*
					n = this.idClassTag(s.match(/[a-zA-Z]*/)[0] || "*",context,symbol);
				}
				attr = s.match(/[^\[]+(?=\])/g);//存放属性数组
				pseudo = s.split(":");
				pseudo = pseudo.length === 1 ? null : pseudo.slice(1);//存放伪类数组
				
				//根据属性数组规则,剔除不符合的HTMLElement
				if (attr) {
					arr = this.filterAttr(n, attr);
				} else {
					arr = n;
				}
				//用伪类数组过滤HTMLElement集合
				if (pseudo) { 
					arr = this.filterPseudo(arr,pseudo);
				}
			} else if(/([a-zA-Z]*)\.(\S+)/.test(s)){//解析class
				var cls = RegExp.$2.replace(/\./g, " "),
					tag = RegExp.$1,
					k = 0,
					n;
				switch (symbol) {
					//后代
					case " ":
						n = context.getElementsByTagName(tag || "*"); 
						for (var i = 0, j = n.length; i < j; i++) {
							if (n[i].className.indexOf(cls) !== -1) {
								arr[k] = n[i];
								k++;
							}
						}
						break;
					//子元素		
					case ">":
						for(var i = 0,ns = context.childNodes, j = ns.length; i < j; i++){
							n = ns[i];
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag) {
								if (n.className.indexOf(cls) !== -1) {
									arr[k] = n;
									k++;
								}								
							}
						}
						break;	
					//弟弟元素
					case "+":
						n = context.nextSibling;
						while(n){
							if(n.nodeType === 1 && n.nodeName.toLowerCase() === tag){
								if (n.className.indexOf(cls) !== -1) {
									arr[k] = n;
									k++;
								}
							}
							n = n.nextSibling;
						}
						break;
					//哥哥元素
					case "~":
						n = context.previousSibling;
						while(n){
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag) {
								if (n.className.indexOf(cls) !== -1) {
									arr[k] = n;
									k++;
								}
							}
							n = n.previousSibling;
						}
				}
			} else {//解析tag
				var n;
				switch (symbol) {
					//后代
					case " ":
						n = context.getElementsByTagName(s);
						//shit,这里用Array.prototype.slice.call(nodes,0)转换在IE下报错
						//我也不知道怎么搞的fuck ie
						for (var i = 0, j = n.length; i < j; i++) {
							arr[i] = n[i];
						}
						break;
					//子元素		
					case ">":
						for (var i = 0, ns = context.childNodes, j = ns.length, k = 0; i < j; i++) {
							n = ns[i];
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === s){
								arr[k] = n;
								k++;
							}
						}
						break;
					//弟弟元素
					case "+":
						n = context.nextSibling;
						var k = 0;
						while(n){
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === s) {
								arr[k] = n;
								k++;
							}
							n = n.nextSibling;
						}
						break;
					//哥哥元素	
					case "~":
						n = context.previousSibling;
						var k = 0;
						while (n) {
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === s) {
								arr[k] = n;
								k++;
							}
							n = n.previousSibling;
						}
				}
			}
			return arr;
		},
		filterAttr : function(nodes,attr){//需要属性过滤的的元素数组,属性规则数组
			var attr1,attr2,attrVal,arr = [],k = 0,len = attr.length;
			for(var i = 0,j = nodes.length,n; i < j; i++){
				for(n = 0; n < len; n++){
					attr1 = attr[n].split(/=|~=|\|=|\^=|\$=|\*=/);//属性规则的属性名值对
					attr2 = attr[n].match(/=|~=|\|=|\^=|\$=|\*=/g);//属性规则的规则符号
					attr2 = attr2 ? attr2[0] : " ";
					//元素属性名对应的属性值,强制字符串转换了
					attrVal = String(nodes[i][attr1[0]] || nodes[i].getAttribute(attr1[0]) || "");
					
					//根据规则符号处理,一旦不符合条件就终止循环
					switch (attr2) {
						case " ": 
							if (!attrVal) 
								n = len;
							break;
						case "=":
							if(attrVal !== attr1[1])
								n = len;
							break;
						/*
						这个规则让我好迷惑,没有实现
						case "~=":;
							break;
						这个规则也让我好迷惑,没有实现	
						case "|=":;
							break;	
						*/
						case "^=":
							if(!new RegExp("^"+attr1[1]).test(attrVal))
								n = len;
							break;
						case "$=":
							if(!new RegExp(attr1[1]+"$").test(attrVal))
								n = len;
							break;	
						case "*=":
							if(attrVal.indexOf(attr1[1]) === -1)
								n = len;		
					}
				}
				if(n === len){//说明循环顺利结束,当前元素符合条件
					arr[k] = nodes[i];
					k++;
				}		
			}
			return arr;
		},
		filterPseudo : function(nodes,pseudo){//需要伪类过滤的的元素数组,伪类规则数组
			var arr = [],name,param;
			for(var i = 0,j = pseudo.length; i < j; i++){
				if(/\((\S+)\)/.test(pseudo[i])){
					param = RegExp.$1;
				}
				name = pseudo[i].replace(/-|\(\S+\)/g,"");
				arr = arr.concat(this.pseudos[name](nodes,param));
			}
			return arr;
		},
		pseudos : {//伪类的规则
			firstchild : function(nodes){ 
				var arr = [], f, k = 0;
				for (var i = 0, j = nodes.length; i < j; i++) {
					f = nodes[i].firstChild;
					while (f) {
						if (f.nodeType === 1) {
							arr[k] = f;
							k++;
							break;
						}
						f = f.nextSibling;
					}
				}
				return arr;
			},
			lastchild : function(nodes){
				var arr = [], f, k = 0;
				for(var i = 0,j = nodes.length; i < j; i++){
					f = nodes[i].lastChild;	
					while(f){
						if(f.nodeType === 1){
							arr[k] = f;
							k++;
							break;
						}
						f = f.previousSibling;
					}
				}
				return arr;
			},
			even : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i+=2){
					arr[k] = nodes[i];
					k++;
				}
				return arr;
			},
			odd : function(nodes){
				var arr = [],k = 0;
				for(var i = 1,j = nodes.length;i < j; i+=2){
					arr[k] = nodes[i];
					k++;
				}
				return arr;				
			},
			eq : function(nodes,param){
				var arr = [];
				param = param * 1;
				if(param < nodes.length){
					arr[0] = nodes[param];
				}
				return arr;
			},
			gt : function(nodes,param){
				var arr = [];
				param = param * 1;
				if(param < nodes.length){
					arr = arr.concat(nodes.slice(param));
				}
				return arr;				
			},
			lt : function(nodes,param){
				var arr = [];
				param = param * 1;
				if(param < nodes.length){
					arr = arr.concat(nodes.slice(0,param));
				}
				return arr;				
			},
			first : function(nodes){
				var arr = [];
				if(nodes.length){
					arr[0] = nodes[0];
				}
				return arr;
			},
			last : function(nodes){
				var arr = [];
				if(nodes.length){
					arr[0] = nodes[nodes.length - 1];
				}
				return arr;
			},
			enabled : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(!nodes[i].disabled){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;
			},
			disabled : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(nodes[i].disabled){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;				
			},
			checked : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(nodes[i].checked){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;				
			},
			selected : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(nodes[i].selected){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;				
			}
		}	
	};

	//mojo扩展
	mojo.extend = mojo.fn.extend = function(obj){
		var p;
		for (p in obj) {
			this[p] = obj[p];
		}
		return this;
	};
	
	mojo.extend({
		tween: function(t){//安装tween算法
			var p;
			for (p in t) {
				tween[p] = t[p];
			}
			return this;
		},
		addPseudo : function(n,fn){//添加伪类选择器解析
			shimmer.pseudos[n] = fn;
			return this;
		},
		ver : "0.65",
		info : "code by scott.Cgi"
	});
	
  
})(window,undefined);
