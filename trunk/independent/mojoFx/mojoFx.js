/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2010-05-16
 * Nightly Builds
 */

(function(window){ 
	
	var 
		mojoFx = {
			
			/**
			 * set animation element
			 * 
			 * @param  {HTMLElement/Array/NodeList} arg  
			 * @return {Object} mojoFx
			 */
			set: function(arg) {
				joFx.arrEls = arg.length ? arg : [arg];
				return this;
			},

			/**
			 * custom animation property and fire it
			 * 
			 * @param  {Object} prop	element style configuration object
			 * @return {Object} mojoFx
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
				joFx.addElStep(cfg);
				
				// start animation
				if(!joFx.timeId) {
					joFx.animStart();
				} 
				
				return this;				
			},
			
			/**
			 * stop element animation
			 * 
			 * @param {Boolean} clearQueue  clear element animation queue	 
			 * @return {Object} mojoFx
			 */
			stop: function(clearQueue) {
				var 
					els = joFx.arrEls,
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
			 * add easing algorithm
			 */
			addEasing: function() {
				var 
					easing = joFx.easing,
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
			},
			
			/**
			 * get easing object
			 */
			getEasing: function() {
				return joFx.easing;
			}
						
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
			
			// to perform the animation element array
			arrEls: null,
			
			// current animation elements
			animEls: [],
			
			/**
			 * bind configuration object to element
			 * set element into global animation array
			 * 
			 * @param {Object} cfg	animation configuration object
			 */
			addElStep: function(cfg) {
				var 
					els   = this.arrEls,
					aEls  = this.animEls,
					len   = els.length,
					i     = 0,
					el, data;
					
				for(; i < len; i++) {
					el = els[i];
					
					data = this.getElData(el);
					
					if(!data.isAnim) {
						aEls.push(el);
						data.isAnim = true;
					} 
					
					data.queStep.push(cfg);
				}					
				
			},

			/**
			 * get animation step array
			 * 
			 * @param {HTMLElement} el   
			 * @param {Object} cfg  animation configuration object
			 */
			getElStep: function(el, cfg) {
				var 
					eachEasing = cfg.eachEasing,
					easing = cfg.easing,
					prop   = cfg.prop,
					fxs    = cfg.fxs,
					step   = [],
					p, val, fx;
				
				if (!fxs) {
					fxs = [];
					
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
			 * set animation step begin and change value
			 * 
			 * @param  {HTMLElement} el
			 * @param  {Array}       fxs   animation configuration 
			 * @return {Array}       step  animation step
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
			 * start global animation executor
			 */
			animStart : function() {
				var 
				    self  = this,
					start = new Date().getTime();	
				
				this.timeId = window.setInterval(function(){
					var end = new Date().getTime();
					self.updateEl(end - start);
					start = end;
				}, 13);
			},
			
			/**
			 * update element style
			 * 
			 * @param {Number} stepTime	   each step interval 
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
							cur.arguments.push(el);
							cur.complete.apply(cur.context, cur.arguments);
						}
						
						if(cur = que.shift()) {
							cur = que.curStep = this.getElStep(el, cur);
						} else {
							// element animation complete
							
							aEls.splice(i, 1);
							data.isAnim = false;
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
			 * animation step
			 * 
			 * @param {HTMLElement} el    
			 * @param {Array}       step 
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
			 * get the animation data on element
			 * 
			 * @param {HTMLElement} el
			 * @return {Object}     mojoFx element animation data
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
			 * get property value of element style
			 * 
			 * @param  {HTMLElement} el 
			 * @param  {String}      p	property name
			 * @return {String} 	 property value			
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
			 * get color property value to decimal RGB array
			 * 
			 * @param  {String} color	property name
			 * @return {Array}  rgb   	decimal RGB value array
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
		
		// make mojoFx global
		window.mojoFx = mojoFx;	
	
})(window);
