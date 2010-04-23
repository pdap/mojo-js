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
		
		seletor : function(selector, context) {
			var arr = [], 
				seletors = seletor.replace(/ *([ +>~]) */g,"$1").split(","), 
				arr1, arr2, 
				nodes1, nodes2 = [],
				i, j;
				
			//逗号分隔有效选择器
			for (i = 0, j = seletors.length; i < j; i++) {
				//把选择器按照4大规则分开存放到数组
				arr1 = seletors[i].split(/ |\+|>|~/);
				//存放4大规则的数组,这个数组比arr1长度小1
				arr2 = seletors[i].match(/ |\+|>|~/g);
				
				//没有4大规则的情况
				if (arr2 === null) {
					//默认为当前上下文的后代规则
					arr = arr.concat(this.parse(arr1[0], context, " "));
				} else {
					nodes1 = this.parse(arr1[0], context, " ");
					
					//根据规则组装arr数组,存放既是HTMLElement
					for (var n = 0, m = arr2.length, k, l; n < m; n++) {
						l = nodes1.length
						for (k = 0; k < l; k++) {
							nodes2 = nodes2.concat(this.parse(arr1[n + 1], nodes1[k], arr2[n]));
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
		
		parse : function(selector, context, rule) {
			var arr = [],
				e, tag, cls, ns;
			
			//id
			if (/^#/.test(selector)) {
				e = document.getElementById(RegExp["$'"]);
				if (e) {
					arr[0] = e;
				}
				
			} else {
				selector.search(/([a-zA-Z]*)([^\[:]*)/);
				tag = RegExp.$1;
				cls = RegExp.$2;
				//伪类和属性选择字符串
				selector = RegExp["$'"];
				
				//tag
				if(cls === "") {
					ns = this.getByTag(tag || "*", context, rule);
				//class	
				} else {
					ns = this.getByClass(tag || "*", context, rule);
				}
			}			
		},
		
		getByTag : function(tag, context, rule) {
			var n, i, len, e,
				j = 0,
				arr = [];
			
			switch (rule) {
				case " ":
					n = context.getElementsByTagName(tag);
					if (tag !== "*") {
						for (i = 0, len = n.length; i < len; i++) {
							e = n[i];
							if (e.parentNode === context || e.parentNode.nodeName !== context.nodeName) {
								arr[j++] = e;
							}
						}
					}
					break;
					
				case ">":
					n = context.childNodes;
					if (tag !== "*") {
						for (i = 0, len = n.length; i < len; i++) {
							e = n[i];
							if (e.nodeType === 1 && e.nodeName.toLowerCase() === tag.toLowerCase()) {
								arr[j++] = e;
							}
						}
					} else {
						for (i = 0, len = n.length; i < len; i++) {
							arr[j++] = n[i];
						}						
					}
					break;
					
				case "+":
					n = context.nextSibling;
					if (tag !== "*") {
						while (n) {
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag.toLowerCase()) {
								arr[0] = n;
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
					break;
					
				case "~":
					n = context.nextSibling;
					if (tag !== "*") {
						while (n) {
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag.toLowerCase()) {
								arr[j++] = n;
							}
							n = n.nextSibling;
						}
					} else {
						while (n) {
							if (n.nodeType === 1) {
								arr[j++] = n;
							}
							n = n.nextSibling;
						}						
					}
			}
			
			return arr;
		},
		
		getByClass : function(tag, cls, context, rule) {
			var cls = cls.replace(/\./g, " ").repace(/^ /,""),  //.cls1.cls2转换成cls cls
				j = 0, 
				n, i, len, e;
			
			switch (rule) {
			
				case " ":
					n = context.getElementsByTagName(tag);
					for (i = 0, len = n.length; i < len; i++) {
						e = n[i];
						if (e.parentNode === context || e.parentNode.nodeName !== context.nodeName) {
							if (e.className.indexOf(cls) !== -1) {
								arr[j++] = e;
							}
						}
					}
					break;
		
				case ">":
					n = context.childNodes;
					if (tag !== "*") {
						for (i = 0, len = n.length; i < len; i++) {
							e = n[i];
							if (e.nodeType === 1 && e.nodeName.toLowerCase() === tag.toLowerCase()) {
								if (n.className.indexOf(cls) !== -1) {
									arr[j++] = e;
								}
							}
						}
					} else {
						for (i = 0, len = n.length; i < len; i++) {
							e = n[i];
							if (e.nodeType === 1) {
								if (n.className.indexOf(cls) !== -1) {
									arr[j++] = e;
								}
							}
						}						
					}
					break;
		
				case "+":
					n = context.nextSibling;
					if (tag !== "*") {
						while (n) {
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag.toLowerCase()) {
								if (n.className.indexOf(cls) !== -1) {
									arr[0] = n;
									break;
								}
							}
							n = n.nextSibling;
						}
					} else {
						while (n) {
							if (n.nodeType === 1) {
								if (n.className.indexOf(cls) !== -1) {
									arr[0] = n;
									break;
								}
							}
							n = n.nextSibling;
						}						
					}
					break;
				
				case "~":
					n = context.nextSibling;
					if (tag !== "*") {
						while (n) {
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag.toLowerCase()) {
								if (n.className.indexOf(cls) !== -1) {
									arr[j++] = n;
								}
							}
							n = n.nextSibling;
						}
					} else {
						while (n) {
							if (n.nodeType === 1) {
								if (n.className.indexOf(cls) !== -1) {
									arr[j++] = n;
								}
							}
							n = n.nextSibling;
						}						
					}
			}			
			
			return arr;
		}
	};