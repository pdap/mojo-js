/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window){ 
	
	var 
		
		mojoFx = function(arg) {
			return new moFx(arg);
		},
		
		/**
		 * Animation object inculde animation target HTMLElements and method
		 * 
		 * @param {Array/NodeList/HTMLElement} arg
		 */
		moFx = function(arg) {
			this.elements = arg.length ? arg : [arg];
		},		

		joFx = {
			
			// easing algorithm
			easing: {
			   /**
		 	    * @param {Number} t	current time   
		 	    * @param {Number} b	beginning value 
		 	    * @param {Number} c	change value    
		        * @param {Number} d	duration        
		 	    */
				swing: function(t, b, c, d){
					return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
				}
			},
			
			// animation executor time id
			timeId: 0,
			
			// current animation elements
			animEls: [],
			
			/**
			 * Add element into global animation array
			 * Add element animation step
			 * 
			 * @param {Array}  els  Array of HTMLElement
			 * @param {Object/Undefined} cfg  Animation configuration object
			 * @return joFx
			 */
			add: function(els, cfg) {
				var 
					aEls  = this.animEls,
					len   = els.length,
					n     = arguments.length,
					i     = 0,
					el, data;
					
				for(; i < len; i++) {
					el = els[i];
					
					data = this.getElData(el);
					
					if(!data.isAnim) {
						aEls.push(el); 
						data.isAnim = true;
					} 
					
					if(n === 2) {
						data.queStep.push(cfg);
					}
				}					
				
				return this;
			},			
			
			/**
			 * Add elements animation callback step
			 * 
			 * @param {Array}  els  Array of HTMLElement
			 * @param {Object} cfg  Callback function configuration object
			 * @return joFx
			 */
			addCallback: function(els, cfg) {
				var
					callback = [],
					obj = {
						arguments: [],
						context: window,
						complete: null
					}, p;
				
				for(p in obj) {
					callback[p] = cfg[p] || obj[p];
				}	
				
				return this.add(els, callback);
			},

			/**
			 * Get animation step array
			 * 
			 * @param {HTMLElement} el  HTMLElement
			 * @param {Object}      cfg Animation configuration object
			 */
			getElStep: function(el, cfg) {
				var 
					eachEasing, easing, prop,
					fxs, step,
					p, val, fx;
				
				if("length" in cfg) {
					// only has complete function	
					return cfg;
				} else {
					fxs = cfg.fxs;
					step = [];					
				}
				
				if (!fxs) {
					fxs = [];
					prop   = cfg.prop;
					easing = cfg.easing;
					eachEasing = cfg.eachEasing;
					
					for (p in prop) {
						// each property animation object
						fx  = {};
						
						// property name
						fx.name = p;
						// easing type
						fx.easing = eachEasing[p] || easing;
						// property value
						val = prop[p]; 
						
						switch (typeof val) {
							case "number":
								fx.symbol = "";
								fx.val = val;
								fx.unit = "px";
								break;
								
							// Property value is an array
							// the 2nd parameter is easing	
							case "object":
								if (val.length > 1) {
									fx.easing = val[1];
								}
								val = val[0];
								// here no break
								
							case "string":
								if (p.toLowerCase().indexOf("color") === -1) {
									val = /(\+=|-=)?(-?\d+)(\D*)/.exec(val);
									fx.symbol = val[1];
									fx.val = val[2];
									fx.unit = val[3] || "px";
									
								// color property					
								} else {
									fx.val = val;
									// unit use "#" when color property
									fx.unit = "#";
								}
						}
						
						fxs.push(fx);
					}
					
					cfg.fxs = fxs;
				}
				
				step.complete  = cfg.complete;
				step.context   = cfg.context;
				step.arguments = cfg.arguments;
				step.duration  = cfg.duration;
				// element current animation time
				step.t   = 0;
				
				return this.setBc(el, fxs, step);	
			},

			/**
			 * Set animation step begin and change value
			 * 
			 * @param  {HTMLElement} el    HTMLElement
			 * @param  {Array}       fxs   Animation configuration 
			 * @return {Array}       step  Animation step
			 */
			setBc : function(el, fxs, step) {
				var 
					len = fxs.length,
					i   = 0,
					undefined,
					fx, b, c, p, s, u, e;
					
				for(; i < len; i++) {
					fx = fxs[i];
					
					p = fx.name;
					s = fx.symbol;
					c = fx.val;
					u = fx.unit;
					e = this.easing[fx.easing];
					
					if (u !== "#") {
						// element style property
						if (el[p] === undefined) {
							// get current style value
							b = parseFloat(this.getElStyle(el, p)); 
							if(isNaN(b)) {
								b = 0;
							}
							
						} else {
							b = el[p];
							// unit use "&" when not style property
 							u = "&";
						}
						
						// set change value by symbol
						switch (s) {
							case "+=":
								c = c * 1;
								break;
								
							case "-=":
								c = c * 1 - c * 2;
								break;
								
							default:
								c = c * 1 - b;
						}
						
						if (c === 0) {
							continue;
						}
						
					} else {
						b = this.getRgb(this.getElStyle(el, p));
						c = this.getRgb(c);
						
						// set RGB value
						c[0] -= b[0];// red
						c[1] -= b[1];// green
						c[2] -= b[2];// blue
						
						if (c.join("") === "000") {
							continue;
						}
					}
					
					step.push({
						p: p.replace(/[A-Z]/g, "-$&"),
						b: b,
						c: c,
						u: u,
						e: e
					});
				}
				
				return step;
			},
			
			/**
			 * Start global animation executor
			 */
			animStart : function() {
				var 
				    self, start;	
				
				if (!this.timeId) {
				    self  = this;
					start = new Date().getTime();					
					
					this.timeId = window.setInterval(function(){
						var end = new Date().getTime();
						self.updateEl(end - start);
						start = end;
					}, 13);
				}
			},
			
			/**
			 * Update element style
			 * 
			 * @param {Number} stepTime  Each step interval 
			 */
			updateEl : function(stepTime) {
				var 
					aEls = this.animEls,
					len  = aEls.length,
					i    = 0,
					el, que, cur, data;
			
				for(; i < len; i++) {
					el = aEls[i];
					
					data = this.getElData(el);
					
					// element animation queue
					que = data.queStep;
					
					// element current animation step
					cur = que.curStep || (que.curStep = this.getElStep(el, que.shift()));
					
					while(!cur.length) {
						if (cur.complete) {
							cur.complete.apply(cur.context, cur.arguments.concat(el));
						}
						
						if(cur = que.shift()) {
							cur = que.curStep = this.getElStep(el, cur);
						} else {
							// element animation complete
							
							aEls.splice(i, 1);
							data.isAnim = false;
							que.curStep = null;
							i--;
							
							// global animation complete
							if ((len = aEls.length) === 0) {
								window.clearInterval(this.timeId);
								this.timeId = 0;
								return;
							}			
											
							break;
						}
					}
					
					if (cur) {
						if ((cur.t += stepTime) >= cur.duration) {
							cur.t = cur.duration;
							this.step(el, cur);
							cur.length = 0;
						} else {
							this.step(el, cur);
						}
					} 
				}					
			},
			
			/**
			 * Animation step
			 * 
			 * @param {HTMLElement} el    HTMLElement
			 * @param {Array}       step  Animation step info object
			 */
			step: function(el, step) {
				var 
					len = step.length,
					sty = ";",
					d   = step.duration,
					t   = step.t,
					i   = 0,
					f, p, b, c, u, e;

				for(; i < len; i++) {
					f = step[i]; 
					
					p = f.p; 
					b = f.b;
					c = f.c;
					u = f.u;
					e = f.e; 
					
					switch (u) {
						case "&" :
							el[p] = e(t, b, c, d);
							continue;
						
						case "#" :
							sty += p + ":rgb(" +
								   Math.ceil(e(t, b[0], c[0], d)) + "," +
								   Math.ceil(e(t, b[1], c[1], d)) + "," +
								   Math.ceil(e(t, b[2], c[2], d)) + ");";
							break;
							
						default:				
							if(p === "opacity") {
								p = e(t, b, c, d);
								sty += "opacity:" + p + ";filter:alpha(opacity=" + p * 100 + ");";								
							} else {
								sty += p + ":" + e(t, b, c, d) + u + ";";								
							}
					}
				}	

				el.style.cssText += sty;
			},
			
			/**
			 * Get the animation data on element
			 * 
			 * @param {HTMLElement} el HLTMLElement
			 * @return {Object}        mojoFx element animation data
			 */
			getElData: function(el) {
				var x;
				if(!(x = el.mojoData)) {
					x = el.mojoData = {};
				}
				
				if (!x.mojoFx) {
					x.mojoFx = {
						// animation queue
						queStep: [],
						
						// whether the element in animation
						isAnim: false
					};
				}
				
				return x.mojoFx;				
			},
			
			
			/**
			 * Get property value of element css style
			 * 
			 * @param  {HTMLElement} el HTMLElement
			 * @param  {String}      p	Css property name
			 * @return {String} 	    Css property value			
			 */
			getElStyle: function(el, p) { 
				var 
					curElSty = el.currentStyle || window.getComputedStyle(el, null),
					elSty    = el.style;
				
				if(p === "opacity") {
					return elSty.opacity || 
						curElSty.opacity ||
						(el.filters.alpha ? el.filters.alpha.opacity : 100) / 100;
				}
				
				return elSty[p] || curElSty[p];
			},
			
			/**
			 * Get color property value to decimal RGB array
			 * 
			 * @param  {String} color Css color style value
			 * @return {Array}     	  Decimal RGB value array
			 */
			getRgb: function(color) {
				var 
					rgb, i;
				
				if(color.indexOf("#") === 0) {
					// #000
					if(color.length === 4) {
						color = color.replace(/\w/g, "$&$&");
					}
					
					rgb = [];
					
					// #000000
					for (i = 0; i < 3; i++) {
						rgb[i] = parseInt(color.substring(2 * i + 1, 2 * i + 3), 16);
					}					
				
				// rgb(0,0,0)
				} else {	
				   if (color === "transparent" || color === "rgba(0, 0, 0, 0)") {
				   		rgb = [255, 255, 255];
				   } else {
				   		rgb = color.match(/\d+/g);
				   		for (i = 0; i < 3; i++) {
				   			rgb[i] = parseInt(rgb[i]);
				   		}
				   }
				}

				return rgb;				
			}											
										
		};
		
		
		moFx.prototype = {
			/**
			 * Custom animation property and fire it
			 * 
			 * @param  {Object} prop	Element style configuration object
			 * @return {Object} moFx
			 */
			anim: function(prop) {
				var 
					// animation configuration object
					cfg = {
						prop: prop,
						
						duration: 400,
						
						complete: null,
						
						easing: "swing",
						
						eachEasing: {},
						
						// context of callback function
						context: window,
						
						// arguments of callback funtion
						arguments: []
					},
					len = arguments.length,
					i   = 1,
					p, param;

				for(; i < len; i++) {
					param = arguments[i];
					switch(typeof param) {
						case "number":
							cfg.duration = param;
							break;
						
						case "string":
							cfg.easing = param;
							break;
							
						case "function":
							cfg.complete = param;
							break;
						
						// optional object configuration
						case "object":
							for(p in param) {
								cfg[p] = param[p];
							}			
					}
				}
				
				// bind configuration object to element
				// set element into global animation array
				// start animation
				joFx.add(this.elements, cfg).animStart();
				
				return this;				
			},
			
			/**
			 * Stop element animation
			 * 
			 * @param {Boolean} clearQueue  Clear element animation queue	 
			 * @return {Object} moFx
			 */
			stop: function(clearQueue) {
				var 
					els = this.elements,
					len = els.length,
					getElData = joFx.getElData,
					i = 0, el;
				
				for(; i < len; i++) {
					el = els[i];
					
					el = getElData(el).queStep;
					
					if(el.curStep) {
						el.curStep.length = 0;
					}
					
					if(clearQueue) {
						el.length = 0;
					}
				}	
				
				return this;
			},
			
			/**
			 * Set a timer to delay execution aniamtion queue
			 * 
			 * @param {Number} t     Delay times
			 * @return{Object} moFx
			 */
			delay: function(t) {
				var 
				 	els = this.elements,
					count = 0;
				
				joFx.addCallback(els, {
					arguments: [els, els.length, t],
					complete: function(els, len, t) {
						if (++count === len) {
							window.setTimeout(function(){
								joFx.add(els).animStart();
							}, t);
						}
					}
				}).add(els, null);
				
				return this;
			}							
		};
		
		
		mojoFx.extend = function(o) {
		 	var p;
			for(p in o) {
				this[p] = o[p];
			}
			
			return this;
		};
		
		
		mojoFx.extend({
			info: {
				author: "scott.cgi",
				version: "1.1.0"
			},
			
			easing: joFx.easing,
			
			/**
			 * Add easing algorithm
			 */
			addEasing: function() {
				var 
					easing = this.easing,
					p, o; 
				
				switch(arguments.length) {
					case 1:
						o = arguments[0];
						for(p in o) {
							easing[p] = o[p];
						}
						break;
					
					case 2:
						p = arguments[0];
						o = arguments[1];
						easing[p] = o;	
				}
				
				return this;
			}			
		});
		
		// make mojoFx global
		window.mojoFx = mojoFx;	
	
})(window);
