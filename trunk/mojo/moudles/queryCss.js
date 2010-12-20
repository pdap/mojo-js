/**
 * css query moudle
 * 
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 */
(function(window, mojo){
	
	var 
		document = window.document,
		
		mojoQuery = {
			
			info: {
				author: "scott.cgi",
				version: "1.2.1"
			},
			
			/**
			 * Get HTMLElement array by selector and context
			 * 
			 * @param {String}                             selector  
			 * @param {Undefined/String/HTMLElement/Array} context   
			 */
			get: function(selector, context) {
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
						// HTMLElement Array or NodeList
						if (context.length) {
							contexts = context;
						} else {
							// HTMLElement
							contexts = [context];
						}
				}				
									 
				selectors = joQuery.trim(selector);
				
				context = contexts;
							
				// split selector by comma
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					// base rule array 
					// add defalut rule " "
					rules = (" " + selector).match(/[ +>~]/g);
										
					// selector of corresponding base rules 
					selector = selector.match(/[^ +>~]+/g);
					
					if(rules.length > selector.length) {
						// if here, means selector begin with base rule
						// example: "+div" or ">div" 
						// remove defalut rule " "
						rules.shift();
					}
					
					// each iteration parse selector, use before parse result as this context
					contexts = context;
					
					// parse selector by each rule
					for (n = 0, m = rules.length; n < m; n++) { 
						contexts = joQuery.parse(selector[n], contexts, rules[n]);
					}
				
					// concat results of comma delimited selector
					results = results.concat(contexts);
				}
				
				if(j > 1) {
					// if here, may hava duplicate HTMLElement
					// remove duplicate
					joQuery.makeDiff(results);
				}
				
				return results;
			}
		},
		
		// inner assist object
		joQuery = {
			// Identifies HTMLElement whether matched in one query
			// refresh each query
			tagCount: 0,
			
		   /**
		 	* Parse selector and get matched HTMLElement array
		 	* 
		 	* @param  {String} selector      
		 	* @param  {Array}  contexts      
		 	* @param  {String} rule         
		 	* @return {Array}  Matched HTMLElement array
		 	*/
			parse: function(selector, contexts, rule){
				var 
					arr, id, tag, cls, attrs, pseudos,
					matched = [],
					i, len;
				
				arr = this.getRules(selector);
				
				// id selector
				if (id = arr[1]) { 
					if (id = document.getElementById(id.substring(1))) {
						return [id];
					}
					
					return [];
				}
				
				tag     = arr[2] || "*";
				cls     = arr[3];
				attrs   = arr[4];
				pseudos = arr[5];
				
				arr = this.BaseRules[rule].call(this, contexts, tag);
				
				for(i = 0, len = arr.length; i < len; i++) {
					id = arr[i];
					if(this.filterEl(id, tag, cls, attrs, pseudos)) {
						matched.push(id);
					}
				}
				
				return matched;
			},
			
			/**
			 * split selector in different types
			 * 
			 * @param  {String} selector
			 * @return {Array}  Array of different types rule
			 */
			getRules: function(selector) {
				var	
					rules, attrs, pseudos; 
				
				
				// rules[1]: id selector 
				// rules[2]: tag selector
				// rules[3]: class selecotr
				// rules[4]: attribute selector
				// rules[5]: pseudo selector  	
				rules = /((?:#.+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?:\:.+[^:])*)/.exec(selector);
				
				if (attrs = rules[4]) {
					// get attribute rule array
					rules[4] = this.getAttrRules(attrs.match(/[^\[]+(?=\])/g), this.attrParams);
				}
				
				if (pseudos = rules[5]) {
					(pseudos  = pseudos.split(":")).shift();
					 // get pseudo rule array
					 rules[5] = this.getPseudoRules(pseudos, this.pseuParams);
				}				
				
				return rules;	
			},
			
			/**
			 * Get attribute rule 
			 * 
			 * @param  {Array} attrs       
			 * @param  {Array} attrParams  
			 * @return {Array} Array of attribute rule    
			 */
			getAttrRules: function(attrs, attrParams) {
				var
					arr = [],
					len = attrs.length,
					rex = /=|!=|\^=|\$=|\*=|~=|\|=/,
					i   = 0,
					attr, rule;
				
				for(; i < len; i++) {
					attr = attrParams[attrs[i]];
					// rule
					rule = attr.match(rex) || " ";
					// attribute key-value
					attr = attr.split(rex);					
					
					// attribute parse function
					arr.push(this.Attrs[rule]);
					arr.push(attr);					
				}	
				
				return arr;
			},		
			
			/**
			 * Get pesudo rule array
			 * 
			 * @param  {Array} pseudos
			 * @param  {Array} pseuParams
			 * @return {Array} Array of pseudo rule
			 */
			getPseudoRules: function(pseudos, pseuParams) {
				var 
					arr = [],
					i   = 0,
					len = pseudos.length,
					count = ++this.tagCount,
					name, param, arr;
				
				for(; i < len; i++) {
					name = pseudos[i];
					if(/(\d+)/.test(name)) {
						// pesudo parameter
						param = pseuParams[RegExp.$1];
						name  = RegExp["$`"];
						
						switch(name) {
							case "nth-child":
								if (/(-?\d*)n([+-]?\d*)/.test(param === "odd" && "2n+1" ||
															  param === "even" && "2n"  || param)) {
									param = RegExp.$1;
									param === "" ? 
									param = 1 : 
									param === "-" ? 
									param = -1 : 
									param = param * 1;
									
									param = [count, "n", param, RegExp.$2 * 1];
									
									// optimize "nth:child(n)" 
									// this pseudo means all child nodes fit
									// so no need execute this pseudo filter
									if (param[2] === 1 && param[3] === 0) {
										continue;
									}
								} else {
									param = [count, param];
								}						
								
								break;
								
						 	case "not" :
							    // ":not" selector may has "," in parameter
								// example: ":not(div,p)"
								arr   = param.split(",");
								param = [];
								while(arr.length) {
									count = this.getRules(arr.pop());
									param.push(["", count[2] || "*", count[3], count[4], count[5]]);
								}
						}

					}
					
					// parse pseudo selector funtion
					arr.push(this.Pseudos[name]);
					arr.push(param);
				}	

				return arr;
			},
			
			/**
			 * Whether HTMLElement matched pseudo rule
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Array}       pseudos
			 * @return {Boolean}
			 */
			isPseudo: function(el, pseudos){
				var 
					len = pseudos.length, 
					i   = 0, 
					pseudo, param;
				
				for (; i < len; i += 2) {
					pseudo = pseudos[i];
					param  = pseudos[i + 1];
					
					if(!pseudo.call(this, el, param)) {
						return false;
					}
				}
				
				return true;
			},	
			
			/**
			 * Whether HTMLElement matched attribute rule
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Array}       attrs
			 * @return {Boolean}
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
					
					if (!rule.call(this, val + "", attr[1])) {
						return false;
					}
				}
				
				return true;
			},	
			
			/**
			 * Filter HTMLElement by all type selector
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      tag
			 * @param {String}      cls
			 * @param {Array}       attrs
			 * @param {Array}       pseudos
			 * @param {Boolean}
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
			 * Preprocessing selector
			 * 
			 * @param  {String} selector
			 * @return {Array}  selector array
			 * @return {Array}  Array of regular selectors
			 */
			trim: function(selector){
				var 
					pseuParams = [],
					attrParams = [];
				
				this.pseuParams = pseuParams;
				this.attrParams = attrParams;
				
				selector = selector
								// trim space
								.replace(/^ +| +$/g, "")	
						
								// trim base rule space
								.replace(/ +([ +>~]) +/g, "$1")	
								
								// remove attribute selector parameter and put in array
								.replace(/[^\[]+(?=\])/g, function(match){
									return attrParams.push(match) - 1;
								});
				
				// remove pseudo selector parameter and put in array
				while(selector.indexOf("(") !== -1) {
					selector = selector.replace(/\([^()]+\)/g, function(match){
						return pseuParams.push(match.substring(1, match.length - 1)) - 1;
					});
				}
				
				return selector.split(",");					
			},			
			
		   	/**
		 	 * Whether HTMLElement matched class attribute
		 	 * 
		 	 * @param  {HTMLElement} el
		 	 * @param  {String}      cls
		 	 * @return {Boolean}
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
		 	* Reomve duplicate HTMLElement
		 	* 
		 	* @param  {Array} arr
		 	*/
			makeDiff : function(arr){
				var 
					count = ++this.tagCount,
					len   = arr.length, 
					temp  = [], 
					i     = 0, 
					j     = 0, 
					el, data;
				
				for (; i < len; i++) {
					el = arr[i];
					data = this.getElData(el);
					if (data.tagCount !== count) {
						temp[j++] = el;
						data.tagCount = count;
					}
				}
				
				arr.length = len = 0;
				
				for (i = 0; i < j; i++) {
					el = temp[i];
					arr[len++] = el;
				}
			},
			
			/**
			 * Get the data bind in HTMLElement
			 * 
			 * @param  {HTMLElement} el
			 * @return {Object}
			 */
			getElData: function(el) {
				var x;
				if(!(x = el.mojoData)) {
					x = el.mojoData = {};
				}
				
				if(!x.mojoQuery) {
					x.mojoQuery = {
						tagCount: 0
					};
				}
				
				return x.mojoQuery;
			},
			
			BaseRules: {
			   /**
	 			* Get matched HTMLElement
	 			*
	 			* @param  {Array}  contexts   
	 			* @param  {String} tag
			  	* @return {Array}
	 			*/				
				" " : function(contexts, tag) {
					var 
						count = ++this.tagCount,
						arr   = [],
						len   = contexts.length,
						i     = 0,
						n, m,
						nodes, el, pel;			
						
					for(; i < len; i++) {
						el  = contexts[i];
						if((pel = el.parentNode) && this.getElData(pel).tagCount === count) {
							continue;
						}
						
						this.getElData(el).tagCount = count;
						
						nodes = el.getElementsByTagName(tag);	
						
						for(n = 0, m = nodes.length; n < m; n++) {
							arr.push(nodes[n]);
						}
					}
					
					return arr;
				},
				
			   /**
	 			* Get matched HTMLElement
	 			*
	 			* @param  {Array} contexts   
			  	* @return {Array}
	 			*/				
				">" : function(contexts) {
					var 
						arr = [], 
						len = contexts.length,
						i   = 0, el;			
					
					for(; i < len; i++) {
						el = contexts[i].firstChild;	
						while(el) {
							if(el.nodeType === 1) {
								arr.push(el);
							}
							el = el.nextSibling;							
						}												
					}
					
					return arr;					
				},
				
			   /**
	 			* Get matched HTMLElement
	 			*
	 			* @param  {Array} contexts    
			  	* @return {Array}
	 			*/					
				"+" : function(contexts) {
					var 
						arr = [], 
						len = contexts.length,
						i   = 0, el;	
						
					for (; i < len; i++) {
						el = contexts[i];
						while(el = el.nextSibling) {
							if(el.nodeType === 1) {
								arr.push(el);
								break;
							}
						}
					}
					
					return arr;											
				},
				
			   /**
	 			* Get matched HTMLElement
	 			*
	 			* @param  {Array} contexts    
			  	* @return {Array}
	 			*/					
				"~" : function(contexts) {
					var 
						count = ++this.tagCount,
						arr   = [], 
						len   = contexts.length,
						i     = 0,
						el, pel, data;

					for (; i < len; i++) {
						el = contexts[i];
						if ((pel = el.parentNode) && (data = this.getElData(pel)).tagCount === count) {
							continue;
						}
						
						while(el = el.nextSibling) {
							if (el.nodeType === 1) {
								arr.push(el);
							}
						}
						
						data.tagCount = count;
					}
							
					return arr;											
				}
			},
			
			// attribute parameter relative
			Attrs: {
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
			
			// pseudo parameter
			Pseudos : {
				"first-child": function(el) {
					while (el = el.previousSibling)	 {
						if (el.nodeType === 1) { 
							return false; 
						}
					}
					
					return true;
				},
				
				"last-child": function(el) {
					while (el = el.nextSibling)	 {
						if (el.nodeType === 1) { 
							return false; 
						}
					}
					
					return true;					
				},
				
				"only-child": function(el) {
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
				
				"nth-child": function(el, param) {
					var
					    pel, index, node, i, data;
					
					if ((pel = el.parentNode) && (data = this.getElData(pel)).tagCount !== param[0]) { 
						node = pel.firstChild;
						i = 0;
						while (node) {
							if (node.nodeType === 1) {
								// nodeIndex is index number of parent's child nodes
								this.getElData(node).nodeIndex = ++i;
							}
							node = node.nextSibling
						}
						data.tagCount = param[0];
					}
						
					index = this.getElData(el).nodeIndex;
					
					if (param[1] === "n") {
						index = index - param[3];
						param = param[2];
						return index * param >= 0 && index % param === 0;
					}
					
					return index === param[1] * 1;
				},
				
				not: function(el, params) {
					var 
						i   = 0,
						len = params.length,
						param;
						
					for(; i < len; i++) {
						param = params[i];
						param[0] = el;
						if(this.filterEl.apply(this, param)) {
							return false;
						}
					}	
					
					return true;	
				},
				
				enabled: function(el) {
					return !el.disabled;
				},
				
				disabled: function(el) {
					return el.disabled;
				},
				
				checked: function(el) {
					return el.checked;
				},
				
				empty: function(el){
					return !el.firstChild;
				}				
			}													
		};
		
		mojo.extend({
			/**
			 * Query HTMLElemtents by css selector
			 * 
			 * @param  {Object} selector
			 * @param  {Object} context
			 * @return {Array}  Array of HTMLElements
			 */
			queryCss: function(selector, context) {
				return mojoQuery.get(selector, context);
			}
		});
})(window, mojo);	