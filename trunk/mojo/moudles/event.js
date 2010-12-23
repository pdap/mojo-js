/**
 * mojo event moudle
 * 
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 */
(function(window, mojo){
	var 
		document = window.document,
		
		joEvent = {
			/**
			 * Init event
			 * 
			 * @param {String}   evtName     Event name
			 * @param {String}   evtType     Event type
			 * @param {Object}   evtVal      Event value object
			 * @param {String}   initMethod  Event init method
			 */
			initEvent: function(evtName, evtType, evtVal, initMethod) {
				var 
					p, evt;
				
				// Create event object
				if (document.createEvent) {
					evt = document.createEvent(evtType || "HTMLEvents");
					if (!initMethod) {
						initMethod = "initEvent";
					}
					evt[initMethod](evtName, evtVal.bubbles || true, evtVal.cancelable || false);
					
				} else if (document.createEventObject) {
					evt = document.createEventObject();
					for (p in evtVal) {
						evt[p] = evtVal[p];
					}
				}				
			},		
			
			/**
			 * Fire event
			 * 
			 * @param {HTMLElement} el
			 * @param {Object} evt      Event Object
			 * @param {Object} evtName  Event name
			 */
			fireEvent: function(el, evt, evtName) {
				if(el.dispatchEvent) {
					el.dispatchEvent(evt);
				} else if(el.fireEvent) {
					el.fireEvent("on" + evtName, evt);
				}
			},		
			
			/**
			 * Add event function
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      evtName  Event name
			 * @param {Function}    fn		 Event function
			 */
			addEvent: function(el, evtName, fn) {
				if(el.addEventListener) {
					el.addEventListener(evtName, fn, false);
				} else if(el.attachEvent) {
					el.attachEvent("on" + evtName, fn);
				}
			},		
			
			/**
			 * Remove event
			 * 
			 * @param {HTMLElement} el
			 * @param {String}      evtName Event name
			 * @param {Function}    fn	    Event function
			 */
			removeEvent: function(el, evtName, fn) {
				if(el.removeEventListener) {
					el.removeEventListener(evtName, fn, false);
				} else if(el.detachEvent) {
					el.detachEvent("on" + evtName, fn);
				}
			},
			
			/**
			 * Get event cache object which bind in element
			 * 
			 * @param {Object} elData Data object of element
			 * @return Cache object
			 */
			getMevent: function(elData) {
				return elData.mEvent || (elData.mEvent = {});
			}							
		};
		
		mojo.fn.extend({
			/**
			 * Add element event
			 * 
			 * addEvent(Object)
			 * addEvent(String, Function)
			 * addEvent(String, Object)
			 */
			addEvent: function(x, y) {
				var 
					index    = this.index,
					el       = this.el,
					argsCode = this.getArgsCode(arguments),
					// cache element event function
					mEvent   = joEvent.getMevent(this.elData),
					p, fn, args;
				
				if (argsCode === "1O") {
					for(p in x) {
						this.self.call(this, p, x[p]);
					}
					return;
				}
				
				if (!(p = mEvent[x])) {
					// cache element one type event function in array
					p = mEvent[x] = [];
				}
				
				switch(argsCode) {
					case "2SF":
						args = [];
						break;
					
					case "2SO":
						args = y.args || [];
						y    = y.fn;
				}	
				
				fn = function(event){
					y.apply({
						el   : el,
						self : y,
						index: index,
						event: event || window.event
					}, args);
				};
				
				fn.innerFn = y;
				
				p.push(fn);
				joEvent.addEvent(el, x, fn);
			},
			
			/**
			 * Remove element event
			 * 
			 * removeEvent()
			 * removeEvent(String)
			 * removeEvent(String, Function)
			 */
			removeEvent: function(x, y) {
				var		
					el       = this.el,
					argsCode = this.getArgsCode(arguments),
					mEvent   = joEvent.getMevent(this.elData),
					p, fns, i, len;
					
				if (argsCode === "0") {
					for (p in mEvent) {
						fns = mEvent[p];
						for (i = 0, len = fns.length; i < len; i++) {
							joEvent.removeEvent(el, p, fns[i]);
						}
					}
					mEvent = {};
					
					return;
				}	
					
				fns = mEvent[x] || [];
					
				switch(argsCode) {
					case "1S":
						for (i = 0, len = fns.length; i < len; i++) {
							joEvent.removeEvent(el, x, fns[i]);
						}
						fns.length = 0;
						break;
					
					case "2SF":
						for (i = 0, len = fns.length; i < len; i++) {
							if(y === fns[i].innerFn) {
								joEvent.removeEvent(el, x, fns[i]);
								fns.splice(i, 1);
								i--;
								len--;
							}
						}													
				}	
			}
			
		}, true);
	
})(window, mojo);
