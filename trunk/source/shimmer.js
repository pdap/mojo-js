	/**
 	 * Copyright (c) 2009 scott.cgi
 	 * http://mojo-js.appspot.com
 	 * under MIT License
 	 * Since  2009-11-11
 	 * Nightly Builds
 	 */

(function(window, undefined){
	
	window.mojoCss = {
		
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
				// rules !=== null
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
				
				//解析出属性规则
				attrs = selector.match(/[^\[]+(?=\])/g);
				
				arr = this.rules[rule].call(this, tag || "*", cls, contexts);
				
				
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
		
		filterAttr : function(nodes, attrs) {
			var i, j;
			
			for(i = 0, j = attrs.length; i < j; i++) {
				
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