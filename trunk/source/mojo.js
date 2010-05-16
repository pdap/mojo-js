/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-9-1
 * Nightly Builds
 */ 
(function(window,undefined){ 
	var 
		//函数域中的文档对象引用
		document = window.document,
		
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
		
		//css选择器解析引擎
		mojoCss,
		
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
			//动画id
			this.tid = 0;
			//动画队列
			this.animQue = [];
			//缓存mojo对像上数据的容器
			this.datas = {};			
		},
		
		/**
		 * mojo变量注册到window上,并赋值为构造mo对象的函数
		 * mojo(String)
		 * mojo(HTMLElement)
		 */
	    mojo = window.mojo = function(selector){
			return jo.init(selector);
		};

	//mo对象的原型链,也就是mojo对象原型链
	mojo.fn = mo.prototype = {
		/**
		 * 注册对应HTMLElement元素上的处理函数
		 * each(Function)
		 */
		each : function(fn) {
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
		 * elems(Function)
		 */
		elems : function(fn) {
			fn.call(this, this.ems);
			return this;
		},
	
		/**
		 * 在mojo对象上缓存的数据
		 * data(String,Value)
		 * data(Function)
		 * data(String)
		 */
		data : function(key, value) {
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
		 * removeData(String)
		 * removeData()
		 */
		removeData : function(keys) {
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
		 * append(String)
		 * append(HTMLElement)
		 */
		append : function(elem) {
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
		 * after(String)
		 * after(HTMLElement)
		 */
		after : function(elem) {
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
		 * before(String)
		 * before(HTMLElement)
		 */
		before : function(elem) {
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
		 * wrap(String)
		 * wrap(HTMLElement)
		 */
		wrap : function(elem) {
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
		 * replace(String,[Function])
		 * replace(HTMLElement,[Function])
		 */
		replace : function(elem, fn) {
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
		 * remove([Function])
		 */
		remove : function(fn){
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
		 * html(String)
		 * html(Function)
		 * html()
		 */	
		html: function(strHtml) {
			var ems = this.ems, 
				len = ems.length,
				i = 0,
				arr, e;
			
			if (arguments.length === 1) {
				if (typeof strHtml === "string") {
					for (; i < len; i++) {
						ems[i].innerHTML = strHtml;
					}
				
				// typeof strHtml === "function"	
				} else { 
					for (; i < len; i++) {
						e = ems[i];
						e.innerHTML = strHtml.call(this, e, i);
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
		 * empty()
		 */
		empty : function() {
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
		 * text(String)
		 * text(Function)
		 * text()
		 */
     	text : function(txt) {
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
		 * val(String)
		 * val(Function)
		 * val()
		 */
		val : function(value) {
			var ems = this.ems, 
				len = ems.length,
				i = 0, 
				arr, e;
			
			if (arguments.length === 1) {
				if (typeof value === "string") {
					for (; i < len; i++) {
						ems[i].value = value;
					}
					
				// typeof value === "function"	
				} else { 
					for (; i < len; i++) {
						e = ems[i];
						e.value = value.call(this, e.value, e, i);
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
		 * attr(String,Value)
		 * attr(String,Function)
		 * attr(String)
		 * attr({name:value})
		 */
		attr : function(attr, value) {
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
		 * removeAttr(String)
		 */
		removeAttr : function(attrs) {
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
		 * css(String,String)
		 * css(String,Function)
		 * css(String)
		 * css({name:String,name:Function,...})
		 */
		css : function(key, value) {
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
		 * addClass(String)
		 */
		addClass : function(cls) {
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
		 * removeClass(String)
		 * removeClass()
		 */
		removeClass : function(cls) {
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
		 * style(String)
		 * style()
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
		 * removeStyle(String)
		 * removeStyle()
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
		
		anim : function(obj) { 
			var args = arguments,
				re = /((-=)?|(\+=)?)(-?\d+)(\D*)/,
				joo = jo,
				ems = this.ems,
				dur, fn, type, ease,
				ops, arr, twn, p, i;
			
			if(typeof args[1] !== "object") {//多参数形式
				dur = args[1] || 400;
				fn =  args[2] || null;
				type =  args[3] || "swing";
				ease =  args[4] || "easeNone";			
			} else {
				ops = args[1];
				dur = ops.dur || 400;//动画时间
				fn = ops.fn || null;//完成回调函数
				type = ops.type || "swing";//动画类型
				ease = ops.ease || "easeNone";//缓冲类型
			}
			
			twn = tween[type][ease];
			ops = [];//依次装入:属性名,符号,值,单位
			i = 0;
			for(p in obj) {//解析属性值
				ops[i] = p;
				if (p.toLowerCase().indexOf("color") === -1) {//颜色属性
					arr = obj[p].match(re);
					ops[i + 1] = arr[2] || arr[3];
					ops[i + 2] = arr[4];
					ops[i + 3] = arr[5];
				} else {
					ops[i + 1] = obj[p];
					ops[i + 2] = "#";
					ops[i + 3] = "";					
				}		
				i += 4;
			}
			
			if (this.tid) {
				this.animQue.push([ems, ops, dur, fn, twn]);
			} else {
				arr = joo.stepInfo(ems, ops);
				this.tid = joo.timer(this, [arr[0], arr[1], dur, fn, twn]);
			}	
			
			return this;
		},
		
		/**
		 * 是否正在动画
		 * 
		 * isAnim()
		 */
		isAnim : function(){
			if(this.tid){
				return true;
			}
			return false;
		},
		
		/**
		 * 终止动画
		 * 
		 * stop()
		 */
		stop : function(){
			if(this.tid) {
				window.clearInterval(this.tid);
				this.animQue.length = 0;				
			}

			return this;			
		},
		
		/**
		 * 
		 * bind(String,Function,[args])
		 * bind(Object,[args])
		 */
		bind : function(type,fn){
		    var ems = this.ems,
				len = ems.length,
				i = 0,
				ths = this,
				args, e, p, bindFn;
			
			if (typeof type === "string") {
				args = arguments[2] || [];
				for (; i < len; i++) {
					e = ems[i];
					bindFn = function(event) {
						var evt = window.event || event, 
							target = evt.srcElement || evt.target;
						fn.apply(ths, [evt, target, target.mojoIndex].concat(args));
					}
					
					e.mojoIndex = i;
					
					if (e.attachEvent) {
						e.attachEvent("on" + type, bindFn);
					} else {
						e.addEventListener(type, bindFn, false);
					}
					
					if (!e.mojoEventHandler) {
						e.mojoEventHandler = {};
					}
					
					if (!e.mojoEventHandler[type]) {
						e.mojoEventHandler[type] = [];
					}
					
					e.mojoEventHandler[type].push(bindFn);
				}
			} else { // typeof type === "object"
				args = arguments[1] || [];
				for (p in type) {
					this.bind(p, type[p], args);
				}				
			}
			
			return this;	
		},
		
		/**
		 * 
		 * unbind(String,Function)
		 * unbind(String)
		 * unbind()
		 */
		unbind : function(type,fn){
			var ems = this.ems,
				len = ems.length,
				i = 0,
			    types, mh, e, n, m, j, k;
				
			if(arguments.length === 1){
				types = type.split(",");
				for (; i < len; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					for (j = 0, k = types.length; j < k; j++) {
						type = types[j];
						if (mh && mh[type]) {
							for (n = 0, m = mh[type].length; n < m; n++) {
								if (e.detachEvent) {
									e.detachEvent("on" + type, mh[type][n]);
								} else {
									e.removeEventListener(type, mh[type][n], false);
								}
							}
							delete mh[type];
						}
					}
				}
			} else if(arguments.length === 2){
				for (; i < len; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh && mh[type]) {
						for (n = 0, m = mh[type].length; n < m; n++) {
							if (mh[type][n] === fn) {
								if (e.detachEvent) {
									e.detachEvent("on" + type, mh[type][n]);
								} else {
									e.removeEventListener(type, mh[type][n], false);
								}
								mh[type].splice(n, 1);
							}
						}
						
						if (mh[type].length === 0) {
							delete mh[type]
						}
					}
				}
			} else { // arguments.length === 0
				for (; i < len; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh) {
						for (type in mh) {
							for (n = 0, m = mh[type].length; n < m; n++) {
								if (e.detachEvent) {
									e.detachEvent("on" + type, mh[type][n]);
								} else {
									e.removeEventListener(type, mh[type][n], false);
								}
							}
						}
						delete e.mojoEventHandler;
					}
				}				
			}
			
			return this;
		},
		
		/**
		 * 
		 * on(String,Function,[args])
		 * on({String:Function},[args])
		 */
		on: function(type, fn) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0, 
				ths = this, 
				args, p, e;
			
			if (typeof type === "string") {
				args = arguments[2] || [];
				for (; i < len; i++) {
					e = ems[i];
					e["on" + type] = function(event) {
						fn.apply(ths, [window.event || event, this, this.mojoIndex].concat(args));
					}
					e.mojoIndex = i;
				}
			} else { //  typeof type === "object"
				args = arguments[1] || [];
				for (p in type) {
					this.on(p, type[p], args);
				}
			}
			
			return this;
		},
		
		/**
		 * removeOn(String)
		 */
		removeOn: function(types) {
			var ems = this.ems,
				len = ems.length,
				i = 0,
				e, n, m;
			
			types = types.split(",");
			m = types.length;
			for(; i < len; i++) {
				e = ems[i];
				for(n = 0; n < m; n++) { 
					e["on" + types[n]] = "";
				}
			}	
			
			return this;
		},
		
		/**
		 * fire(String,[Object])
		 */
		fire: function(type,event) {
			var ems = this.ems, 
				len = ems.length, 
				i = 0,
				evt, p;
			
			if(document.createEventObject) {
				evt = document.createEventObject();
				if (event) { // typeof event === "object"
				  for(p in event){
				  	evt[p] = event[p];	
				  }
				}
				for(; i < len; i++){
					ems[i].fireEvent('on' + type , evt);
				}
			} else {
				evt = document.createEvent("HTMLEvents");
				if (event) { // typeof event === "object"
				  for(p in event){
				  	evt[p] = event[p];	
				  }
				}
				evt.initEvent(type, true, true);
				for(; i < len; i++){
					ems[i].dispatchEvent(evt);
				}				
			}
			
			return this;
		}
	};
	
	//内部对象,mojo方法辅助对象
	jo = {
		
		/**
		 * 根据选择器和上下文,获得HTMLElement数组
		 * 
		 * @param {String} selector 选择器
		 * @param {Undefined/String/HTMLElement/Array} context 选择器上下文
		 * 
		 * get(String)
		 * get(String, String)
		 * get(String, HTMLElement)
		 * get(String, Array)
		 */
		init : function(selector, context){
			var arr = mojoCss.get(selector, context);
			
			alert(arr.length)
			
			//判断选择器的有效性
			if(arr.length){
				return new mo(selector, arr);
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
		
		/**
		 * 计算动画步骤
		 * 
		 * @param {Array} ems 当前mojo对象对应的HTMLElment元素
		 * @param {Array} ops 动画属性数组
		 */
		stepInfo: function(ems, ops) {
			var len1 = ems.length,
				len2 = ops.length,
				pFloat = parseFloat,
				isNan = isNaN,
				color, colors = [],
				prop, props = [],
				arr, i, j, n, m, k, rgb1, rgb2, b, c, e;
				
			for (m = 0; m < len1; m++) {
				e = ems[m];
				color = [];
				prop = [];
				
				for (i = 0, j = 0, k = 0; i < len2; i += 4) {
					if (ops[i + 2] !== "#") {//不是颜色属性
						n = ops[i];
						arr = e[n];
						
						if (!arr) {
							b = pFloat(this.getStyle(ops[i], e));
							if (isNan(b)) {
								b = 0;
							}
							prop[i + 3] = ops[i + 3];//当前属性单位	
							prop[i + 2] = n;//压入当前属性的属性名
						} else {
							b = arr;
							prop[i + 2] = "&";
							prop[i + 3] = n;
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
						
						prop[i] = b;//压入当前属性的初始值
						prop[i + 1] = c;//压入当前属性的变化值
					} else {//颜色属性
						arr = [],//RGB三种颜色的初始值(b1,b2,b3)和变化值(c1,c2,c3)
 						rgb1 = this.color10(this.getStyle(ops[i], e)),//十进制RGB初始颜色
 						rgb2 = this.color10(ops[i + 1]);//十进制RGB最终颜色
						for (n = 0; n < 3; n++) {
							arr[n] = rgb1[n] * 1;
							arr[n + 3] = rgb2[n] * 1 - arr[n];
						}
						
						color[j] = arr;//压入颜色属性的变化数组
						color[j + 1] = ops[i];//表示为颜色属性名
						j += 2;
					}
				}
				
				props[m] = prop;
				colors[m] = color;
			}
			
			return [props, colors];
		},
		
		/**
		 * 启动动画时钟
		 * 
		 * @param {mojo} ths  当前mojo对象
		 * @param {Array} arr 动画需要的信息
		 */	
		timer : function(ths, arr) { 
			var joo = this,  
				t = 0,
				start = new Date().valueOf(), 
				tid = setInterval(function() { 
					var i = 0,
						ems = ths.ems,
						len = ems.length,
						props = arr[0],
						colors = arr[1],
						dur = arr[2],
						fn = arr[3],
						twn = arr[4],
						end = new Date().valueOf();
					
					t += end - start;	
					
					if (t > dur) {
						t = dur;
						for (; i < len; i++) {
							joo.timerFn(ems[i], props[i], colors[i], dur, twn, t);
						}
						
						if(ths.animQue.length){
							arr = ths.animQue.shift();
							i = joo.stepInfo(arr[0], arr[1]);
							arr[0] = i[0];
							arr[1] = i[1];
							t = 0;
						} else {
							window.clearInterval(tid);
							ths.tid = 0;
						}
						
						if (fn) {
							fn.call(ths);
						}
													
						return;
					}
					
					for (; i < len; i++) {
						joo.timerFn(ems[i], props[i], colors[i], dur, twn, t);
					}
					
					start = end;
				}, 13);
			
			return tid;
		},
		
		/**
		 * HTMLElement元素每一格动画设置
		 * 
		 * @param {HTMLElement} e 动画元素
		 * @param {Array} prop	  属性变化数组	
		 * @param {Array} color	  颜色变化数组		
		 * @param {Number} dur    动画完成时间
		 * @param {Funtion} twn   动画缓冲算法
		 * @param {Number} t      当前动画时间
		 */
		timerFn: function(e, prop, color, dur, twn, t) {
			var sty = [], 
				re = /[A-Z]/g,
				j = 2,
				i, n, m, len, cor;

			for (i = 0, len = prop.length; i < len; i += 4) { 
				n = prop[i + 2];
				if (n === "opacity") {
					this.setStyle(n, e, twn(t, prop[i], prop[i + 1], dur));
				} else if (n === "&") {
					e[prop[i + 3]] = twn(t, prop[i], prop[i + 1], dur);
				} else {
					sty[j++] = n.replace(re, "-$&");
					sty[j++] = ":";
					sty[j++] = twn(t, prop[i], prop[i + 1], dur);
					sty[j++] = prop[i + 3];
					sty[j++] = ";";
				}
			}
			
			for (i = 0, len = color.length; i < len; i += 2) {
				cor = color[i];
				for (n = 0; n < 3; n++) {
					m = Math.ceil(twn(t, cor[n], cor[n + 3], dur)).toString(16);
					cor[n + 6] = m.length === 1 ? "0" + m : m;
				}
				sty[j++] = color[i + 1].replace(re, "-$&");
				sty[j++] = ":#";
				sty[j++] = cor[6];
				sty[j++] = cor[7];
				sty[j++] = cor[8];
				sty[j++] = ";"					
			}	
			
			if (sty.length) {
				sty[0] = e.style.cssText;
				sty[1] = ";";
				e.style.cssText = sty.join("");
			}
		},
		
		/**
		 * 转换颜色为十进制值
		 * color10(String)
		 */
		color10: function(color) {
			var rgb = [], 
				i = 0, 
				pInt = parseInt;
				
			if (color.length === 7) {//#000000格式				
				for (; i < 3; i++) {
					rgb[i] = pInt(color.substring(2 * i + 1, 2 * i + 3), 16);
				}
			} else if (color.length === 4) {//#000格式
				color = color.replace(/\w{3}/, "$&$&");
				for (; i < 3; i++) {
					rgb[i] = pInt(color.substring(2 * i + 1, 2 * i + 3), 16);
				}
			} else {//rgb(0,0,0)格式
				if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
					color = "rgb(255,255,255)";
				}
				rgb = color.match(/\d+/g).toString().split(",");
			}
			
			return rgb;
		}
	};

	
	/**
	 * css 选择器
	 */
	mojoCss = {
		
		/**
		 * 根据选择器和上下文,获得HTMLElement数组
		 * 
		 * @param {String} selector 选择器
		 * @param {Undefined/String/HTMLElement/Array} context 选择器上下文
		 * 
		 * get(String)
		 * get(String, String)
		 * get(String, HTMLElement)
		 * get(String, Array)
		 */
		get : function(selector, context) {
			var selectors, contexts, rules,
				results = [],
				i, j, n, m;
				
			switch (typeof context) {
				case "undefined" :
					context = [document];
					break;
				
				case "string" :	
					context = this.get(context, [document]);
					break;
				
				case "object" :
					context = [context];
					break;
				
				//数组形式
				default :
				  	context = context;		
			}
				
			selectors = selector.replace(/^\s+|\s+$/g, "")      //去除前后空格
								.replace(/ *([ +>~]) */g, "$1") //去除多余空格
								.split(",");
				
			//逗号分隔的选择器
			for (i = 0, j = selectors.length; i < j; i++) {
				//选择器按照4种规则分开存放到数组
				selector = selectors[i].split(/ |\+|>|~/);
				
				//存放4种规则的数组,这个数组比selector长度小1
				rules = selectors[i].match(/ |\+|>|~/g);
				
				contexts = this.parse(selector[0], context, " ");			
				
				//没有4种规则的情况
				// rules !== null
				if (rules) {
					//每次解析后的HTMLElement数组,作为下一次解析的上下文
					for (n = 0, m = rules.length; n < m; n++) {
						contexts = this.parse(selector[n + 1], contexts, rules[n]);
					}
				}
				
				//连接逗号分隔选择器的结果
				results = results.concat(contexts);
			}
			
			return results;			
		},
		
		/**
		 * 解析选择器
		 * 
		 * @param {String} selector 选择器
		 * @param {Array} contexts  上下文
		 * @param {String} rule     规则
		 */
		parse : function(selector, contexts, rule) {
			var e, tag, cls, arr, attrs;
			
			//处理选择器为id的情况
			if (selector.charAt(0) === "#") {
				e = document.getElementById(selector.substring(1));
				if (e) {
					return [e];
				}
				
			} else { 
				/([a-zA-Z\*]*)([^\[:]*)/.test(selector);
				
				//HTML标签
				tag = RegExp.$1;
				
				//class属性
				cls = RegExp.$2;
				
				//伪类和属性选择字符串
				selector = RegExp["$'"];

				arr = this.rules[rule].call(this, tag || "*", cls, contexts);
				
				return arr;
			}			
			
		},
		
		rules : {
			/**
			 * 获得当前规则的HTMLElement数组
			 * 
			 * @param {String} tag  HTML标签
			 * @param {String} cls  class属性
			 * @param {Array} contexts 上下文数组
			 */
			" " : function(tag, cls, contexts){
				var nodes, len, e, i,
					arr = [],
					m = contexts.length,
					n = j = 0;		
					
					//处理class属性选择器
					//示例形式: [.cls], [div.cls], [div.cls1.cls2]...
					if(cls) {
						for (; n < m; n++) {
							nodes = contexts[n].getElementsByTagName(tag);
							for (i = 0, len = nodes.length; i < len; i++) {
								e = nodes[i];
								if (this.hasClass(e, cls)) {
									arr[j++] = e;
								}
							}
						}
					
					//处理html标签选择器
					} else {
						for (; n < m; n++) {
							nodes = contexts[n].getElementsByTagName(tag);
							for (i = 0, len = nodes.length; i < len; i++) {
								arr[j++] = nodes[i];
							}
						}
						
					}
					
					//当contexts不只一个元素的时候,就可能存在重复元素
					if(m > 1) {
						this.makeDiff(arr);
					}
						
					return arr;	
			},
			
			/**
			 * 获得当前规则的HTMLElement数组
			 * 
			 * @param {String} tag  HTML标签
			 * @param {String} cls  class属性
			 * @param {Array} contexts 上下文数组
			 */
			">" : function(tag, cls, contexts) {
				var nodes, len, e, i,
					arr = [],
					m = contexts.length,
					n = j = 0;
				
				//cls
				if(cls) {
					//html标签为"*"
					if (tag !== "*") {
						for (; n < m; n++) {
							nodes = contexts[n].childNodes;
							for (i = 0, len = nodes.length; i < len; i++) {
								e = nodes[i];
								if (e.nodeType === 1 
										&& e.nodeName.toLowerCase() === tag.toLowerCase() 
											&& this.hasClass(e, cls)) {
									arr[j++] = e;
								}
							}
						}
									
					} else {
						for (; n < m; n++) {
							nodes = contexts[n].childNodes;
							for (i = 0, len = nodes.length; i < len; i++) {
								e = nodes[i];
								if (e.nodeType === 1 && this.hasClass(e, cls)) {
									arr[j++] = e;
								}
							}
						}
								
					}
				
				//tag	
				} else {
					if (tag !== "*") {
						for (; n < m; n++) {
							nodes = contexts[n].childNodes;
							for (i = 0, len = nodes.length; i < len; i++) {
								e = nodes[i];
								if (e.nodeType === 1 
										&& e.nodeName.toLowerCase() === tag.toLowerCase()) {
									arr[j++] = e;
								}
							}
						}
									
					} else {
						for (; n < m; n++) {
							nodes = contexts[n].childNodes;
							for (i = 0, len = nodes.length; i < len; i++) {
								e = nodes[i];
								if (e.nodeType === 1) {
									arr[j++] = e;
								}
							}
						}
								
					}
					
				}
				
				return arr;
			},

			/**
			 * 获得当前规则的HTMLElement数组
			 * 
			 * @param {String} tag  HTML标签
			 * @param {String} cls  class属性
			 * @param {Array} contexts 上下文数组
			 */			
			"+" : function(tag, cls, contexts) {
				var len, e,
					arr = [],
					m = contexts.length,
					n = j = 0;		
				
				//class
				if (cls) {
					if (tag !== "*") {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1) {
									if (e.nodeName.toLowerCase() === tag.toLowerCase() 
											&& this.hasClass(e, cls)) {
										arr[j++] = e;
									}
									break;
								}
								e = e.nextSibling;
							}
						}
						
					} else {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1) {
									if (this.hasClass(e, cls)) {
										arr[j++] = e;
									}
									break;
								}
								e = e.nextSibling;
							}
						}
						
					}
									
				//tag
				} else {
					if (tag !== "*") {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1) {
									if (e.nodeName.toLowerCase() === tag.toLowerCase()) {
										arr[j++] = e;
									}
									break;
								}
								e = e.nextSibling;
							}
						}
						
					} else {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1) {
									arr[j++] = e;
									break;
								}
								e = e.nextSibling;
							}
						}
						
					}
										
				}		
				
				return arr;
			},

			/**
			 * 获得当前规则的HTMLElement数组
			 * 
			 * @param {String} tag  HTML标签
			 * @param {String} cls  class属性
			 * @param {Array} contexts 上下文数组
			 */				
			"~": function(tag, cls, contexts) {
				var len, e,
					arr = [],
					m = contexts.length,
					n = j = 0;		
				
				//class
				if (cls) {
					if (tag !== "*") {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1
										&& e.nodeName.toLowerCase() === tag.toLowerCase() 
											&& this.hasClass(e, cls)) {
									arr[j++] = e;
								}
								e = e.nextSibling;
							}
						}
						
					} else {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1 && this.hasClass(e, cls)) {
										arr[j++] = e;
								}
								e = e.nextSibling;
							}
						}
						
					}
									
				//tag
				} else {
					if (tag !== "*") {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1 
										&& e.nodeName.toLowerCase() === tag.toLowerCase()) {
									arr[j++] = e;
								}
								e = e.nextSibling;
							}
						}
						
					} else {
						for (; n < m; n++) {
							e = contexts[n].nextSibling;
							while (e) {
								if (e.nodeType === 1) {
									arr[j++] = e;
								}
								e = e.nextSibling;
							}
						}
						
					}
										
				}		
				
				if(m > 1) {
					this.makeDiff(arr);
				}
				
				return arr;			
			}
		},
		
		/**
		 * 判断是否含有class属性值
		 * 
		 * @param {HTMLElement} e
		 * @param {String} cls
		 */ 
		hasClass : function(e, cls) {
			var clsName = e.className,
				i, len;
			
			cls = cls.split(".");
			for(i = 1, len = cls.length; i < len; i++) {
				if(clsName.indexOf(cls[i]) === -1) {
					return false;
				}
			}
			
			return true;
		},
		
		/**
		 * 去除重复数组中的HTMLElment元素
		 * 
		 * @param {Array} arr
		 */
		makeDiff : function(arr) {
			var i, len, e,
				j = 0,
				tempArr = [];
			
			for (i = 0, len = arr.length; i < len; i++) {
				e = arr[i];
				if(!e.mojoDiff) {
					tempArr[j++] = e;
					e.mojoDiff = true;
				}	
			}	
			
			arr.length = len = 0;
			
			for (i = 0; i < j; i++) {
				e = tempArr[i];
				delete e.mojoDiff;
				arr[len++] = e;
		    }
			
		}
		
	};
	 
})(window);
