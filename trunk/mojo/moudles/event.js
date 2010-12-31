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
			// Generates a unique ID
			guid: 1,
			
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
					guid     = joEvent.guid++,
					// cache element event function
					mEvent   = joEvent.getMevent(this.elData),
					type, fn, args, undefined;
				
				if (argsCode === "1O") {
					for(type in x) {
						this.self.call(this, type, x[type]);
					}
					return;
				}
				
				if (!(type = mEvent[x])) {
					// cache element one type event
					type = mEvent[x] = {};
				}
				
				switch(argsCode) {
					case "2SF":
						args = [];
						break;
					
					case "2SO":
						args = y.args === undefined ? [] : [].concat(y.args);
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
				
				if(y.mEventGuid && type[y.mEventGuid]) {
					// more than one event added on element
					// which same event type and same function
					delete type[y.mEventGuid];
				}
				
				y.mEventGuid = guid;
				type[guid]   = fn;
				
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
					type, fns, guid;
					
				if (argsCode === "0") {
					for (type in mEvent) {
						fns = mEvent[type];
						for(guid in fns) {
							joEvent.removeEvent(el, type, fns[guid]);
						}
					}
					mEvent = {};
					
					return;
				}	
					
				fns = mEvent[x] || {};
					
				switch(argsCode) {
					case "1S":
						for(guid in fns) {
							joEvent.removeEvent(el, x, fns[guid]);
						}
						mEvent[x] = {};
						break;
					
					case "2SF":
						if(y.mEventGuid && fns[y.mEventGuid]) {
							delete fns[y.mEventGuid];
						}												
				}	
			}
			
		}, true);
	
})(window, mojo);
