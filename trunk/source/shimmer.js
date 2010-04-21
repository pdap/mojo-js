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
				//把选择器按照4大规则分开存放到数组(后代,子元素,哥哥,弟弟)
				arr1 = seletors[i].split(/ |\+|>|~/);
				//存放4大规则的数组,这个数组比arr1长度小1
				arr2 = seletors[i].match(/ |\+|>|~/g);
				
				//没有4大规则的情况
				if (arr2 === null) {
					//默认为当前上下文的后代规则
					arr = arr.concat(this.idClassTag(arr1[0], context, " "));
				} else {
					nodes1 = this.idClassTag(arr1[0], context, " ");
					
					//根据规则组装arr数组,存放既是HTMLElement
					for (var n = 0, m = arr2.length, k, l; n < m; n++) {
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
		
		idClassTag : function(selector, context, rule) {
			var arr = [],
				e;
			
			//id
			if (/^#/.test(selector)) {
				e = document.getElementById(RegExp["$'"]);
				if (e) {
					arr[0] = e;
				}
				
			
			} else {
				
			}			
		}
	};