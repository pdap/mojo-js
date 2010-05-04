	/**
 	 * Copyright (c) 2009 scott.cgi
 	 * http://mojo-js.appspot.com
 	 * under MIT License
 	 * Since  2009-11-11
 	 * Nightly Builds
 	 */
	shimmer = {
		
		select : function(selector, context) {
			var selectors = selector.toLowerCase().replace(/ *([ +>~]) */g,"$1").split(","), 
				ems,
				arr = [],
				arr1, arr2, 
				nodes, node,
				i, j, n, m, k, l;
				
			//逗号分隔有效选择器
			for (i = 0, j = selectors.length; i < j; i++) {
				//把选择器按照4大规则分开存放到数组
				arr1 = selectors[i].split(/ |\+|>|~/);
				//存放4大规则的数组,这个数组比arr1长度小1
				arr2 = selectors[i].match(/ |\+|>|~/g);
				
				ems = [];
				this.parse(ems, arr1[0], context, " ");			
				
				if (arr2 !== null) {
					for (n = 0, m = arr2.length; n < m; n++) {
						nodes = ems;
						ems = [];
						for (k = 0, l = nodes.length; k < l; k++) {
							this.parse(ems, arr1[n + 1], nodes[k], arr2[n]);
						}
					}
				}
				
				arr = arr.concat(ems);
			}
			
			return this.getDiff(arr);			
		},
		
		parse : function(ems, selector, context, rule) {
			var e, tag, cls;
			
			//id
			if (selector.charAt(0) === "#") {
				e = document.getElementById(selector.substring(1));
				if (e) {
					ems[0] = e;
				}
				
			} else { 
				/([a-zA-Z\*]*)([^\[:]*)/.test(selector);
				tag = RegExp.$1;
				cls = RegExp.$2;
				//伪类和属性选择字符串
				selector = RegExp["$'"];
				
				this.rules[rule].call(this, ems, tag || "*", cls, context, rule);
			
			}			
			
		},
		
		rules : {
			" " : function(ems, tag, cls, context, rule){
				var nodes, len, e,
					i = 0,
					j = ems.length;		
					
					nodes = context.getElementsByTagName(tag);
					
					//class
					if(cls) {
						for(len = nodes.length; i < len; i++) {
							e = nodes[i];
							if(this.hasClass(e, cls)) {
								ems[j++] = e;
							}
						}
					
					//tag
					} else {
						for(len = nodes.length; i < len; i++) {
							ems[j++] = nodes[i];
						}
					}
			},
			
			">" : function(ems, tag, cls, context, rule) {
				var nodes, len, e,
					i = 0,
					j = ems.length;
				
				nodes = context.childNodes;
				
				//cls
				if(cls) {
					if (tag !== "*") {
                		for (len = nodes.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1 && e.nodeName === tag && this.hasClass(e, cls)) {
								ems[j++] = e;
							}
						}					
					} else {
                		for (len = nodes.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1 && this.hasClass(e, cls)) {
								ems[j++] = e;
							}
						}							
					}
				
				//tag	
				} else {
					if(tag !== "*") {
						for (len = nodes.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1 && e.nodeName === tag) {
								ems[j++] = e;
							}
						}						
					} else {
						for (len = nodes.length; i < len; i++) {
							e = nodes[i];
							if (e.nodeType === 1) {
								ems[j++] = e;
							}
						}						
					}
				}
			},
			
			"+" : function(ems, tag, cls, context, rule) {
				var e,
					j = ems.length;		
				
				e = context.nextSibling;
				
				//class
				if (cls) {
					if (tag !== "*") {
						while (e) {
							if (e.nodeType === 1) {
								if (e.nodeName === tag && this.hasClass(e, cls)) {
									ems[j++] = e;
								}
								break;
							}
							e = e.nextSibling;
						}
					} else {
						while (e) {
							if (e.nodeType === 1) {
								if (this.hasClass(e, cls)) {
									ems[j++] = e;
								}
								break;
							}
							e = e.nextSibling;
						}
					}
									
				//tag
				} else {
					if (tag !== "*") {
						while (e) {
							if (e.nodeType === 1) {
								if (e.nodeName === tag) {
									ems[j++] = e;
								}
								break;
							}
							e = e.nextSibling;
						}
					} else {
						while (e) {
							if (e.nodeType === 1) {
								ems[j++] = e;
								break;
							}
							e = e.nextSibling;
						}
					}					
				}		
			},
			
			"~" : function(ems, tag, cls, context, rule) {
				var e,
					j = ems.length;			
					
				e = context.nextSibling;
				
				//class
				if (cls) {
					if (tag !== "*") {
						while (e) {
							if (e.nodeType === 1) {
								if (e.nodeName == tag && this.hasClass(e, cls)) {
									ems[j++] = e;
								}
							}
							e = e.nextSibling;
						}
					} else {
						while (e) {
							if (e.nodeType === 1) {
								if (this.hasClass(e, cls)) {
									ems[j++] = e;
								}
							}
							e = e.nextSibling;
						}						
					}
					
				//tag	
				} else {
					if (tag !== "*") {
						while (e) {
							if (e.nodeType === 1) {
								if (e.nodeName == tag) {
									ems[j++] = e;
								}
							}
							e = e.nextSibling;
						}
					} else {
						while (e) {
							if (e.nodeType === 1) {
								ems[j++] = e;
							}
							e = e.nextSibling;
						}						
					}
				}	
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
		},
		
		getDiff : function(arr) {
			var e,
				newArr = [],
				i = 0,
				j = 0,
				len = arr.length;
			
			for(;i < len; i++) {
				e = arr[i];
				if(!e.mojoDiff) {
					e.mojoDiff = true;
					newArr[j++] = e;
				}
			}
			
			arr.length = 0;
			
			for(i = 0; i < j; i++) {
				e = newArr[i];
				delete e.mojoDiff;
				arr[i] = e;
			}
		}
	};