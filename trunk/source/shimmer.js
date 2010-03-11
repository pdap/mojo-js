	/**
 	 * Copyright (c) 2009 scott.cgi
 	 * http://mojo-js.appspot.com
 	 * under MIT License
 	 * Since  2009-11-11
 	 * Version 1.0
     * Date 2009-11-16
 	 */
	shimmer = {
		//注意选择器除了后代规则外是不能有空格的,可以在高层用正则处理一下在传过来
		selector: function(s, context){//选择器字符串,上下文
			var arr = [], arrs = s.split(","), arr1, arr2, nodes1, nodes2 = [];
			for (var i = 0, j = arrs.length; i < j; i++) {//逗号分隔有效选择器
				arr1 = arrs[i].split(/ |\+|>|~/);//把选择器按照4大规则分开存放到数组(后代,子元素,哥哥,弟弟)
				arr2 = arrs[i].match(/ |\+|>|~/g);//存放4大规则的数组,这个数组比arr1长度小1
				if (arr2 == null) {//没有4大规则的情况
					arr = arr.concat(this.idClassTag(arr1[0], context, " "));//默认为当前上下文的后代规则
				} else {
					nodes1 = this.idClassTag(arr1[0], context, " ");
					for (var n = 0, m = arr2.length; n < m; n++) {//更具规则组装arr数组,存放既是HTMLElement
						for (var k = 0, l = nodes1.length; k < l; k++) {
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
		idClassTag : function(s,context,symbol){//选择器,上下文,规则
			var arr = [];
			if(/#(\S+)/.test(s)){//解析id
				var e = document.getElementById(RegExp.$1);
				if(e){
					arr[0] = e;
				}
			} else if(/\[|:/.test(s)){ //复杂情况有伪类和属性
				var n,tag,attr,pseudo;
				if(/([a-zA-Z]*\.[^\[:]+)/.test(s)){//带有伪类,属性的class规则
					//把去除伪类和属性的部分调用自己,这部分含有class规则
					n = this.idClassTag(RegExp.$1,context,symbol);
				} else {
					//这部分仅含有tag,或只有伪类和属性时候使用*
					n = this.idClassTag(s.match(/[a-zA-Z]*/)[0] || "*",context,symbol);
				}
				attr = s.match(/[^\[]+(?=\])/g);//存放属性数组
				pseudo = s.split(":");
				pseudo = pseudo.length == 1 ? null : pseudo.slice(1);//存放伪类数组
				
				//根据属性数组规则,剔除不符合的HTMLElement
				if (attr) {
					arr = this.filterAttr(n, attr);
				} else {
					arr = n;
				}
				//用伪类数组过滤HTMLElement集合
				if (pseudo) { 
					arr = this.filterPseudo(arr,pseudo);
				}
			} else if(/([a-zA-Z]*)\.(\S+)/.test(s)){//解析class
				var cls = RegExp.$2.replace(/\./g, " "),
					tag = RegExp.$1,
					k = 0,
					n;
				switch (symbol) {
					//后代
					case " ":
						n = context.getElementsByTagName(tag || "*"); 
						for (var i = 0, j = n.length; i < j; i++) {
							if (n[i].className.indexOf(cls) != -1) {
								arr[k] = n[i];
								k++;
							}
						};
						break;
					//子元素		
					case ">":
						for(var i = 0,ns = context.childNodes, j = ns.length; i < j; i++){
							n = ns[i];
							if (n.nodeType == 1 && n.nodeName.toLowerCase() == tag) {
								if (n.className.indexOf(cls) != -1) {
									arr[k] = n;
									k++;
								}								
							}
						};
						break;	
					//弟弟元素
					case "+":
						n = context.nextSibling;
						while(n){
							if(n.nodeType == 1 && n.nodeName.toLowerCase() == tag){
								if (n.className.indexOf(cls) != -1) {
									arr[k] = n;
									k++;
								}
							}
							n = n.nextSibling;
						};
						break;
					//哥哥元素
					case "~":
						n = context.previousSibling;
						while(n){
							if (n.nodeType == 1 && n.nodeName.toLowerCase() == tag) {
								if (n.className.indexOf(cls) != -1) {
									arr[k] = n;
									k++;
								}
							}
							n = n.previousSibling;
						};
				}
			} else {//解析tag
				var n;
				switch (symbol) {
					//后代
					case " ":
						n = context.getElementsByTagName(s);
						//shit,这里用Array.prototype.slice.call(nodes,0)转换在IE下报错
						//我也不知道怎么搞的fuck ie
						for (var i = 0, j = n.length; i < j; i++) {
							arr[i] = n[i];
						};
						break;
					//子元素		
					case ">":
						for (var i = 0, ns = context.childNodes, j = ns.length, k = 0; i < j; i++) {
							n = ns[i];
							if (n.nodeType == 1 && n.nodeName.toLowerCase() == s){
								arr[k] = n;
								k++;
							}
						};
						break;
					//弟弟元素
					case "+":
						n = context.nextSibling;
						var k = 0;
						while(n){
							if (n.nodeType == 1 && n.nodeName.toLowerCase() == s) {
								arr[k] = n;
								k++;
							}
							n = n.nextSibling;
						};
						break;
					//哥哥元素	
					case "~":
						n = context.previousSibling;
						var k = 0;
						while (n) {
							if (n.nodeType == 1 && n.nodeName.toLowerCase() == s) {
								arr[k] = n;
								k++;
							}
							n = n.previousSibling;
						};
				}
			}
			return arr;
		},
		filterAttr : function(nodes,attr){//需要属性过滤的的元素数组,属性规则数组
			var attr1,attr2,attrVal,arr = [],k = 0,len = attr.length;
			for(var i = 0,j = nodes.length,n; i < j; i++){
				for(n = 0; n < len; n++){
					attr1 = attr[n].split(/=|~=|\|=|\^=|\$=|\*=/);//属性规则的属性名值对
					attr2 = attr[n].match(/=|~=|\|=|\^=|\$=|\*=/g);//属性规则的规则符号
					attr2 = attr2 ? attr2[0] : " ";
					//元素属性名对应的属性值,强制字符串转换了
					attrVal = String(nodes[i][attr1[0]] || nodes[i].getAttribute(attr1[0]) || "");
					
					//根据规则符号处理,一旦不符合条件就终止循环
					switch (attr2) {
						case " ": 
							if (!attrVal) 
								n = len;
							break;
						case "=":
							if(attrVal != attr1[1])
								n = len;
							break;
						/*
						这个规则让我好迷惑,没有实现
						case "~=":;
							break;
						这个规则也让我好迷惑,没有实现	
						case "|=":;
							break;	
						*/
						case "^=":
							if(!new RegExp("^"+attr1[1]).test(attrVal))
								n = len;
							break;
						case "$=":
							if(!new RegExp(attr1[1]+"$").test(attrVal))
								n = len;
							break;	
						case "*=":
							if(attrVal.indexOf(attr1[1]) == -1)
								n = len;		
					}
				}
				if(n == len){//说明循环顺利结束,当前元素符合条件
					arr[k] = nodes[i];
					k++;
				}		
			}
			return arr;
		},
		filterPseudo : function(nodes,pseudo){//需要伪类过滤的的元素数组,伪类规则数组
			var arr = [],name,param;
			for(var i = 0,j = pseudo.length; i < j; i++){
				if(/\((\S+)\)/.test(pseudo[i])){
					param = RegExp.$1;
				}
				name = pseudo[i].replace(/-|\(\S+\)/g,"");
				arr = arr.concat(this.pseudos[name](nodes,param));
			}
			return arr;
		},
		pseudos : {//伪类的规则
			firstchild : function(nodes){ 
				var arr = [], f, k = 0;
				for (var i = 0, j = nodes.length; i < j; i++) {
					f = nodes[i].firstChild;
					while (f) {
						if (f.nodeType == 1) {
							arr[k] = f;
							k++;
							break;
						}
						f = f.nextSibling;
					}
				}
				return arr;
			},
			lastchild : function(nodes){
				var arr = [], f, k = 0;
				for(var i = 0,j = nodes.length; i < j; i++){
					f = nodes[i].lastChild;	
					while(f){
						if(f.nodeType == 1){
							arr[k] = f;
							k++;
							break;
						}
						f = f.previousSibling;
					}
				}
				return arr;
			},
			even : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i+=2){
					arr[k] = nodes[i];
					k++;
				}
				return arr;
			},
			odd : function(nodes){
				var arr = [],k = 0;
				for(var i = 1,j = nodes.length;i < j; i+=2){
					arr[k] = nodes[i];
					k++;
				}
				return arr;				
			},
			eq : function(nodes,param){
				var arr = [];
				param = parseInt(param);
				if(param < nodes.length){
					arr[0] = nodes[param];
				}
				return arr;
			},
			gt : function(nodes,param){
				var arr = [];
				param = parseInt(param);
				if(param < nodes.length){
					arr = arr.concat(nodes.slice(param));
				}
				return arr;				
			},
			lt : function(nodes,param){
				var arr = [];
				param = parseInt(param);
				if(param < nodes.length){
					arr = arr.concat(nodes.slice(0,param));
				}
				return arr;				
			},
			first : function(nodes){
				var arr = [];
				if(nodes.length){
					arr[0] = nodes[0];
				}
				return arr;
			},
			last : function(nodes){
				var arr = [];
				if(nodes.length){
					arr[0] = nodes[nodes.length - 1];
				}
				return arr;
			},
			enabled : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(!nodes[i].disabled){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;
			},
			disabled : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(nodes[i].disabled){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;				
			},
			checked : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(nodes[i].checked){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;				
			},
			selected : function(nodes){
				var arr = [],k = 0;
				for(var i = 0,j = nodes.length;i < j; i++){
					if(nodes[i].selected){
						arr[k] = nodes[i];
						k++;
					}
				}
				return arr;				
			}
		}		
	};