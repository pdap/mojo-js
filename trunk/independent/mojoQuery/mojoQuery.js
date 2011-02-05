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
				R_RULE: /[ +>~]/g,
				NR_RULE: /[^ +>~]+/g,
				TRIM_LR: /^ +| +$/g,
				TRIM_ALL: / *([ +>~,]) */g,
				PSEU_PARAM: /\([^()]+\)/g,
				ATTR_PARAM: /[^\[]+(?=\])/g,
				ATTR: /=|!=|\^=|\$=|\*=|~=|\|=/,
				CLS: /\./g,
				PSEU: /[^:]+/g,
				NUM: /\d+/,
				NTH: /(-?\d*)n([+-]?\d*)/,
				RULES: /((?:#.+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?::.+)*)/
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
									 
				selectors = this.format(selector);
				
				context = contexts;
							
				// each selector split by comma
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					// relative rule array 
					// add defalut rule " "
					rules = (" " + selector).match(this.rex.R_RULE);
										
					// selector on both sides of relative rule  
					selector = selector.match(this.rex.NR_RULE);
					
					// each iteration, use before parse result as this context
					contexts = context;
					
					// parse selector by each relative rule
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
			 * Format selector
			 * 
			 * @param  {String} selector  
			 * @return {Array}  Selector split by comma
			 */
			format: function(selector){
				var 
					pseuParams = [],
					attrParams = [];
				
				this.pseuParams = pseuParams;
				this.attrParams = attrParams;
				
				selector = selector
								// trim left and right space
								.replace(this.rex.TRIM_LR, "")	
						
								// trim relative rule both sides space
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
				
				matched = Relative[rule](contexts, rules[2] || "*", this);
				
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
			 * @return {Array}  Parsed selector rules array
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
					// attritubte rules parse function array
					rules[4] = this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams);
				}
				
				if (pseudos = rules[5]) {
					// pseudo rules parse function array
					 rules[5] = this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams)
				}				
				
				return rules;	
			},			
			
			/**
			 * Get attribute rules 
			 * 
			 * @param  {Array} attrs       
			 * @param  {Array} attrParams  
			 * @return {Array} Array of attribute rules    
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
			 * Get pesudo rules
			 * 
			 * @param  {Array} pseudos
			 * @param  {Array} pseuParams
			 * @return {Array} Array of pseudo rules
			 */
			getPseudoRules: function(pseudos, pseuParams) {
				var 
					arr  = [],
					i    = 0,
					len  = pseudos.length,
					guid = this.tagGuid++,
					name, param;
				
				for(; i < len; i++) {
					name = pseudos[i];
					// pesudo with parameter
					if (this.rex.NUM.test(name)) {
						// pesudo parameter
						param = pseuParams[RegExp["$&"]];
						// ParamPseudos's attribute object
						name = ParamPseudos[RegExp["$`"]];
						
						arr = arr.concat([true, name.fn, name.getParam(this, param, guid)]);
					} else {
						arr = arr.concat([false, Pseudos[name], null]);
					}
				}	

				return arr;
			},
			
			/**
			 * Filter HTMLElement whether matched pseudo rules
			 * 
			 * @param  {Array} els
			 * @param  {Array} pseudoRules
			 * @return {Array} Matched HTMLElement array   
			 */
			filterPseudo: function(els, pseudoRules){
				var 
					len = els.length, 
					i   = 0, 
					m   = pseudoRules.length,
					matched = [],
					n, el, pseudo, hasParam;
				
				for(; i < len; i++) {
					el = els[i];
					for (n = 0; n < m; n += 3) {
						hasParam = pseudoRules[n];
						pseudo   = pseudoRules[n + 1];
						
						if (hasParam) {
							if (!pseudo(el, pseudoRules[n + 2], this)) {
								break;
							}
						} else {
							if(!pseudo(el)) {
								break;
							}	
						}
					}
					
					if(n === m) {
						matched.push(el);
					}
				}

				return matched;
			},	
			
			/**
			 * Filter HTMLElement whether matched attribute rule
			 * 
			 * @param  {Array}  els
			 * @param  {Array}  attrRules
			 * @return {Array}  Matched HTMLElement array
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
		 	 * Filter HTMLElement whether matched class attribute
		 	 * 
		 	 * @param  {Array}   els
		 	 * @param  {String}  cls
		 	 * @return {Array}   Matched HTMLElement array
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
			 * @return {Boolean}     Whether HTMLElement matched
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
		 	* @return {Array} Unique HTMLElement array
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
			 * @return {Object}      Data bind in HTMLElement
			 */
			getElData: function(el) {
				var 
					data = el.mojoExpando;
					
				if(!data) {
					data = el.mojoExpando = {
						mQuery: {
							tagGuid: 0
						}
					};
				}
				
				if(!(data = data.mQuery)) {
					data = {
						tagGuid: 0
					};
				}
				
				return data;
			}			
		}, 
		
		Relative = {
		   /**
 			* Get matched HTMLElement
 			*
 			* @param  {Array}  contexts   
 			* @param  {String} tag        
		  	* @return {Array}  Matched HTMLElement array
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
		  	* @return {Array}  Matched HTMLElement array
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
		  	* @return {Array}  Matched HTMLElement array
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
		  	* @return {Array}  Matched HTMLElement array
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
				return attrVal !== inputVal;
			},
			
			"^=" : function(attrVal, inputVal) {
				return attrVal.indexOf(inputVal) === 0;
			},
			
			"$=" : function(attrVal, inputVal) {
				return attrVal.substring(attrVal.length - inputVal.length) === inputVal;
			},
			
			"*=" : function(attrVal, inputVal) {
				return attrVal.indexOf(inputVal) !== -1
			},
			
			"~=" : function(attrVal, inputVal) {
				return (" " + attrVal + " ").indexOf(" " + inputVal + " ") !== -1;
			},
			
			"|=" : function(attrVal, inputVal) {
				return attrVal === inputVal || attrVal.substring(0, inputVal.length + 1) === inputVal + "-";
			}
		},
		
		ParamPseudos = {
			"nth-child": {
				getParam: function(joQuery, param, guid) {
					if (joQuery.rex.NTH.test(param === "odd" && "2n+1" ||
										     param === "even" && "2n"  || param)) {
						param = RegExp.$1;
						
						param === "" ? 
						param = 1 : 
						param === "-" ? 
						param = -1 : 
						param = param * 1;
						
						// param[0]: Identifies HTMLElement
						// param[1]: whether "nth-child()" has "n" parameter
						// param[2]: parameter before "n"
						// param[3]: paramter after "n"
						param = [guid, true, param, RegExp.$2 * 1];
						
						// optimize "nth:child(n)" 
						// this pseudo means all child nodes fit
						// so no need execute this pseudo filter
						//if (param[2] === 1 && param[3] === 0) {
						//	return;
						//}
					} else {
						// param[2]: number in like "nth-child(5)"
						param = [guid, false, param * 1];
					}		
					
					return param;				
				},
				fn: function(el, param, joQuery) {
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
					
					if (param[1]) {
						index = index - param[3];
						param = param[2];
						return index * param >= 0 && index % param === 0;
					}
					
					return index === param[2];					
				}
			},
			
			not: {
				getParam: function(joQuery, param) {
				    // ":not()" may has "," in parameter
					// like: ":not(a, p)"
					var rules = param.split(",");
					param = [];
					while(rules.length) {
						param.push(joQuery.getRules(rules.pop()));
					}			
					
					return param;		
				},
				fn: function(el, params, joQuery) {
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
				}
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
			
			enabled: function(el) {
				return el.disabled === false;
			},
			
			disabled: function(el) {
				return el.disabled === true;
			},
			
			checked: function(el) {
				return el.checked === true;
			},
			
			empty: function(el){
				return !el.firstChild;
			}				
		};
		
		if(document.querySelectorAll) {
			try {
				// test browser has capable of
                // converting a NodeList to an array using builtin methods
				Array.prototype.slice.call(document.documentElement.childNodes, 0);
				joQuery.slice = Array.prototype.slice;
				joQuery.makeArray = function(nodeList) {
					return this.slice.call(nodeList, 0);
				};
			} catch(e) {
				joQuery.makeArray = function(nodeList) {
					var 
						results = [],
						i       = 0,
						len     = nodeList.length;
					
					for(; i < len; i++) {
						results.push(nodeList[i]);
					}	
					
					return results;
				}
			}
			
			joQuery.rex.UNSUPPORT = function(pseudo) {
				var 
					rexStr = ["(?:\[.+!=.+\])"],
					p;
				
				for(p in pseudo) {
					try {
						switch(p) {
							case "nth-child":
								
						}
					} catch(e) {
						
					}
				}
				
				return new RegExp(rexStr.join("|"), g);	
			}.call(joQuery, pseudo);
			
			/**
			 * Build selector by HTMLElement array context
			 * 
			 * @param {String} selector
			 * @param {Array}  contexts
			 * @param {Array}  cache
			 */
			joQuery.buildSelector = function(selector, contexts, cache) {
				var 
					i = 0,
					len = contexts.length,
					results = [], el, id;
				
				for(; i < len; i++) {
					el = contexts[i];
					if(el === document) {
						results.push(selector);
					} else {
						if (!(id = el.id)) {
							id = "_id_" + this.tagGuid++;
							el.id = id;
							cache.push(el);
						}
						
						results.push("#" + id + " " + selector);
					}
				}	
				
				return results.join(",");
			};
			
			/**
			 * Rewrite query method using builtin method "querySelectorAll"
			 */
			joQuery.query = function(selector, context) {
				var 
					cache = [], i, len, params;
				
				switch (typeof context) {
					case "string":
						selector = context + " " + selector; 
						break;
						
					case "object":
						selector = this.buildSelector(selector, context.nodeType ? [context] : context, cache);
				}
				
				try {
					return this.makeArray(document.querySelectorAll(selector));
				} catch(e) {
					params = [];
					selector.replace(this.rex.UNSUPPORT, function(matched) {
						
					});
					
				} finally {
					for(i = 0, len = cache.length; i < len; i++) {
						cache[i].removeAttribute("id");
					}
				}
				
			};
		}
		
		mojoQuery.info = {
			author: "scott.cgi",
			version: "1.3.0"
		};
		// make mojoQuery globel
		window.mojoQuery = mojoQuery;
		
})(window);	