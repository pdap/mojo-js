/**
 * Copyright (c) 2010 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-9-1
 * Nightly Builds
 */ 
(function(window){ 
	var 
		document = window.document,
		
		mojo = window.mojo = function(selector, context) {
			return new mo(selector, mojo.querySelector(selector, context));
		},
		
		/**
		 * the mojo return object
		 * 
		 * @param {String} selector
		 * @param {Array} elements
		 */
		mo = function(selector, elements) {
			this.selector = selector;
			this.elements = elements;
		},

		jo = {
			
			/**
			 * call the function on each element
			 * 
			 * @param {Object}   target  
			 * @param {String}   name   
			 * @param {Function} method  
			 */
			applyOnEach: function(target, name, method) {
				target[name] = function() {
					var 
						els = this.elements, 
						len = els.length, 
						i = 0, 
						retVal = [], 
						el, ctx;	

					for (; i < len; i++) {
						el = els[i];
						ctx = {
							el: el,
							index: i,
							retVal: retVal,
							self: method
						};
						if (method.apply(ctx, arguments) === false) {
							break;
						}
					}
					
					return retVal.length ? retVal : this;										
				};	
			}
		};
		
	mojo.fn = mo.prototype;
	
	/**
	 * extend mojo and mo object 
	 * 
	 * @param {Object} o 
	 * @param {Boolean} isEach 
	 */
	mojo.extend = mojo.fn.extend = function(o, isEach) {
		var p;
		if (isEach) {
			for (p in o) {
				jo.applyOnEach(this, p, o[p]);
			}
		} else {
			for (p in o) {
				this[p] = o[p];
			}
		}
		
		return this;
	};
	
})(window);
