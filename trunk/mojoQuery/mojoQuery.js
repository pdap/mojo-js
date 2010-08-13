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
		
		mojoQuery = {
			/**
			 * 根据选择器和上下文,获得HTMLElement数组
			 * 
			 * @param {String}                             selector  选择器
			 * @param {Undefined/String/HTMLElement/Array} context   选择器上下文
			 */
			get : function(selector, context) {
				var 
					results     = [], 
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
						// HTMLElement列表形式,包括Array或NodeList
						if (context.length) {
							contexts = context;
						} else {
							// HTMLElement形式
							contexts = [context];
						}
				}				
									 
				selectors = joQuery.trim(selector);
				
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
						contexts = joQuery.parse(selector[n], contexts, rules[n]);
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
			// HTMLElement对象标识计数器
			cacheCount : 0,
			
		   /**
		 	* 解析选择器
		 	* 
		 	* @param {String} selector      选择器
		 	* @param {Array}  contexts      上下文
		 	* @param {String} rule          规则
		 	*/
			parse: function(selector, contexts, rule){
				var 
					arr, id;
				
				arr = this.getRules(selector);
				
				// 选择器为 id
				if (id = arr[1]) { 
					if (id = document.getElementById(id.substring(1))) {
						return [id];
					}
					
					return [];
				}
				
				arr = this.baseRules[rule].call(this, contexts, arr[2] || "*", arr[3], arr[4], arr[5]);
				
				return arr;
			},
			
			/**
			 * 预处理选择器
			 * 
			 * @param  {String} selector
			 * @return {String} selectors
			 */
			trim: function(selector){
				var 
					pseuParams = [],
					attrParams = [];
				
				this.pseuParams = pseuParams;
				this.attrParams = attrParams;
				
				selector = selector
								// 去除前后空格
								.replace(/^ +| +$/g, "")	
						
								// 去除多余空格
								.replace(/ +([ +>~]) +/g, "$1")	
								
								// 去除属性参数
								.replace(/[^\[]+(?=\])/g, function(match){
									return attrParams.push(match) - 1;
								});
				
				// 去除伪类参数
				while(selector.indexOf("(") !== -1) {
					selector = selector.replace(/\([^()]+\)/g, function(match){
						return "-param-" + (pseuParams.push(match.substring(1, match.length - 1)) - 1);
					});
				}
				
				return selector.split(",");					
			},
			
			/**
			 * 解析获得分类选择器
			 * 
			 * @param  {String} selector
			 * @return {Array}  rules
			 */
			getRules : function(selector) {
				var	
					rules, attrs, pseudos; 
					
				rules = /((?:#.+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?:\:.+[^:])*)/.exec(selector);
				
				// 获得属性规则数组
				if (attrs = rules[4]) {
					rules[4] = this.getAttrRules(attrs.match(/[^\[]+(?=\])/g), this.attrParams);
				}
				
				// 获得伪类规则数组
				if (pseudos = rules[5]) {
					(pseudos  = pseudos.split(":")).shift();
					 rules[5] = this.getPseudoRules(pseudos, this.pseuParams);
				}				
				
				return rules;	
			},
			
			/**
			 * 解析属性规则
			 * 
			 * @param  {Array} attrs 属性数组
			 * @return {Array} arr   属性规则数组 
			 */
			getAttrRules : function(attrs, attrParams) {
				var
					arr = [],
					len = attrs.length,
					rex = /=|!=|\^=|\$=|\*=|~=|\|=/,
					i   = 0,
					j   = 0,
					attr, rule;
				
				for(; i < len; i++, j += 2) {
					attr = attrParams[attrs[i]];
					// 规则
					rule = attr.match(rex) || " ";
					// 属性名值对
					attr = attr.split(rex);					
					
					arr[j] = this.attrs[rule];
					arr[j + 1] = attr;					
				}	
				
				return arr;
			},		
			
			/**
			 * 解析伪类规则
			 * 
			 * @param {Array} pseudos
			 * @param {Array} pseuParams
			 */
			getPseudoRules : function(pseudos, pseuParams) {
				var 
					arr = [],
					i   = 0,
					j   = 0,
					len = pseudos.length,
					name, param, count;
				
				for(; i < len; i++, j += 2) {
					name = pseudos[i];
					if(/-param-(\d+)/.test(name)) {
						//伪类参数
						param = pseuParams[RegExp.$1];
						name  = RegExp["$`"];
						
						switch(name) {
							case "nth-child":
								count = ++this.cacheCount;
								
								if (/(-?\d*)n([+-]?\d*)/.test(param === "odd" && "2n+1" ||
															  param === "even" && "2n"  || param)) {
									param = RegExp.$1;
									param === "" ? param = 1 : param === "-" ? param = -1 : param = param * 1;
									
									param = [count, "n", param, RegExp.$2 * 1];
									
									// 优化"nth:child(n)"形式
									if (param[2] === 1 && param[3] === 0) {
										continue;
									}
								} else {
									param = [count, param];
								}						
								
								break;
								
						 	case "not" :
								param = this.getRules(param);
								param = ["", param[2] || "*", param[3], param[4], param[5]];				
						}

					}
					
					arr[j] = this.pseudos[name];
					arr[j + 1] = param;
				}	

				return arr;
			},
			
			/**
			 * 判断el是否符合伪类规则
			 * 
			 * @param {HTMLElement} el
			 * @param {Array}       pseudos
			 */
			isPseudo: function(el, pseudos){
				var 
					len = pseudos.length, 
					i   = 0, 
					pseudo, param;
				
				for (; i < len; i++) {
					pseudo = pseudos[i];
					param = pseudos[i + 1];
					
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
			isAttr: function(el, attrs){
				var 
					len = attrs.length, 
					i = 0, 
					attr, rule, val, name;
				
				for (; i < len; i += 2) {
					rule = attrs[i];
					attr = attrs[i + 1];
					name = attr[0];
					
					if (!(val = el.getAttribute(name))) {
						if (!(val = el[name.replace("class", "className")])) {
							return false;
						}
					}
					
					if (!rule(String(val), attr[1])) {
						return false;
					}
				}
				
				return true;
			},	
			
			/**
			 * 过滤el
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
		 	 * 判断el是否含有class属性值
		 	 * 
		 	 * @param {HTMLElement} el
		 	 * @param {String}      cls
		 	 */ 
		    hasClass: function(el, cls){
				var 
					clsName = el.className, 
					i, len;
				
				if (clsName) {
					cls = cls.split(".");
					for (i = 1, len = cls.length; i < len; i++) {
						if (clsName.indexOf(cls[i]) === -1) {
							return false;
						}
					}
					
					return true;
				}
				
				return false;
			},										

		   /**
		 	* 去除数组中重复的HTMLElment元素
		 	* 
		 	* @param {Array} arr
		 	*/
			makeDiff : function(arr){
				var 
					count = ++this.cacheCount,
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
	 			* @param {Array}  contexts   上下文数组
	 			* @param {String} tag        HTML标签
	 			* @param {String} cls        class属性
			  	* @param {Array}  attrs      属性数组
			  	* @param {Array}  pseudos    伪类数组
	 			*/				
				" " : function(contexts, tag, cls, attrs, pseudos) {
					var 
						count = ++this.cacheCount,
						arr   = [],
						n     = 0,
						j     = 0,
						m     = contexts.length,
						nodes, len, el, i, pel;			
						
					for(; n < m; n++) {
						el  = contexts[n];
						if((pel = el.parentNode) && pel.mojoQueryCacheCount === count) {
							continue;
						}
						
						el.mojoQueryCacheCount = count;
						
						nodes = el.getElementsByTagName(tag);	
						for(i = 0, len = nodes.length; i < len; i++) {
							el = nodes[i];
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
	 			* @param {Array}  contexts   上下文数组
	 			* @param {String} tag        HTML标签
	 			* @param {String} cls        class属性
			  	* @param {Array}  attrs      属性数组
			  	* @param {Array}  pseudos    伪类数组
	 			*/				
				">" : function(contexts, tag, cls, attrs, pseudos) {
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
	 			* @param {Array}  contexts   上下文数组
	 			* @param {String} tag        HTML标签
	 			* @param {String} cls        class属性
			  	* @param {Array}  attrs      属性数组
			  	* @param {Array}  pseudos    伪类数组
	 			*/					
				"+" : function(contexts, tag, cls, attrs, pseudos) {
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
	 			* @param {Array}  contexts   上下文数组
	 			* @param {String} tag        HTML标签
	 			* @param {String} cls        class属性
			  	* @param {Array}  attrs      属性数组
			  	* @param {Array}  pseudos    伪类数组
	 			*/					
				"~" : function(contexts, tag, cls, attrs, pseudos) {
					var 
						count = ++this.cacheCount,
						arr   = [], 
						n     = 0,
						j     = 0,
						m     = contexts.length,
						el, pel;

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
				}
			},
			
			// 属性规则
			attrs : {
				" " : function() { 
					return true;
				},
				
				"=" : function(attrVal, inputVal) {
					return attrVal === inputVal;
				},
				
				"!=" : function(attrVal, inputVal) {
					return attrVal.indexOf(inputVal) === -1;
				},
				
				"^=" : function(attrVal, inputVal) {
					return new RegExp("^" + inputVal).test(attrVal);
				},
				
				"$=" : function(attrVal, inputVal) {
					return new RegExp(inputVal + "$").test(attrVal)
				},
				
				"*=" : function(attrVal, inputVal) {
					return attrVal.indexOf(inputVal) !== -1
				},
				
				"~=" : function(attrVal, inputVal) {
					return (" " + attrVal + " ").indexOf(" " + inputVal + " ") !== -1;
				},
				
				"|=" : function(attrVal, inputVal) {
					return new RegExp("^" + inputVal + "-?.*").test(attrVal);
				}
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
					
					return index === param[1] * 1;
				},
				
				not : function(el, param) {
					param[0] = el;
					return !joQuery.filterEl.apply(joQuery, param);	
				},
				
				enabled : function(el) {
					return !el.disabled;
				},
				
				disabled : function(el) {
					return el.disabled;
				},
				
				checked : function(el) {
					return el.checked;
				},
				
				empty : function(el){
					return !el.firstChild;
				}				
			}													
		};
		
		// mojoQuery注册到window
		window.mojoQuery = mojoQuery;
})(window);	