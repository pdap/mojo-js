/**
 * mojoQuery JavaScript Library
 * http://mojo-js.appspot.com
 * 
 * Copyright (c) 2010 scott.cgi
 * Released under MIT License (http://mojo-js.appspot.com/MIT-License.txt)
 * 
 * Since  2009-11-11
 * Current Release Date: 2011-03-17 23:37 (UTC+08:00)
 */
(function(window){
	
	var 
		document = window.document,
		
		/**
		 * Select HTMLElements by css seletor
		 * 
		 * @param  {String} selector
		 * @param  {Undefined | String | HTMLElement | Array[HTMLElement] | NodeList} context
		 * @return {Array} Array of HTMLElement
		 */
		mojoQuery = function(selector, context) {
			return joQuery.query(selector, context);
		},
		
		joQuery = {
		    // Identifies HTMLElement whether matched in one query
		    tagGuid: 1,			
			
			attrMap: {
				"class": "className",
				"for": "htmlFor"
			},
			
			rex: {
				RE_RULE: /[ +>~]/g,
				NRE_RULE: /[^ +>~]+/g,
				TRIM_LR: /^ +| +$/g,
				TRIM_RE: / *([ +>~,]) */g,
				TRIM: / +/g,
				PSEU_PARAM: /\([^()]+\)/g,
				ATTR_PARAM: /[^\[]+(?=\])/g,
				ATTR: /[!\^$*|~]?=/,
				CLS: /\./g,
				PSEU: /[^:]+/g,
				NUM: /\d+/,
				NTH: /(-?\d*)n([+-]?\d*)/,
				RULES: /((?:#.+)*)([a-zA-Z*]*)([^\[:]*)((?:\[.+\])*)((?::.+)*)/
			},

			/**
			 * Get HTMLElement array by selector and context
			 * 
			 * @param  {String} selector  
			 * @param  {Undefined | String | HTMLElement | Array[HTMLElement] | NodeList} context  
			 * @return {Array} Array of HTMLElement 
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
									 
				selectors = this.replaceAttrPseudo(this.trim(selector)).split(",");
				
				context = contexts;
							
				// each selector split by comma
				for (i = 0, j = selectors.length; i < j; i++) {
					selector = selectors[i];
					
					// relative rule array 
					// add defalut rule " "
					rules = (" " + selector).match(this.rex.RE_RULE);
										
					// selector on both sides of relative rule  
					selector = selector.match(this.rex.NRE_RULE);
					
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
			 * Trim space
			 * 
			 * @param  {String} selector
			 * @return {String} Selector after tirm space
			 */
			trim: function(selector) {
				return selector
								// trim left and right space
								.replace(this.rex.TRIM_LR, "")	
								
								// trim relative rule both sides space
								.replace(this.rex.TRIM_RE, "$1");								
			},
			
			/**
			 * Replace attribute and pseudo selector which in "[]" and "()"
			 * 
			 * @param  {String} selector  
			 * @return {Array}  Selector split by comma
			 */
			replaceAttrPseudo: function(selector){
				var 
					pseuParams = [],
					attrParams = [];
				
				this.pseuParams = pseuParams;
				this.attrParams = attrParams;
				
				selector = selector
								// remove attribute selector parameter and put in array
								.replace(this.rex.ATTR_PARAM, function(matched){
									return attrParams.push(matched) - 1;
								});
				
				// remove pseudo selector parameter and put in array
				while(selector.indexOf("(") !== -1) {
					selector = selector.replace(this.rex.PSEU_PARAM, function(matched){
						return pseuParams.push(matched.substring(1, matched.length - 1)) - 1;
					});
				}
				
				return selector;					
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
				
				matched = relative[rule](contexts, rules[2] || "*", this);
				
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
			 * Parse selector and get complex selector
			 * 
			 * @param  {String} selector
			 * @return {Array}  Array of parsed rule
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
					// array of attritubte parse function
					rules[4] = this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams);
				}
				
				if (pseudos = rules[5]) {
					// array of pseudo parse function
					 rules[5] = this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams)
				}				
				
				return rules;	
			},			
			
			/**
			 * Get attribute parse functions
			 * 
			 * @param  {Array} attrs       
			 * @param  {Array} attrParams  
			 * @return {Array} Array of attribute parse function    
			 */
			getAttrRules: function(attrs, attrParams) {
				var
					arr = [],
					len = attrs.length,
					rex = this.rex.ATTR,
					i   = 0,
					attr;
				
				for(; i < len; i++) {
					attr = attrParams[attrs[i]].replace(this.rex.TRIM, "");
					
					if(this.rex.ATTR.test(attr)) {
						attr = RegExp["$'"];
						// [function, name, value] are put in arr
						arr.push(attributes[RegExp["$&"]], RegExp["$`"], attr);
					} else {
						// only has attribute name
						arr.push(attributes[" "], attr, "");
					}
				}	
				
				return arr;
			},		
			
			/**
			 * Get pesudo parse functions
			 * 
			 * @param  {Array} arrPseu 
			 * @param  {Array} pseuParams
			 * @return {Array} Array of pseudo parse function
			 */
			getPseudoRules: function(arrPseu, pseuParams) {
				var 
					arr  = [],
					i    = 0,
					len  = arrPseu.length,
					guid = this.tagGuid++,
					pseu;
				
				for(; i < len; i++) {
					pseu = arrPseu[i];
					
					// pesudo with parameter
					if (this.rex.NUM.test(pseu)) {
						// paramPseudos's object
						pseu = paramPseudos[RegExp["$`"]];						
						
						arr.push(
							true, 
							pseu.fn, 
							pseu.getParam(
								// pesudo parameter
								pseuParams[RegExp["$&"]].replace(this.rex.TRIM, ""), 
								this,
								guid
							)
						);
					} else {
						arr.push(false, pseudos[pseu], null);
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
					n, el, pseudo;
				
				for(; i < len; i++) {
					el = els[i];
					
					for (n = 0; n < m; n += 3) {
						pseudo = pseudoRules[n + 1];
						
						if (pseudoRules[n]) {
							// with parameter
							
							if (!pseudo(el, pseudoRules[n + 2], this)) {
								break;
							}
						} else {
							// no parameter
							
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
			 * Filter HTMLElement whether matched attribute rules
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
					n, el, rule, val, name;
				
				for(; i < len; i++) {
					el = els[i];
					
					for (n = 0; n < m; n += 3) {
						rule = attrRules[n];
						name = attrRules[n + 1];
						
						if (!(val = (name === "href" ? el.getAttribute(name, 2) : el.getAttribute(name)))) {
							if (!(val = el[this.attrMap[name] || name])) {
								break;
							}
						}
						
						if (!rule(val + "", attrRules[n + 2])) {
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
			},
			
			/**
			 * Add joQuery rex property
			 * 
			 * @param  {Object} obj
			 * @return {Object} joQuery
			 */
			addRex: function(obj) {
				var p;
				for(p in obj) {
					this.rex[p] = obj[p];
				}
				
				return this;
			},
			
			/**
			 * Add paramPseudos
			 * 
			 * @param  {Object} obj
			 * @return {Object} joQuery
			 */
			addParamPseudos: function(obj) {
				var p, pp;
				for(p in obj) { 
					for(pp in obj[p]){ 
						if(!paramPseudos[p]) {
							paramPseudos[p] = {};
						}
						paramPseudos[p][pp] = obj[p][pp];
					}
				}
				
				return this;
			},
			
			/**
			 * Extend joQuery property
			 * 
			 * @param  {Object} obj
			 * @return {Object} joQuery
			 */
			extend: function(obj) {
				var p;
				for(p in obj) {
					this[p] = obj[p];
				}
				
				return this;
			}			
		}, 
		
		relative = {
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
		
		attributes = {
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
		
		paramPseudos = {
			"nth-child": {
				getParam: function(param, joQuery, guid) {
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
						// param[0]: Identifies HTMLElement
						// param[1]: whether "nth-child()" has "n" parameter
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
				getParam: function(param, joQuery) {
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
		
		pseudos = {
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

			joQuery.addParamPseudos({
				"nth-child": {
					testStr: ":nth-child(n)"
				},
				
				not: {
					rex: {
						SINGLE: /[^ ][,.:\[]/
					},
					testStr: ":not(html)",
					testFn: function(param, rex) {
						if(rex.SINGLE.test(param) || param.indexOf(":not") !== -1) {
							return false;
						}
						return true;
					}					
				}
			})
			
			.addRex({
				UN_PARAMS: /(?:_\d+_)+/g,
				UN_WITH_COMMA: /[^,]*_\d+_[^,]*/g,
				TRIM_COMMA: /^,+|,+$|,+(?=,)/g,
				UN_WITH_RE: /([ +~>](?=_\d+_))/,
				UN_RE: /[ +>]|(?:~[^=])/,
				UN: /_\d+_/g,
				PSEU_NUM: /:[^:]+\d+/g,
				
				UNSUPPORTED: function() { 
					var rexStr = ["\\[[^!]+!=[^\\]]+\\]"], p;
					
					for (p in pseudos) {
						p = ":" + p;
						try {
							// no parameter pseudo
							document.querySelectorAll(p);
						} catch (e) { 
							rexStr.push(p);
						}
					}
					
					for(p in paramPseudos) {
						try {
							// parameter pseudo
							document.querySelectorAll(paramPseudos[p].testStr);						
						} catch(e) {
							rexStr.push(":" + p);
						}
					}					
					
					return new RegExp(rexStr.join("|"), "g");
				}.call(joQuery)
			})
			
			.extend({
				/**
				 * Replace unsupported selector and put it in array
				 * 
				 * @param  {String} selector
				 * @param  {Array}  params
				 * @param  {Array}  unsupporteds
				 * @retrun {String} Replaced selector 
				 */
				replaceUnsupported: function(selector, params, unsupporteds) {
					var 
						pseuParams  = [],
						NUM         = this.rex.NUM,
						PSEU_NUM    = this.rex.PSEU_NUM,
						PSEU_PARAM  = this.rex.PSEU_PARAM,
						UNSUPPORTED = this.rex.UNSUPPORTED,
						pp          = paramPseudos;  
					
					selector = this.trim(selector);
					
					// remove pseudo selector parameter and put in array
					while(selector.indexOf("(") !== -1) {
						selector = selector.replace(PSEU_PARAM, function(matched){
							return pseuParams.push(matched) - 1;
						});
					}
					
					if(pseuParams.length) {
						// replace unsupported paramter pseudo selector
						selector = selector.replace(PSEU_NUM, function(matched){
							var 
								p, param, s, testFn, o;
							
							NUM.test(matched);
							param = pseuParams[RegExp["$&"]];
							// pseudo name
							p     = RegExp["$`"];
							
							// get value of parameter
							// IE8 has something wrong with "PSEU_NUM.test(param)"
							// because "PSEU_NUM" has "g" paramter
							while(param.search(PSEU_NUM) !== -1) {
								param = param.replace(NUM, function(matched){
									return pseuParams[matched];
								});
							}
							
							s = p + param;
							
							if(p.search(UNSUPPORTED) !== -1) {
								// pseudo selector is unsupported then put it in array 
								// and replace it
								return "_" + (params.push(s) - 1) + "_"								
							} else {  
								o = pp[p.substring(1)];
								// test pseudo's parameter whether is all supported 
								if(testFn = o.testFn) {
									param = param.substring(1, param.length - 1);
									
									if(param.search(UNSUPPORTED) !== -1 || !testFn(param, o.rex)) {
										return "_" + (params.push(s) - 1) + "_"
									}
								}
								
								// then the matched pseudo is supported 
								// return  original value
								return s;
							}
						});
					}

					return selector
									// replace unuspported pseudo selector
									.replace(UNSUPPORTED, function(matched) {
										return "_" + (params.push(matched) - 1) + "_";
								    })
									.replace(this.rex.UN_WITH_COMMA, function(matched) {
										unsupporteds.push(matched);
										return "";
									}).replace(this.rex.TRIM_COMMA, "");
				},
				
				/**
				 * Query selector by browser native method
				 * 
				 * @param  {String} selector
				 * @param  {Array}  contexts
				 * @return {Array}  Array of HTMLElements
				 */
				queryByNative: function(selector, contexts) {
					var 
						i , el, id
						len, results, cache;
					
					if (contexts) {
						results = [];
						cache   = [];						
						for (i = 0, len = contexts.length; i < len; i++) {
							el = contexts[i];
							if (el === document) {
								results.push(selector);
							} else {
								if (!(id = el.id)) {
									id = "id" + this.tagGuid++;
									el.id = id;
									cache.push(el);
								}
								
								results.push("#" + id + " " + selector);
							}
						}
						
						
						for (i = 0, len = cache.length; i < len; i++) {
							cache[i].removeAttribute("id");
						}
						
						return this.makeArray(document.querySelectorAll(results.join(",")));
					} else {
						return this.makeArray(document.querySelectorAll(selector));
					}
				},
				
				/**
				 * Filter HTMLElements by unspported selector
				 * 
				 * @param  {String} selector
				 * @param  {Array}  els
				 * @return {Array}  Filtered HTMLElements array
				 */				
				filterEls: function(selector, els) {
					var rules, attrs, pseudos;
					
					rules = this.rex.RULES.exec(this.replaceAttrPseudo(selector));
					
					if (attrs = rules[4]) {
						els = this.filterAttr(els, this.getAttrRules(attrs.match(this.rex.ATTR_PARAM), this.attrParams));
					}
					
					if (pseudos = rules[5]) {
						els = this.filterPseudo(els, this.getPseudoRules(pseudos.match(this.rex.PSEU), this.pseuParams));
					}
					
					return els;
				},
				
				/**
				 * Rewrite query method using builtin method "querySelectorAll"
				 */
				query: function(selector, context) {
					var 
						i, len, s,
						str, unstr, arr, res, lastIndex,
						params, unsupporteds, results, st;
					
					switch (typeof context) {
						case "string":
							selector = context + " " + selector; 
							context  = null;
							break;
							
						case "object":
							if (context.nodeType) {
								context = [context];
							}
					}
					
					if(!this.rex.UNSUPPORTED.test(selector)) {
						return this.queryByNative(selector, context);
					} else {
						// array of unsupported selector which already replaced
						unsupporteds = []; 
						// replaced string for replace unsupported selector
						params       = []; 
					
						selector = this.replaceUnsupported(selector, params, unsupporteds);
						
						if(selector) {
							// if here, selector must be supported
							results = this.queryByNative(selector, context);
							st = selector;
						} else {
							results = [];
						}
						
						for(i = 0, len = unsupporteds.length; i < len; i++) {
							// supported and unspported selctor
							str = unstr = "";
							res = [];
							lastIndex = 0;							
							
							// if unsupported selector not follow by tag selector
							// then add "*"
							selector = (" " + unsupporteds[i]).replace(this.rex.UN_WITH_RE, "$1*"); 
							
							// move and merge selector support and unsupported parts 
							while((arr = this.rex.UN_PARAMS.exec(selector)) !== null) {
								// string form last postion to this UN_PARAMS matched start index
								s = selector.substring(lastIndex, arr.index); 
								
								// whether "s" has relative rule
								if(str.length && (lastIndex = s.search(this.rex.UN_RE)) !== -1) {
									// merge part of supported
									str += s.substring(0, lastIndex); 
									// add supported and unsupported
									res.push(str, unstr);
									// "s" has relative rule after UN_PARAMS matched
									str   = s.substring(lastIndex);
									unstr = "";
								} else {
									// means "s" not have unsupported
									str += s;
								}
								// merge part of unsupported
								unstr += arr[0];
								lastIndex = this.rex.UN_PARAMS.lastIndex;
							}
							
							// after last UN_PARAMS matched selector
							if((s = selector.substring(lastIndex))) {
								if((lastIndex = s.search(this.rex.UN_RE)) !== -1) {
									str += s.substring(0, lastIndex);
									s    = s.substring(lastIndex);
								} else {
									str += s;
									s = null;
								}
							}						

							res.push(str, unstr);
							
							if(context) {
								arr = context;
							}
							
							for (str = 0, unstr = res.length; str < unstr; str += 2) {
								arr = this.filterEls(res[str + 1].replace(this.rex.UN, function(matched) {
									return params[matched.substring(1, matched.length - 1)];
								}), this.queryByNative(res[str], arr));
							}
							
							if(s) {
								arr = this.queryByNative(s, arr);
							}
							
							results = results.concat(arr);
						}
						
						if((st && st.indexOf(",") !== -1) || len > 1) {
							// if here, may hava duplicate HTMLElement
							return this.makeDiff(results);
						}
						
						return results;
					} 
				}
			});
		}
		
		mojoQuery.info = {
			author: "scott.cgi",
			version: "1.4.0"
		};
		
		// make mojoQuery globel
		window.mojoQuery = mojoQuery;
		
})(window);	