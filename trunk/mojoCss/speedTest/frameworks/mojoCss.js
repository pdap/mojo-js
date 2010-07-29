/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-11-11
 * Nightly Builds
 */
(function(window){
	
	var 
		toString = Object.prototype.toString,
		document = window.document,
		mojoCss  = {
		
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
			get: function(selector, context){
				var 
					results = [], 
					selectors, contexts, rules, 
					i, j, n, m;
				
				switch (typeof context) {
					case "undefined":
						contexts = [document];
						break;
						
					case "string":
						contexts = this.get(context, [document]);
						break;
						
					case "object":
						//HTMLElement形式
						if(toString.call(context) !== "[object Array]") {
							contexts = [context];
							break;
						}
						//数组形式
						contexts = context;
				}
				
				selectors = selector.replace(/^\s+|\s+$/g, "") //去除前后空格
									.replace(/ *([ +>~]) */g, "$1") //去除多余空格
									.split(",");
				
				//逗号分隔的选择器
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					//存放4种规则的数组
					rules = (" " + selector).replace(/\(.*\)/,"").match(/[ +>~]/g);
										
					//选择器按照4种规则分开存放到数组
					//匹配排除了伪类括号里的基本规则
					selector = selector.match(/(?:\(.*[ +>~].*|[^ +>~])+/g);
					
					//以规则开始的选择器,示例: [+div]
					if(rules.length > selector.length) {
						rules.shift();
					}
					
					//每次解析后的HTMLElement数组,作为下一次解析的上下文
					for (n = 0, m = rules.length; n < m; n++) {
						contexts = this.parse(selector[n], contexts, rules[n]);
					}
				
					//连接逗号分隔选择器的结果
					results = results.concat(contexts);
				}
				
				if(j > 1) {
					this.rules.makeDiff(results);
				}
				
				return results;
			},
		
		   /**
		 	* 解析选择器
		 	* 
		 	* @param {String} selector  选择器
		 	* @param {Array}  contexts  上下文
		 	* @param {String} rule      规则
		 	*/
			parse: function(selector, contexts, rule){
				var 
					el, tag, cls, arr, attrs, pseudos;
				
				//处理选择器为id的情况
				if (selector.charAt(0) === "#") {
					el = document.getElementById(selector.substring(1));
					if (el) {
						return [el];
					}
					
					return [];
				//复杂情况	
				} else {
					/([a-zA-Z*]*)([^\[:]*)/.test(selector);
					
					//HTML标签
					tag = RegExp.$1;
					
					//class属性
					cls = RegExp.$2;
					
					//伪类和属性选择字符串
					selector = RegExp["$'"];
					
					arr = this.rules[rule](tag || "*", cls, contexts);
					
					//过滤属性
					attrs = selector.match(/[^\[]+(?=\])/g);
					if(attrs) {
						arr = this.filterAttr(arr, attrs);
					}
					
					//过滤伪类
					pseudos = selector.split(":");
					pseudos.shift();
					if(pseudos.length) {
						arr = this.filterPseudo(arr, pseudos);
					}
					
					return arr;
				}
				
			},
			
			//基本规则解析
			rules: {
			   /**
	 			* 获得当前规则的HTMLElement数组
	 			*
	 			* @param {String} tag       HTML标签
	 			* @param {String} cls       class属性
			  	* @param {Array}  contexts  上下文数组
	 			*/
				" ": function(tag, cls, contexts){ 
					var 
						arr = [], 
						n   = 0,
						j   = 0,
						m   = contexts.length,
						nodes, len, el, i;
					
					//处理class属性选择器
					//示例形式: [.cls], [div.cls], [div.cls1.cls2]
					if (cls) {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								nodes = contexts[n].getElementsByTagName(tag);
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if (el.nodeName.toLowerCase() === tag && this.hasClass(el, cls)) {
										arr[j++] = el;
									}
								}
							}
						
						//html标签为"*"
						} else {
							for (; n < m; n++) {
								nodes = contexts[n].getElementsByTagName(tag);
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if (this.hasClass(el, cls)) {
										arr[j++] = el;
									}
								}
							}							
						}
						
					//处理html标签选择器
					} else {
						if(tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								nodes = contexts[n].getElementsByTagName(tag);
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if(el.nodeName.toLowerCase() === tag) {
										arr[j++] = el;
									}
								}
							}
													
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								nodes = contexts[n].getElementsByTagName(tag);
								for (i = 0, len = nodes.length; i < len; i++) {
									arr[j++] = nodes[i];
								}
							}							
						}
					}
					
					//当contexts不只一个元素的时候,就可能存在重复元素
					if (m > 1) {
						this.makeDiff(arr);
					}
					
					return arr;
				},
				
			   /**
	 			* 获得当前规则的HTMLElement数组
	 			*
	 			* @param {String} tag       HTML标签
		 		* @param {String} cls       class属性
	 			* @param {Array}  contexts  上下文数组
	 			*/
				">": function(tag, cls, contexts){
					var 
						arr = [], 
						n   = 0,
						j   = 0,
						m   = contexts.length,
						nodes, len, el;
					
					//处理class属性选择器
					//示例形式: [.cls], [div.cls], [div.cls1.cls2]
					if (cls) {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								nodes = contexts[n].childNodes;
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if (el.nodeType === 1 && el.nodeName.toLowerCase() === tag 
									                      && this.hasClass(el, cls)) {
										arr[j++] = el;
									}
								}
							}
						
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								nodes = contexts[n].childNodes;
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if (el.nodeType === 1 && this.hasClass(el, cls)) {
										arr[j++] = el;
									}
								}
							}
							
						}
						
					//处理html标签选择器	
					} else {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								nodes = contexts[n].childNodes;
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if (el.nodeType === 1 && el.nodeName.toLowerCase() === tag) {
										arr[j++] = el;
									}
								}
							}
						
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								nodes = contexts[n].childNodes;
								for (i = 0, len = nodes.length; i < len; i++) {
									el = nodes[i];
									if (el.nodeType === 1) {
										arr[j++] = el;
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
	 			* @param {String} tag        HTML标签
	 			* @param {String} cls        class属性
	 			* @param {Array}  contexts   上下文数组
	 			*/
				"+": function(tag, cls, contexts){
					var 
						arr = [],
						n   = 0,
						j   = 0,
						m   = contexts.length,
						len, el;
					
					//处理class属性选择器
					//示例形式: [.cls], [div.cls], [div.cls1.cls2]
					if (cls) {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1) {
										if (el.nodeName.toLowerCase() === tag &&
											this.hasClass(el, cls)) {
											arr[j++] = el;
										}
										break;
									}
									el = el.nextSibling;
								}
							}
							
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1) {
										if (this.hasClass(el, cls)) {
											arr[j++] = el;
										}
										break;
									}
									el = el.nextSibling;
								}
							}
						}
						
					//处理html标签选择器	
					} else {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1) {
										if (el.nodeName.toLowerCase() === tag) {
											arr[j++] = el;
										}
										break;
									}
									el = el.nextSibling;
								}
							}
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1) {
										arr[j++] = el;
										break;
									}
									el = el.nextSibling;
								}
							}
						}
					}
					
					return arr;
				},
				
			   /**
	 			* 获得当前规则的HTMLElement数组
	 			*
	 			* @param {String} tag       HTML标签
	 			* @param {String} cls       class属性
	 			* @param {Array}  contexts  上下文数组
	 			*/
				"~": function(tag, cls, contexts) {
					var 
						arr = [],
						n   = 0,
						j   = 0,
						m   = contexts.length,
						len, el;
					
					//处理class属性选择器
					//示例形式: [.cls], [div.cls], [div.cls1.cls2]
					if (cls) {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1 && el.nodeName.toLowerCase() === tag 
														  && this.hasClass(el, cls)) {
										arr[j++] = el;
									}
									el = el.nextSibling;
								}
							}
							
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1 && this.hasClass(el, cls)) {
										arr[j++] = el;
									}
									el = el.nextSibling;
								}
							}
						}
						
					//处理html标签选择器
					} else {
						if (tag !== "*") {
							tag = tag.toLowerCase();
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1 && el.nodeName.toLowerCase() === tag) {
										arr[j++] = el;
									}
									el = el.nextSibling;
								}
							}
						//html标签为"*"	
						} else {
							for (; n < m; n++) {
								el = contexts[n].nextSibling;
								while (el) {
									if (el.nodeType === 1) {
										arr[j++] = el;
									}
									el = el.nextSibling;
								}
							}
						}
					}
					
					if (m > 1) {
						this.makeDiff(arr);
					}
					
					return arr;
				},
				
		   		/**
		 		 * 判断是否含有class属性值
		 		 * 
		 	     * @param {HTMLElement} el
		 	     * @param {String}      cls
		 	     */ 
			    hasClass: function(el, cls){
					var 
						clsName = el.className,
						 i, len;
					
					cls = cls.split(".");
					for (i = 1, len = cls.length; i < len; i++) {
						if (clsName.indexOf(cls[i]) === -1) {
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
			    makeDiff: function(arr){
					var 
						len  = arr.length,
						temp = [],
						i    = 0, 
						j    = 0, 
						el;

					for(; i < len; i++) {
						el = arr[i];
						if(!el.mojoCssDiff) {
							temp[j++] = el;
							el.mojoCssDiff = true;
						}
					}
					
					arr.length = len = 0;
					
					for(i = 0; i < j; i++) {
						el = temp[i];
						delete el.mojoCssDiff;
						arr[len++] = el;
					}
				}
			},
			
			/**
			 * 过滤属性
			 * 
			 * @param {Array} els
			 * @param {Array} attrs
			 */
			filterAttr : function(els, attrs) {
				var 
					arr = [],
					atr = [],
					len = els.length,
					m   = attrs.length,
					i   = 0,
					j   = 0,
					n   = 0,
					el, attr, rule, val;
				
				for (; n < m; n++) {
					attr = attrs[n];
					//规则
					rule = (attr.match(/=|!=|\^=|\$=|\*=/g) || [" "])[0];
					//属性名值对
					attr = attr.split(/=|!=|\^=|\$=|\*=/);					
					
					atr[j++] = rule;
					atr[j++] = attr;
				}
				
				j = 0;
				
				for(; i < len; i++) {
					el = els[i];
					for(n = 0, m = atr.length; n < m; n += 2) {
						rule = atr[n];
						attr = atr[n + 1];
						//计算元素的属性值,并转换成字符串
						val  = String(el[attr[0]] || el.getAttribute(attr[0]) || "");	
						
						switch(rule) {
							case " ": 
								if(!val) {
									n = m + 1;
								}
								break;
								
							case "=":
								if(val !== attr[1]) {
									n = m + 1;
								}	
								break;
								
							case "^=":
								if(!new RegExp("^" + attr[1]).test(val)) {
									n = m + 1;
								}	
								break;
							
							case "$=":
								if(!new RegExp(attr[1] + "$").test(val)) {
									n = m + 1;
								}	
								break;
							
							case "*=":
								if(val.indexOf(attr[1]) === -1) {
									n = m + 1;
								}	
						}									
					}
					//循环正常结束,元素符合所有属性规则
					if(n === m) {
						arr[j++] = el;
					}
				}
				
				return arr;
			},
			
			/**
			 * 过滤伪类
			 * 
			 * @param {Array} els
			 * @param {Array} pseudos
			 */
			filterPseudo : function(els, pseudos) {
				var 
					len = pseudos.length,
					arr = [],
					i   = 0,
					param, name;
				
				for(; i < len; i++) {
					name = pseudos[i];
					if(/\((.+)\)/.test(name)) {
						//伪类参数
						param = RegExp.$1;
						name  = RegExp["$`"];
					}
					this.pseudos[name](arr, els, param);
				}	
				
				return arr;
			},
			
			//伪类规则
			pseudos : {
		    	"first-child" : function(arr, els) {
					var 
						flag = true,
						len  = els.length,
						j    = arr.length,
						i    = 0,
						el;
					
					for(; i < len; i++) {
						el  = els[i];
						do {
							el = el.previousSibling;
							if(el && el.nodeType === 1) {
								flag = false;
								break;
							}
						} while(el); 
						
						if(flag) {
							arr[j++] = els[i];
							continue;
						}
						
						flag = true;
					}
				},
				
				"last-child" : function(arr, els) {
					var 
						flag = true,
						len  = els.length,
						j    = arr.length,
						i    = 0,
						el;
					
					for(; i < len; i++) {
						el  = els[i];
						do {
							el = el.nextSibling;
							if(el && el.nodeType === 1) {
								flag = false;
								break;
							}
						} while(el); 
						
						if(flag) {
							arr[j++] = els[i];
							continue;
						}
						
						flag = true;
					}	
				},
				
				"only-child" : function(arr, els) {
					var 
						flag = true,
						len  = els.length,
						j    = arr.length,
						i    = 0,
						el, next, pre;
					
					for(; i < len; i++) {
						el = els[i];
						next = el.nextSibling;
						pre  = el.previousSibling;
						
						while(next) {
							if(next.nodeType === 1) {
								flag = false;
								break;
							}
							next = next.nextSibling;
						}
						
						while(pre) {
							if(pre.nodeType === 1) {
								flag = false;
								break;
							}
							pre = pre.previousSibling;
						}
						
						if(flag) {
							arr[j++] = el;
							continue;
						}
						
						flag = true;
					}
				},
				
				"nth-child" : function(arr, els, param) {
					var 
						len  = els.length,
						j    = arr.length,
						i    = 0,
						h    = 0,
						arrs = [],
						parent, nodes, node, 
						nodeArr, index, params,
						el, n, m, k;
					
					for(; i < len; i++) {
						el = els[i];
						
						//当前元素与上个元素不是同个父元素
						if(el.parentNode !== parent) {
							parent = el.parentNode;
							nodes = parent.childNodes;
							nodeArr = [];
							k     = 0;
							for(n = 0, m = nodes.length; n < m; n++) {
								node = nodes[n];
								if(node.nodeType === 1) {
									nodeArr[k++] = node;
									//记录该元素在父元素的子元素集合的位置从1开始
									node.mojoCssChildIndex = k;
								}
							}			
							//记录当前元素所在子元素集合数组
							arrs[h++] = nodeArr;				
						}
						
						index = el.mojoCssChildIndex;
						
						switch(param) {
							case "odd":
								if(index % 2) {
									arr[j++] = el;
								}
								break;
							
							case "even":
								if(!(index % 2)) {
									arr[j++] = el;
								}
								break;
								
							default :
								if(!params) {
									params = [
											 	/(\d*)(n\+?)(\d*)/.test(param),
												RegExp.$2,
												RegExp.$1 * 1,
												RegExp.$3 * 1
											 ];
								}
							
								if(params[0]) {
									switch(params[1]) {
										case "n":  
											if(!(index % params[2])) {
												arr[j++] = el;
											}
											break;
										
										case "n+":
											if (params[2]) {
												if (!((index - params[3]) % params[2])) {
													arr[j++] = el;
												}
											} else {
												if (index >= params[3]) {
													arr[j++] = el;
												}
											}									
									}
								} else {
									if(index === +param) {
										arr[j++] = el;
									}
								}
						}
					}	
					
					//移除mojoCssChildIndex属性
					for(j = 0; j < h; j++) {
						nodeArr = arrs[j];
						for(n = 0, m = nodeArr.length; n < m; n++) {
							el = nodeArr[n];
							if(el.mojoCssChildIndex) {
								delete el.mojoCssChildIndex;
							}
						}
					}
					
				},
				
				root : function(arr) {
					arr.length = 0;
					arr.push(document.documentElement);
				},
				
				enabled : function(arr, els) {
					var
						len = els.length,
						j 	= arr.length,
						i 	= 0,
						el;
					
					for(; i < len; i++) {
						el = els[i];
						if(!el.disabled) {
							arr[j++] = el;
						}
					}	
				},
				
				disabled : function(arr, els) {
					var
						len = els.length,
						j 	= arr.length,
						i 	= 0,
						el;
					
					for(; i < len; i++) {
						el = els[i];
						if(el.disabled) {
							arr[j++] = el;
						}
					}					
				},
				
				checked : function(arr, els) {
					var
						len = els.length,
						j 	= arr.length,
						i 	= 0,
						el;
					
					for(; i < len; i++) {
						el = els[i];
						if(el.checked) {
							arr[j++] = el;
						}
					}					
				},
				
				empty : function(arr, els) {
					var
						len = els.length,
						j 	= arr.length,
						i 	= 0,
						el;
						
					for(; i < len; i++) {
						el = els[i];
						if(!el.innerHTML) {
							arr[j++] = el;
						}
					}						
				}
			}
	};
	
	//mojoCss注册到window上
	window.mojoCss = mojoCss;
	
})(window);	