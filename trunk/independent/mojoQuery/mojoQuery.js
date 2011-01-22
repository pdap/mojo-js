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
		
		mojoQuery = function(selector, context) {
			return joQuery.query(selector, context);
		},
		
		// inner assist object
		joQuery = {
		    // Identifies HTMLElement whether matched in one query
		    tagGuid: 1,			
			
			attrMap: {
				"class": "className",
				"for": "htmlFor"
			},
			
			rex: {
				B_RULE: /[ +>~]/g,
				NB_RULE: /[^ +>~]+/g,
				TRIM_LR: /^ +| +$/g,
				TRIM_ALL: / +([ +>~]) +/g,
				PSEU_PARAM: /\([^()]+\)/g,
				ATTR_PARAM: /[^\[]+(?=\])/g,
				ATTR: /=|!=|\^=|\$=|\*=|~=|\|=/,
				CLS: /\./g,
				PSEU: /[^:]+/g,
				NUM: /\d+/,
				NTH: /(-?\d*)n([+-]?\d*)/,
				RULES: /((?:#.+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?::.+)*)/
			},
			
			error: function(selector) {
				throw "Syntax error, unsupported expression: " + selector;
			},
			
			/**
			 * Get HTMLElement array by selector and context
			 * 
			 * @param {String} selector  
			 * @param {Undefined | String | HTMLElement | Array[HTMLElement] | NodeList} context   
			 */			
			query: function(selector, context) {
				var 
					results = [], 
					selectors, contexts, rules,
					i, j, n, m;
				
				switch (typeof context) {
					case "undefined":
						contexts = [document];
						break;
						
					case "string":
						selector = context + " " + selector; 
						contexts = [document];
						break;
						
					case "object":
						if (context.nodeType) {
							// HTMLElement
							contexts = [context];							
						} else {
							// HTMLElement Array or NodeList
                            contexts = context;
						}
				}				
									 
				selectors = this.trim(selector);
				
				context = contexts;
							
				// split selector by comma
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					// base rule array 
					// add defalut rule " "
					rules = (" " + selector).match(this.rex.B_RULE);
										
					// selector of corresponding base rules 
					selector = selector.match(this.rex.NB_RULE);
					
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
						contexts = this.parse(selector[n], contexts, rules[n]);
					}
				
					// concat results of comma delimited selector
					results = results.concat(contexts);
				}
				
				if(j > 1) {
					// if here, may hava duplicate HTMLElement
					// remove duplicate
					return this.makeDiff(results);
				}
				
				return results;				
			},
			
			/**
			 * Preprocessing selector
			 * 
			 * @param  {String} selector
			 * @return {Array}  selector array
			 * @return {Array}  Split selectors in array
			 */
			trim: function(selector){
				var 
					pseuParams = [],
					attrParams = [];
				
				this.pseuParams = pseuParams;
				this.attrParams = attrParams;
				
				selector = selector
								// trim left and right space
								.replace(this.rex.TRIM_LR, "")	
						
								// trim base rule space
								.replace(this.rex.TRIM_ALL, "$1")	
								
								// remove attribute selector parameter and put in array
								.replace(this.rex.ATTR_PARAM, function(match){
									return attrParams.push(match) - 1;
								});
				
				// remove pseudo selector parameter and put in array
				while(selector.indexOf("(") !== -1) {
					selector = selector.replace(this.rex.PSEU_PARAM, function(match){
						return pseuParams.push(match.substring(1, match.length - 1)) - 1;
					});
				}
				
				return selector.split(",");					
			},				
			
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
					matched, rules, id, tag, cls, attrs, pseudos;
				
				// rules[1]: id selector 
				// rules[2]: tag selector
				// rules[3]: class selecotr
				// rules[4]: attribute selector
				// rules[5]: pseudo selector  									
				rules = this.rex.RULES.exec(selector);;
				
				// id selector
				if (id = rules[1]) { 
					if (id = document.getElementById(id.substring(1))) {
						return [id];
					}
					
					return [];
				}
				
				matched = (BaseRules[rule] || this.error(rule))(contexts, rules[2] || "*", this);
				
				if(cls = rules[3]) {
					matched = this.filterClass(matched, cls.replace(this.rex.CLS, ""));
				}
				
				if(attrs = rules[4]) {
					matched = this.filterAttr(matched, this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams));
				}
				
				if(pseudos = rules[5]) {
					matched = this.filterPseudo(matched, this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams));
				}
				
				return matched; 
			},
			
			/**
			 * Parse selector and  get complex selector
			 * 
			 * @param  {String} selector
			 * @return {Array}  rules
			 */
			getRules : function(selector) {
				var	
					rules, attrs, pseudos; 
				
				// rules[1]: id selector 
				// rules[2]: tag selector
				// rules[3]: class selecotr
				// rules[4]: attribute selector
				// rules[5]: pseudo selector  	
				rules = this.rex.RULES.exec(selector);
				
				if(!rules[2]) {
					rules[2] = "*";
				}
				
				rules[3] = rules[3].replace(this.rex.CLS, "");
				
				if (attrs = rules[4]) {
					rules[4] = this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams);
				}
				
				if (pseudos = rules[5]) {
					 rules[5] = this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams)
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
					rex = this.rex.ATTR,
					i   = 0,
					attr, rule;
				
				for(; i < len; i++) {
					attr = attrParams[attrs[i]];
					// rule
					rule = attr.match(rex) || " ";
					// attribute key-value
					attr = attr.split(rex);					
					
					// attribute parse function
					arr.push(Attrs[rule]);
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
					arr  = [],
					i    = 0,
					len  = pseudos.length,
					guid = this.tagGuid++,
					name, param, rules;
				
				for(; i < len; i++) {
					name = pseudos[i];
					if(this.rex.NUM.test(name)) {
						// pesudo parameter
						param = pseuParams[RegExp["$&"]];
						name  = RegExp["$`"];
						
						switch(name) {
							case "nth-child":
								if (this.rex.NTH.test(param === "odd" && "2n+1" ||
													  param === "even" && "2n"  || param)) {
									param = RegExp.$1;
									
									param === "" ? 
									param = 1 : 
									param === "-" ? 
									param = -1 : 
									param = param * 1;
									
									param = [guid, "n", param, RegExp.$2 * 1];
									
									// optimize "nth:child(n)" 
									// this pseudo means all child nodes fit
									// so no need execute this pseudo filter
									if (param[2] === 1 && param[3] === 0) {
										continue;
									}
								} else {
									param = [guid, param];
								}						
								
								break;
								
						 	case "not":
								rules = param.split(",");
								param = [];
								while(rules.length) {
									param.push(this.getRules(rules.pop()));
								}
						}

					}
					
					// parse pseudo selector funtion
					arr.push(Pseudos[name] || this.error(name));
					arr.push(param);
				}	

				return arr;
			},
			
			/**
			 * Filter HTMLElement matched pseudo rule
			 * 
			 * @param  {Array}   els
			 * @param  {Array}   pseudoRules
			 * @return {Boolean}
			 */
			filterPseudo: function(els, pseudoRules){
				var 
					len = els.length, 
					i   = 0, 
					m   = pseudoRules.length,
					matched = [],
					n, el, pseudo, param;
				
				for(; i < len; i++) {
					el = els[i];
					for (n = 0; n < m; n += 2) {
						pseudo = pseudoRules[n];
						param  = pseudoRules[n + 1];
						
						if (!pseudo(el, param, this)) {
							break;
						}
					}
					
					if(n === m) {
						matched.push(el);
					}
				}

				return matched;
			},	
			
			/**
			 * Filter HTMLElement matched attribute rule
			 * 
			 * @param  {Array}  els
			 * @param  {Array}  attrRules
			 * @return {Boolean}
			 */
			filterAttr: function(els, attrRules){
				var 
					len = els.length,
					i = 0, 
					m = attrRules.length,
					matched = [],
					n, el, attr, rule, val, name;
				
				for(; i < len; i++) {
					el = els[i];
					for (n = 0; n < m; n += 2) {
						rule = attrRules[n];
						attr = attrRules[n + 1];
						name = attr[0];
						
						if (!(val = (name === "href" ? el.getAttribute(name, 2) : el.getAttribute(name)))) {
							if (!(val = el[this.attrMap[name] || name])) {
								break;
							}
						}
						
						if (!rule(val + "", attr[1])) {
							break;
						}
					}
					
					if(n === m) {
						matched.push(el);
					}
				}

				return matched;
			},	
			
		   	/**
		 	 * Filter HTMLElement matched class attribute
		 	 * 
		 	 * @param  {Array}   els
		 	 * @param  {String}  cls
		 	 * @return {Boolean}
		 	 */ 
		    filterClass: function(els, cls){
				var 
					i = 0,
					len = els.length,
					matched = [],
					clsName, rex;
				
				for(; i < len; i++) {
					el = els[i];
					if(clsName = el.className) {
						rex = new RegExp(clsName.replace(" ", "|"), "g");
						if(!cls.replace(rex, "")) {
							matched.push(el);
						}
					}
				}

				return matched;
			},										
			
			/**
			 * Filter HTMLElement 
			 * 
			 * @param  {HTMLElement} el
			 * @param  {String}      tag
			 * @param  {String}      cls
			 * @param  {Array}       attrRules
			 * @param  {Array}       pseudoRules
			 * @return {Boolean}
			 */
			filterEl: function(el, tag, cls, attrRules, pseudoRules) {
				if (tag !== "*" && el.nodeName.toLowerCase() !== tag) {
					return false;
				}
				
				if (cls && !this.filterClass([el], cls).length) {
					return false;
				}
				
				if (attrRules && !this.filterAttr([el], attrRules).length) {
					return false;
				}
				
				if (pseudoRules && !this.filterPseudo([el], pseudoRules).length) {
					return false;
				}				
				
				return true;
			},

		   /**
		 	* Reomve duplicate HTMLElement
		 	* 
		 	* @param  {Array} arr
		 	* @return {Array}
		 	*/
			makeDiff : function(arr){
				var 
					guid  = this.tagGuid++,
					len   = arr.length, 
					diff  = [], 
					i     = 0, 
					el, data;
				
				for (; i < len; i++) {
					el = arr[i];
					data = this.getElData(el);
					if (data.tagGuid !== guid) {
						diff.push(el);
						data.tagGuid = guid;
					}
				}
				
				return diff;
			},
			
			/**
			 * Get the data bind in HTMLElement
			 * 
			 * @param  {HTMLElement} el
			 * @return {Object}
			 */
			getElData: function(el) {
				var 
					data = el.mojoExpando;
					
				if(!data) {
					data = el.mojoExpando = {
						mQuery: {
							tagGuid: 1
						}
					};
				}
				
				if(!data.mQuery) {
					data.mQuery = {
						tagGuid: 1
					};
				}
				
				return data;
			}			
		}, 
		
		BaseRules = {
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}
 			*/			
			" " : function(contexts, tag, joQuery) {
				var 
					guid  = joQuery.tagGuid++,
					len   = contexts.length,
					arr   = [],
					i     = 0,
					n, m, nodes, el, pel;			
					
				for(; i < len; i++) {
					el  = contexts[i];
					if(pel = el.parentNode) {
						if(joQuery.getElData(pel).tagGuid === guid) {
							continue;
						}
						joQuery.getElData(el).tagGuid = guid;
					}
					
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
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}
 			*/					
			">" : function(contexts, tag) {
				var 
					arr = [], 
					len = contexts.length,
					i   = 0, el;			
				
				for(; i < len; i++) {
					el = contexts[i].firstChild;	
					while(el) {
						if(el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
						}
						el = el.nextSibling;							
					}												
				}
				
				return arr;					
			},	
			
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}
 			*/					
			"+" : function(contexts, tag) {
				var 
					arr = [], 
					len = contexts.length,
					i   = 0, el;	
					
				for (; i < len; i++) {
					el = contexts[i];
					while(el = el.nextSibling) {
						if(el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
							break;
						}
					}
				}
				
				return arr;											
			},					
			
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}
 			*/					
			"~" : function(contexts, tag, joQuery) {
				var 
					guid  = joQuery.tagGuid++,
					len   = contexts.length,
					arr   = [], 
					i     = 0,
					el, pel, data;

				for (; i < len; i++) {
					el = contexts[i];
					if (pel = el.parentNode) {
						if((data = joQuery.getElData(pel)).tagGuid === guid) {
							continue;
						}
						data.tagGuid = guid;
					}
					
					while(el = el.nextSibling) {
						if (el.nodeType === 1) {
							if(el.nodeName.toLowerCase() === tag || tag === "*") {
								arr.push(el);
							}
						}
					}
				}
						
				return arr;											
			}			
		},
		
		Attrs = {
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
		
		Pseudos = {
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
			
			"nth-child": function(el, param, joQuery) {
				var
				    pel, index, node, i, data;
				
				if ((pel = el.parentNode) && (data = joQuery.getElData(pel)).tagGuid !== param[0]) { 
					node = pel.firstChild;
					i = 1;
					while (node) {
						if (node.nodeType === 1) {
							joQuery.getElData(node).nodeIndex = i++;
						}
						node = node.nextSibling
					}
					data.tagGuid = param[0];
				}
					
				index = joQuery.getElData(el).nodeIndex;
				
				if (param[1] === "n") {
					index = index - param[3];
					param = param[2];
					return index * param >= 0 && index % param === 0;
				}
				
				return index === param[1] * 1;
			},
			
			not: function(el, params, joQuery) {
				var 
					i   = 0,
					len = params.length,
					param;
					
				for(; i < len; i++) {
					param = params[i];
					
					if(param[1]) {
						if("#" + el.id !== param[1]) {
							continue;
						}
						
						return false;
					}
					
					if(joQuery.filterEl(el, param[2], param[3], param[4], param[5])) {
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
		};
		
		mojoQuery.info = {
			author: "scott.cgi",
			version: "1.2.1"
		};
		// make mojoQuery globel
		window.mojoQuery = mojoQuery;
		
})(window);	