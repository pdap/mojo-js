/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-11-11
 * Nightly Builds
 */
(function(window){
	
	var 
		document = window.document,
		
		// 标识计数器
		cacheCount = 0,
		
		mojoQuery = {
			toString : Object.prototype.toString,
			
			/**
			 * 根据选择器和上下文,获得HTMLElement数组
			 * 
			 * @param {String}                             selector  选择器
			 * @param {Undefined/String/HTMLElement/Array} context   选择器上下文
			 */
			get : function(selector, context) {
				var 
					results = [], 
					params  = [],
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
						// HTMLElement形式
						if (this.toString.call(context) !== "[object Array]") {
							contexts = [context];
						} else {
							// 数组形式
							contexts = context;
						}
				}				
									 
				selectors = selector 
							// 去除前后空格
							.replace(/^\s+|\s+$/g, "") 
							// 去除多余空格
							.replace(/ +([ +>~]) +/g, "$1")
							// 去除伪类参数
							.replace(/\([^()]+\)/g, function(match){
								return "(" + (params.push(match.replace(/[()]/g, "")) - 1) + ")";
							})
							.split(","); 
				
				context = contexts;
							
				// 逗号分隔的选择器
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					// 存放基本规则的数组
					rules = (" " + selector).match(/[ +>~]/g);
										
					// 选择器基本规则分开存放到数组
					selector = selector.match(/[^ +>~]+/g);
					
					// 以基本规则开始的选择器,如: [+div]
					if(rules.length > selector.length) {
						rules.shift();
					}
					
					contexts = context;
					
					// 每次解析后的HTMLElement数组,作为下一次解析的上下文
					for (n = 0, m = rules.length; n < m; n++) { 
						contexts = joQuery.parse(selector[n], contexts, rules[n], params);
					}
				
					// 连接逗号分隔选择器的结果
					results = results.concat(contexts);
				}
				
				if(j > 1) {
					joQuery.makeDiff(results);
				}
				
				return results;
			}
		},
		
		// 辅助对象
		joQuery = {
		   /**
		 	* 解析选择器
		 	* 
		 	* @param {String} selector  选择器
		 	* @param {Array}  contexts  上下文
		 	* @param {String} rule      规则
		 	* @param {Array}  params    伪类参数
		 	*/
			parse: function(selector, contexts, rule, params){
				var 
					el, tag, cls, arr, attrs, pseudos;
				
				// 处理选择器为id的情况
				if (/#(.+)/.test(selector)) {
					el = document.getElementById(RegExp.$1);
					if (el) {
						return [el];
					}
					
					return [];
					
				// 复杂情况	
				} else {
					/([a-zA-Z*]*)([^\[:]*)/.test(selector);
					
					// HTML tag
					tag = RegExp.$1;
					
					// class
					cls = RegExp.$2;
					
					// 伪类和属性选择字符串
					// IE6,7不支持class属性需要className
					selector = RegExp["$'"].replace(/class/g, "className");
					
					// 获得属性规则数组
					if(attrs = selector.match(/[^\[]+(?=\])/g)) {
						attrs = this.getAttrRules(attrs);
					}					
					
					// 获得伪类规则数组
					pseudos = selector.split(":");
					pseudos.shift();
					if(pseudos.length) {
						pseudos = this.getPseudoRules(pseudos, params);
					} else {
						pseudos = null;
					}
					
					arr = this.baseRules[rule](tag || "*", cls, contexts, attrs, pseudos);
					
					return arr;
				}
			},
			
			/**
			 * 解析属性规则
			 * 
			 * @param  {Array} attrs 属性数组
			 * @return {Array} arr   属性规则数组 
			 */
			getAttrRules : function(attrs) {
				var
					arr = [],
					len = attrs.length,
					i   = 0,
					j   = 0,
					attr, rule;
				
				for(; i < len; i++) {
					attr = attrs[i];
					//规则
					rule = (attr.match(/=|!=|\^=|\$=|\*=/g) || [" "])[0];
					//属性名值对
					attr = attr.split(/=|!=|\^=|\$=|\*=/);					
					
					arr[j++] = rule;
					arr[j++] = attr;					
				}	
				
				return arr;
			},		
			
			/**
			 * 解析伪类规则
			 * 
			 * @param {Array} pseudos
			 * @param {Array} params
			 */
			getPseudoRules : function(pseudos, params) {
				var 
					arr = [],
					i   = 0,
					j   = 0,
					len = pseudos.length,
					name, param, count;
				
				for(; i < len; i++) {
					name = pseudos[i];
					if(/\((.+)\)/.test(name)) {
						//伪类参数
						param = params[RegExp.$1];
						name  = RegExp["$`"];
						
						if(name === "nth-child") { 
							count = ++cacheCount;

							if(/(-?\d*)n([+-]?\d*)/.test(param === "odd"  && "2n+1" || 
														 param === "even" && "2n"   || param)) {
								param = RegExp.$1;
								param === ""  ? param =  1 :
								param === "-" ? param = -1 :
								param = RegExp.$1 * 1;
								
								param = [count, "n", param, RegExp.$2 * 1];
							} else {
								param = [count, param];
							} 
						}
					}
					
					arr[j++] = this.pseudos[name];
					arr[j++] = param;
				}	

				return arr;
			},				

		   /**
		 	* 去除数组中重复的HTMLElment元素
		 	* 
		 	* @param {Array} arr
		 	*/
			makeDiff : function(arr){
				var 
					count = ++cacheCount,
					len   = arr.length, 
					temp  = [], 
					i     = 0, 
					j     = 0, 
					el;
				
				for (; i < len; i++) {
					el = arr[i];
					if (el.mojoQueryCacheCount !== count) {
						temp[j++] = el;
						el.mojoQueryCacheCount = count;
					}
				}
				
				arr.length = len = 0;
				
				for (i = 0; i < j; i++) {
					el = temp[i];
					arr[len++] = el;
				}
			},
			
			// 基本规则
			baseRules : {
			   /**
	 			* 获得当前规则的HTMLElement数组
	 			*
	 			* @param {String} tag        HTML标签
	 			* @param {String} cls        class属性
			  	* @param {Array}  contexts   上下文数组
			  	* @param {Array}  attrs      属性数组
			  	* @param {Array}  pseudos    伪类数组
	 			*/				
				" " : function(tag, cls, contexts, attrs, pseudos) {
					var 
						count = ++cacheCount,
						arr   = [],
						n     = 0,
						j     = 0,
						m     = contexts.length,
						nodes, len, el, i, pel;			
					
					// 按文档顺序排序
					contexts.sort(this.sortEl);
					
					for(; n < m; n++) {
						el  = contexts[n];
						if((pel = el.parentNode) && pel.mojoQueryCacheCount === count) {
							continue;
						}
						
						el.mojoQueryCacheCount = count;
						
						nodes = el.getElementsByTagName(tag);	
						for(i = 0, len = nodes.length; i < len; i++) {
							el = nodes[i];
							if(tag === "*" && el.nodeType !== 1) {
								continue;
							} 
							if(this.filterEl(el, tag, cls, attrs, pseudos)) {
								arr[j++] = el;
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
			  	* @param {Array}  attrs     属性数组
			  	* @param {Array}  pseudos   伪类数组
	 			*/				
				">" : function(tag, cls, contexts, attrs, pseudos) {
					var 
						arr = [], 
						n   = 0,
						j   = 0,
						m   = contexts.length,
						el;			
					
					for(; n < m; n++) {
						el = contexts[n].firstChild;	
						while(el) {
							if(el.nodeType === 1 && this.filterEl(el, tag, cls, attrs, pseudos)) {
								arr[j++] = el;
							}
							el = el.nextSibling;							
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
			  	* @param {Array}  attrs     属性数组
			  	* @param {Array}  pseudos   伪类数组
	 			*/					
				"+" : function(tag, cls, contexts, attrs, pseudos) {
					var 
						arr = [], 
						n   = 0,
						j   = 0,
						m   = contexts.length,
						el;	
						
					for (; n < m; n++) {
						el = contexts[n];
						while(el = el.nextSibling) {
							if(el.nodeType === 1) {
								if(this.filterEl(el, tag, cls, attrs, pseudos)) {
									arr[j++] = el;
								}
								break;
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
			  	* @param {Array}  attrs      属性数组
			  	* @param {Array}  pseudos    伪类数组
	 			*/					
				"~" : function(tag, cls, contexts, attrs, pseudos) {
					var 
						count = ++cacheCount,
						arr   = [], 
						n     = 0,
						j     = 0,
						m     = contexts.length,
						el, pel;
					
					// 按文档顺序排序
					contexts.sort(this.sortEl);
					
					for (; n < m; n++) {
						el = contexts[n];
						if ((pel = el.parentNode) && pel.mojoQueryCacheCount === count) {
							continue;
						}
						
						while(el = el.nextSibling) {
							if (el.nodeType === 1 && this.filterEl(el, tag, cls, attrs, pseudos)) {
								arr[j++] = el;
							}
						}
						
						pel.mojoQueryCacheCount = count;
					}
							
					return arr;											
				},
				
				/**
				 * 过滤HTMLElement
				 * 
				 * @param {HTMLElement} el
				 * @param {String}      tag
				 * @param {String}      cls
				 * @param {Array}       attrs
				 * @param {Array}       pseudos
				 */
				filterEl: function(el, tag, cls, attrs, pseudos){
					if (tag !== "*" && el.nodeName.toLowerCase() !== tag) {
						return false;
					}
					
					if (cls && !this.hasClass(el, cls)) {
						return false;
					}
					
					if (attrs && !this.isAttr(el, attrs)) {
						return false;
					}
					
					if (pseudos && !this.isPseudo(el, pseudos)) {
						return false;
					}
					
					return true;
				},
				
				/**
				 * 判断el是否符合伪类规则
				 * 
				 * @param {HTMLElement} el
				 * @param {Array}       pseudos
				 */
				isPseudo : function(el, pseudos) {
					var
						len = pseudos.length,
						i   = 0,
						pseudo,param;

					for(; i < len; i++) {
						pseudo = pseudos[i];
						param  = pseudos[i + 1];
						
						return pseudo(el, param);
					}	
					
					return true;
				},
				
				/**
				 * 判断el是否符合属性规则
				 * 
				 * @param {HTMLElement} el
				 * @param {Array}       attrs
				 */
				isAttr : function(el, attrs) {
					var 
						len = attrs.length,
						i   = 0,
						attr, rule, val;
					
					for(; i < len; i += 2) {
						rule = attrs[i];
						attr = attrs[i + 1];
						//计算元素的属性值,并转换成字符串
						val  = String(el[attr[0]] || el.getAttribute(attr[0]) || "");	
						
						switch(rule) {
							case " ": 
								if(!val) {
									return false;
								}
								break;
								
							case "=":
								if(val !== attr[1]) {
									return false;
								}	
								break;
								
							case "^=":
								if(!new RegExp("^" + attr[1]).test(val)) {
									return false;
								}	
								break;
							
							case "$=":
								if(!new RegExp(attr[1] + "$").test(val)) {
									return false;
								}	
								break;
							
							case "*=":
								if(val.indexOf(attr[1]) === -1) {
									return false;
								}	
						}									
					}			
					
					return true;		
				},
				
		   		/**
		 		 * 判断是否含有class属性值
		 		 * 
		 	     * @param {HTMLElement} el
		 	     * @param {String}      cls
		 	     */ 
			    hasClass: function(el, cls){
					var 
						clsName = el.className.replace(/^\s+|\s+$/g, ""),
						re;
					
					if(clsName) {
						re = new RegExp(clsName.replace(/ +/g, "|"), "gi");
						if(/^\.+$/.test(cls.replace(re, ""))) {
							return true;
						}
					} 
					
					return false;
				},
		   		
				/**
				 * 按照文档顺序排序el
				 */
				sortEl : (function(){
					if("sourceIndex" in document.documentElement) {
						return function(a, b) {
							return a.sourceIndex - b.sourceIndex;
						};
					} else {
						return function(a, b) {
							if(a === b) {
								return 0;
							}
							return a.compareDocumentPosition(b) & 4 ? -1 : 1;
						};
					}
				})()				
			},
			
			// 伪类规则
			pseudos : {
				"first-child" : function(el) {
					while (el = el.previousSibling)	 {
						if (el.nodeType === 1) { 
							return false; 
						}
					}
					
					return true;
				},
				
				"last-child" : function(el) {
					while (el = el.nextSibling)	 {
						if (el.nodeType === 1) { 
							return false; 
						}
					}
					
					return true;					
				},
				
				"only-child" : function(el) {
					var	
						next = el.nextSibling,
						pre  = el.previousSibling;
					
					while(next) {
						if(next.nodeType === 1) {
							return false;
						}
						next = next.nextSibling;
					}	
					
					while(pre) {
						if(pre.nodeType === 1) {
							return false;
						}
						pre = pre.previousSibling;
					}			
					
					return true;		
				},
				
				"nth-child" : function(el, param) {
					var
					    pel, index, node, i;
					
					if ((pel = el.parentNode) && pel.mojoQueryCacheCount !== param[0]) { 
						node = pel.firstChild;
						i = 0;
						while (node) {
							if (node.nodeType === 1) {
								node.mojoQueryNodeIndex = ++i;
							}
							node = node.nextSibling
						}
						pel.mojoQueryCacheCount = param[0];
					}
						
					index = el.mojoQueryNodeIndex;
					
					if (param[1] === "n") {
						index = index - param[3];
						param = param[2];
						return index * param >= 0 && index % param === 0;
					}
					
					return index === param[2];
				}
			}													
		};
		
		// mojoQuery注册到window
		window.mojoQuery = mojoQuery;
})(window);	