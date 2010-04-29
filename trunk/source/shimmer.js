	/**
 	 * Copyright (c) 2009 scott.cgi
 	 * http://mojo-js.appspot.com
 	 * under MIT License
 	 * Since  2009-11-11
 	 * Nightly Builds
 	 */
	shimmer = {
		
		ems : [],
		
		RE : {
			
		},
		
		select : function(selector, context) {
			var selectors = selector.toLowerCase().replace(/ *([ +>~]) */g,"$1").split(","), 
				arr1, arr2, 
				nodes,
				i, j;
				
			//逗号分隔有效选择器
			for (i = 0, j = selectors.length; i < j; i++) {
				//把选择器按照4大规则分开存放到数组
				arr1 = selectors[i].split(/ |\+|>|~/);
				//存放4大规则的数组,这个数组比arr1长度小1
				arr2 = selectors[i].match(/ |\+|>|~/g);
				
				//默认为当前上下文的后代规则
				this.parse(arr1[0], context, " ");			
				
				//没有4大规则的情况
				if (arr2 !== null) {
					
					//根据规则组装arr数组,存放既是HTMLElement
					for (var n = 0, m = arr2.length, k, l; n < m; n++) {
						nodes = this.ems;
						l = nodes.length;
						this.ems.length = 0;
						for (k = 0; k < l; k++) {
							this.parse(arr1[n + 1], nodes[k], arr2[n]);
						}
					}
				}
			}
			
			return this.ems;			
		},
		
		parse : function(selector, context, rule) {
			var arr = [],
				e, tag, cls;
			
			//id
			if (selector.charAt(0) === "#") {
				e = document.getElementById(selector.substring(1));
				if (e) {
					arr[0] = e;
				}
				
			} else { 
				/([a-zA-Z\*]*)([^\[:]*)/.test(selector);
				tag = RegExp.$1;
				cls = RegExp.$2;
				//伪类和属性选择字符串
				selector = RegExp["$'"];
				
				this.setEms(tag || "*", cls, context, rule);
			
			}			
			
		},
		
		setEms : function(tag, cls, context, rule) {
			var n, i, len, e,
				j = 0,
				arr = [];
			
			switch (rule) {
				case " ":
					n = context.getElementsByTagName(tag);
					
					//class
					if (cls) {
						for (i = 0, len = n.length; i < len; i++) {
							e = n[i];
							if (e.parentNode.nodeName !== context.nodeName || e.parentNode === context) {
								if (this.hasClass(e, cls)) {
									arr[j++] = e;
								}
							}
						}					
					
					//tag
					} else {
						for (i = 0, len = n.length; i < len; i++) {
							e = n[i];
							if (e.parentNode.nodeName !== context.nodeName || e.parentNode === context) {
								arr[j++] = e;
							}
						}						
					}
					
					
					break;
					
				case ">":
					n = context.childNodes;
					
					//class
					if (cls) {
						if (tag !== "*") {
							for (i = 0, len = n.length; i < len; i++) {
								e = n[i];
								if (e.nodeType == 1 
										&& e.nodeName === tag 
											&& this.hasClass(e, cls)) {
									arr[j++] = e;
								}
							}
						} else {
							for (i = 0, len = n.length; i < len; i++) {
								e = n[i];
								if (e.nodeType === 1 && this.hasClass(e, cls))  { 
										arr[j++] = e;
								}
							}
						}
					
					//tag
					} else {
						if (tag !== "*") {
							for (i = 0, len = n.length; i < len; i++) {
								e = n[i];
								if (e.nodeType === 1 && e.nodeName === tag) {
									arr[j++] = e;
								}
							}
						} else {
							for (i = 0, len = n.length; i < len; i++) { 
								e = n[i];
								if (e.nodeType === 1) {
									arr[j++] = n[i];
								}
							}
						}						
					}
					
					break;
					
				case "+":
					n = context.nextSibling;
					
					//class
					if (cls) {
						if (tag !== "*") {
							while (n) {
								if (n.nodeType === 1) {
									if (n.nodeName === tag 
										&& this.hasClass(n, cls)) {
										arr[0] = n;
									}
									break;
								}
								n = n.nextSibling;
							}
						} else {
							while (n) {
								if (n.nodeType === 1) {
									if (this.hasClass(n, cls)) {
										arr[0] = n;
									}
									break;
								}
								n = n.nextSibling;
							}
						}
					
					//tag
					} else {
						if (tag !== "*") {
							while (n) {
								if (n.nodeType === 1) {
									if(n.nodeName === tag) {
										arr[0] = n;
									}
									break;
								}
								n = n.nextSibling;
							}
						} else {
							while (n) {
								if (n.nodeType === 1) {
									arr[0] = n;
									break;
								}
								n = n.nextSibling;
							}
						}						
					}
					
					break;
					
				case "~":
					n = context.nextSibling;
					
					//class
					if (cls) {
						if (tag !== "*") {
							while (n) {
								if (n.nodeType === 1) {
									if (n.nodeName == tag 
											&& this.hasClass(n, cls)) {
										arr[j++] = n;
									}
									if(n.nodeName === context.nodeName) {
										break;
									}									
																		
								}
								n = n.nextSibling;
							}
						} else {
							while (n) {
								if (n.nodeType === 1) {
									if (this.hasClass(n, cls)) {
										arr[j++] = n;
									}
									if(n.nodeName === context.nodeName) {
										break;
									}									
								}
								n = n.nextSibling;
							}
						}					
					
					//tag
					} else {
						if (tag !== "*") {
							while (n) {
								if (n.nodeType === 1) {
									if(n.nodeName === tag) {
										arr[j++] = n;
									}									
									if(n.nodeName === context.nodeName) {
										break;
									}
								}
								n = n.nextSibling;
							}
						} else {
							while (n) {
								if (n.nodeType === 1) {
									arr[j++] = n;
									if(n.nodeName === context.nodeName) {
										break;
									}
								}
								n = n.nextSibling;
							}
						}						
					}
			}
			
			return arr;
		},
		
		rules : {
			" " : function(tag, cls, context){
				var nodes, len, e,
					arr = this.ems,
					i = 0,
					j = arr.length;		
					
					//当前上下文的元素重复
					if(context.nodeName === context.parentNode.nodeName &&
						context.parentNode.mojoDiff) {
						return ;		
					}		
					
					nodes = context.getElementsByTagName(tag);
					
					//class
					if(cls) {
						for(len = nodes.length; i < len; i++) {
							e = nodes[i];
							if(this.hasClass(e, cls)) {
								arr[j++] = e;
								//标记元素被选取
								e.mojoDiff = true;
							}
						}
					
					//tag
					} else {
						for(len = nodes.length; i < len; i++) {
							e = nodes[i];
							arr[j++] = e;
							//标记元素被选取
							e.mojoDiff = true;
						}
					}
			},
			
			">" : function(tag, cls, context) {
				var nodes, len, e,
					arr = this.ems,
					i = 0,
					j = arr.length;
				
				nodes = context.getElementsByTagName(tag);
				
				//cls
				if(cls) {
					if (tag !== "*") {
						for (len = n.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType == 1 
									&& e.nodeName === tag 
										&& this.hasClass(e, cls)) {
								arr[j++] = e;
								//标记元素被选取
								e.mojoDiff = true;								
							}
						}
					} else {
						for (len = n.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1 && this.hasClass(e, cls)) {
								arr[j++] = e;
								//标记元素被选取
								e.mojoDiff = true;								
							}
						}
					}					
				
				//tag	
				} else {
					if (tag !== "*") {
						for (len = n.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1 && e.nodeName === tag) {
								arr[j++] = e;
								//标记元素被选取
								e.mojoDiff = true;								
							}
						}
					} else {
						for (len = n.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1) {
								arr[j++] = n[i];
								//标记元素被选取
								e.mojoDiff = true;								
							}
						}
					}					
				}
			},
			
			"+" : function(tag, cls, context) {
				var node, e,
					arr = this.ems,
					j = arr.length;		
				
				node = context.nextSibling;
				
				//class
				if (cls) {
					if (tag !== "*") {
						while (node) {
							if (node.nodeType === 1) {
								if (node.nodeName === tag && this.hasClass(node, cls)) {
									arr[j++] = node;
								}
								break;
							}
							node = node.nextSibling;
						}
					} else {
						while (node) {
							if (node.nodeType === 1) {
								if (this.hasClass(node, cls)) {
									arr[j++] = node;
								}
								break;
							}
							node = node.nextSibling;
						}
					}
									
				//tag
				} else {
					if (tag !== "*") {
						while (node) {
							if (node.nodeType === 1) {
								if (node.nodeName === tag) {
									arr[j++] = node;
								}
								break;
							}
							node = node.nextSibling;
						}
					} else {
						while (node) {
							if (node.nodeType === 1) {
								arr[j++] = node;
								break;
							}
							node = node.nextSibling;
						}
					}					
				}		
			},
			
			"~" : function(tag, cls, context) {
				
			}
		},
		
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
		}
	};