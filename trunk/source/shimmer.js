	/**
 	 * Copyright (c) 2009 scott.cgi
 	 * http://mojo-js.appspot.com
 	 * under MIT License
 	 * Since  2009-11-11
 	 * Nightly Builds
 	 */
	shimmer = {
		
		select : function(selector, context) {
			var selectors = selector.replace(/ *([ +>~]) */g,"$1") //去除多余空格
									.replace(/^\s+|\s+$/g,"")	  //去除前后空格
									.split(","),                  
				results = [],
				contexts, rules, 
				i, j, n, m;
				
			//逗号分隔有效选择器
			for (i = 0, j = selectors.length; i < j; i++) {
				//选择器按照4大规则分开存放到数组
				selector = selectors[i].split(/ |\+|>|~/);
				//存放4大规则的数组,这个数组比arr1长度小1
				rules = selectors[i].match(/ |\+|>|~/g);
				
				contexts = this.parse(selector[0], context, " ");			
				
				if (rules !== null) {
					for (n = 0, m = rules.length; n < m; n++) {
						contexts = this.parse(selector[n + 1], contexts, rules[n]);
					}
				}
				
				results = results.concat(contexts);
			}
			
			return results;			
		},
		
		parse : function(selector, contexts, rule) {
			var e, tag, cls;
			
			//id
			if (selector.charAt(0) === "#") {
				e = document.getElementById(selector.substring(1));
				if (e) {
					return [e];
				}
				
			} else { 
				/([a-zA-Z\*]*)([^\[:]*)/.test(selector);
				tag = RegExp.$1;
				cls = RegExp.$2;
				//伪类和属性选择字符串
				selector = RegExp["$'"];
				
				return this.rules[rule].call(this, tag || "*", cls, contexts);
			}			
			
		},
		
		rules : {
			/**
			 * 获得当前规则的HTMLElement数组
			 * 
			 * @param {String} tag  HTML tag
			 * @param {String} cls  class属性值
			 * @param {Array} contexts HTMLElement数组
			 */
			" " : function(tag, cls, contexts){
				var nodes, len, e, m, i,
					arr = [],
					n = j = 0;		
					
					//class
					if(cls) {
						for (m = contexts.length; n < m; n++) {
							nodes = contexts[n].getElementsByTagName(tag);
							for (i = 0, len = nodes.length; i < len; i++) {
								e = nodes[i];
								if (this.hasClass(e, cls)) {
									arr[j++] = e;
								}
							}
						}
					
					//tag
					} else {
						for (m = contexts.length; n < m; n++) {
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
			
			">" : function(tag, cls, contexts) {
				var nodes, len, e, m, i,
					arr = [],
					n = j = 0;
				
				//cls
				if(cls) {
					if (tag !== "*") {
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
			
			"+" : function(tag, cls, contexts) {
				var len, e, m,
					arr = [],
					n = j = 0;		
				
				//class
				if (cls) {
					if (tag !== "*") {
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
			
			"~": function(tag, cls, contexts) {
				var len, e, m,
					arr = [],
					n = j = 0;		
				
				//class
				if (cls) {
					if (tag !== "*") {
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
						for (m = contexts.length; n < m; n++) {
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
					mojoDiff = true;
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