/**
 * Copyright (c) 2009 scott.cgi
 * http://mojo-js.appspot.com
 * under MIT License
 * Since  2009-9-1
 * Version 0.65
 * Date 2009-11-16
 */
(function(window,undefined){
	var 
		//函数域中的文档对象引用
		document = window.document,
		
		
	    /**
 	 	 * 动画缓冲算法
	     * 每个效果都分三个缓动方式:
 	     * easeIn：从0开始加速的缓动
 	     * easeOut：减速到0的缓动
 	     * easeInOut：前半段从0开始加速,后半段减速到0的缓动
	     */
	    tween = {
	    	swing : {
				/**
				 * @param {Number} t current time 当前时间
				 * @param {Number} b beginning value 初始值
				 * @param {Number} c change in value 变化量
				 * @param {Number} d duration 持续时间
				 */
	  	    	easeIn : function(t, b, c, d){
	  		    	return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
	  	        }
	        }	
        }, 
		
		//css选择器解析引擎
		shimmer,
		
		//内部对象,mojo方法实现的辅助对象
		jo,

	 	/**
	 	 * 执行jo对象的init方法返回的对象,就是mojo函数返回的对象
	     * @param {String or HTMLElement} selector 选择器,字符串或者DOM元素类型
	     * @param {Array} arr 选择器对应的DOM元素的数组
	     */	
		mo = function(selector,arr) {
			//选择器
			this.selector = selector;
			//选择器对应的HTMLElement元素数组
			this.ems = arr;
			//动画id数组
			this.tids = [];
			//动画回调函数数组,每一个anim函数后回调
			this.ends = [];
			//缓存mojo对像上数据的容器
			this.datas = {};			
		},
		
		/**
		 * mojo变量注册到window上,并赋值为构造mo对象的函数
		 * @param {String or HTMLElement} selector
		 */
	    mojo = window.mojo = function(selector){
			return jo.init(selector);
		};


	//mo对象的原型链,也就是mojo对象原型链
	mojo.fn = mo.prototype = {
		/**
		 * 注册对应HTMLElement元素上的处理函数
		 * @param {Function} callback
		 */
		each : function(fn){
			var ems = this.ems,
				i = 0,
				j = ems.length;
			for (; i < j; i++) {
				fn.call(this, ems[i], i);
			}
			return this;
		},
		
		/**
		 * 注册对应HTMLElement元素数组上的处理函数
		 * @param {Function} fn
		 */
		elems : function(fn){
			fn.call(this,this.ems);
			return this;
		},
	
		/**
		 * 在mojo对象上缓存的数据,2个参数设置,1个参数读取
		 * @param {String} key 名
		 * @param {Object} value 值 
		 */
		data : function(key,value){
			if(arguments.length === 2){ 
				this.datas[key] = value; 
			} else {
				if(typeof key === "function") {
					key.call(this,this.datas)
				} else {
					return this.datas[key];
				}
			}
			return this;
		},
		
		/**
		 * 删除mojo对象上缓存的数据,无参数表示全部删除
		 * @param {String} keys 逗号分隔多个值
		 */
		removeData : function(keys){
			var i, j,
				datas = this.datas;
			if(arguments.length === 1){
				keys = keys.split(",");
				for(i = 0,j = keys.length;i < j; i++){
					delete datas[keys[i]];
				}
			} else {
				this.datas = {};
			}
			return this;
		},
		
		/**
		 * 添加子节点
		 * @param {String or HTMLElement} child
		 */
		append : function(child){
			var ems = this.ems,
				i,
				j = ems.length;
				
			if(typeof child === "string"){
				child = jo.trim(child);
				for (i = 0, j = ems.length; i < j; i++){
					ems[i].innerHTML += child;
				}
			} else if(typeof child === "object") {
				for (i = 0, j = ems.length; i < j; i++){
					ems[i].appendChild(child);
				}
			} else if(typeof child === "function"){
				
			}
			return this;
		},
		after : function(c,isTrue){//追加兄弟节点
			var next,e,ems = this.ems;
			if(typeof c === "string"){
				c = jo.trim(c);
				var f = jo.strToFragment(c);
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					next = jo.getNextNode(e);
					if (next) {
						e.parentNode.insertBefore(i === j - 1 ? f : f.cloneNode(true), next);
					}else {
						e.parentNode.appendChild(i === j - 1 ? f : f.cloneNode(true));
					}
				}					
			}else{//对象
				if (!isTrue) {
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						next = jo.getNextNode(e);
						if (next) {
							e.parentNode.insertBefore(c, next);
						}else {
							e.parentNode.appendChild(c);
						}
					}
				}else{
					var cc;
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						next = jo.getNextNode(e);
						cc = c.cloneNode(true);
						if(cc.id){
							cc.removeAttribute("id")
						}
						if (next) {
							e.parentNode.insertBefore(cc, next);
						}else {
							e.parentNode.appendChild(cc);
						}
					}				
				}
			}
			return this;
		},
		before : function(c,isTrue){//前插兄弟节点
			var e,ems = this.ems;
			if(typeof c === "string"){
				c = jo.trim(c);
				var f = jo.strToFragment(c); 
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					e.parentNode.insertBefore(i === j - 1 ? f : f.cloneNode(true), e);
				}					
			}else{//对象
				if (!isTrue) {
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						e.parentNode.insertBefore(c, e);
					}
				}else{
					var cc;
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						cc = c.cloneNode(true);
						if(cc.id){
							cc.removeAttribute("id")
						}
						e.parentNode.insertBefore(cc, e);
					}					
				}
			}
			return this;			
		},
		wrap : function(c,isTrue){//包裹当前节点
			var e,ems = this.ems;
			if(typeof c === "string"){
				c = jo.trim(c);
				var f = jo.strToFragment(c);
				for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						e.parentNode.insertBefore(i === j - 1 ? f : f.cloneNode(true), e);
						e.previousSibling.appendChild(e);
				}					
			}else{
				if (!isTrue) {
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						e.parentNode.insertBefore(c, e);
						c.appendChild(e);
					}
				}else{
					var cc;
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						cc = c.cloneNode(true);
						if(cc.id){
							cc.removeAttribute("id")
						}
						e.parentNode.insertBefore(cc, e);
						cc.appendChild(e);
					}				
				}
			}
			return this;
		},
		replace : function(c,isTrue){//替换节点
			var e,ems = this.ems;
			if(typeof c === "string"){
				c = jo.trim(c);
				var f = jo.strToFragment(c);
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					e.parentNode.replaceChild(i === j - 1 ? f : f.cloneNode(true), e);
				}					
			}else{
				if (!isTrue) {
					for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						e.parentNode.replaceChild(c, e);
					}
				}else{
					var cc;
					for (var i = 0, j = ems.length; i < j; i++) {
						e = ems[i];
						cc = c.cloneNode(true);
						if (cc.id) {
							cc.removeAttribute("id")
						}
						e.parentNode.replaceChild(cc, e);
					}			
				}	
			}
			return this.clean();
		},
		html : function(h){
			var ems = this.ems;
			if (arguments.length === 1) {
				for (var i = 0, j = ems.length; i < j; i++){
					ems[i].innerHTML = jo.trim(h);
				}
				return this;
			} else {//len = 0
				var arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					arr[i] = jo.trim(ems[i].innerHTML);
				}
				return arr;
			}
		},
		remove : function(){//删除节点
			var e,ems = this.ems;
			for (var i = 0, j = ems.length; i < j; i++){
				e = ems[i];
				e.parentNode.removeChild(e);
			}
			return this.clean();
		},
     	text : function(t){
			var e,ems = this.ems;
			if(arguments.length === 1){
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					e.innerText ? e.innerText = t : e.textContent = t;
				}
				return this;
			}else{//len = 0
				var arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					arr[i] = jo.trim(e.innerText || e.textContent);
				}
				return arr;
			}
		},
		val : function(v){
			var ems = this.ems;
			if(arguments.length === 1){
				for (var i = 0, j = ems.length; i < j; i++){
					ems[i].value = v;
				}
				return this;
			}else{//len = 0
				var arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					arr[i] = ems[i].value;
				}
				return arr;
			}
		},
		attr : function(){
			var args = arguments,ems = this.ems,attr = args[0];
			if (args.length === 2) {//设置属性值k-v形式
				if (typeof args[1] !== "function") {
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i][attr] = args[1];
					}
				} else{
					for (var i = 0, j = ems.length; i < j; i++) {//函数返回值形式
						ems[i][attr] = args[1].call(this,ems[i]);
					}					
				}
			}else {//len = 1
				if (typeof attr === "string") {//获取属性值
					var arr = [],e;
					for (var i = 0, j = ems.length; i < j; i++) {
						e = ems[i];
						arr[i] = typeof e[attr] !== "undefined" ?  e[attr] : e.getAttribute(attr);
					}
					return arr;
				}else {//对象形式
					for (var i = 0, j = ems.length, p; i < j; i++) {
						for(p in arrt){
							ems[i][p] = arrt[p];
						}
					}
				}
			}
			return this;
		},
		removeAttr : function(attr){//删除属性
			 var e,ems = this.ems;
			 attr = attr.split(",");
			 for (var i = 0, j = ems.length, m = attr.length, n; i < j; i++) {
			 	e = ems[i];
			 	for (n = 0; n < m; n++) {
			 		e.removeAttribute(attr[n]);
			 		if (typeof e[attr[n]] !== "undefined") {
			 			delete e[attr[n]];
			 		}
			 	}
			 }
			 return this;
		},
		css : function(){
			var args = arguments,len = args.length,ems = this.ems;
			if (len === 2) {//设置k-v形式
				if (typeof args[1] !== "function") {
					var v = args[1]; 			
					if(v.indexOf("+=") !== -1){
						v = v.match(/(\d+)(\D*)/);
						for (var i = 0, j = ems.length; i < j; i++) {
							jo.setStyle(args[0], ems[i], 
										parseInt(jo.getStyle(args[0], ems[i])) + v[1] * 1 + v[2]);
						}
					} else if(v.indexOf("-=") !== -1){
						v = v.match(/(\d+)(\D*)/);
						for (var i = 0, j = ems.length; i < j; i++) {
							jo.setStyle(args[0], ems[i], 
										parseInt(jo.getStyle(args[0], ems[i])) - v[1] * 1 + v[2]);
						}
					} else {
						for (var i = 0, j = ems.length; i < j; i++) {
							jo.setStyle(args[0], ems[i], v);
						}						
					}
				} else{
					for (var i = 0, j = ems.length; i < j; i++) {
						jo.setStyle(args[0], ems[i], args[1].call(this, ems[i]));
					}										
				}
			} else {//len = 1
				if (typeof args[0] === "string") {//获取
					var arr = [];
					for (var i = 0, j = ems.length; i < j; i++) {
						arr[i] = jo.getStyle(args[0], ems[i]);
					}
					return arr;
				} else {//设置
					for (var i = 0, j = ems.length, p, v; i < j; i++) {
						for (p in args[0]) {
							v = args[0][p];
							if(v.indexOf("+=") !== -1){
								v = v.match(/(\d+)(\D*)/);
								for (var i = 0, j = ems.length; i < j; i++) {
									jo.setStyle(p, ems[i], parseInt(jo.getStyle(p, ems[i])) + v[1] * 1 + v[2]);
								}
							} else if(v.indexOf("-=") !== -1){
								v = v.match(/(\d+)(\D*)/);
								for (var i = 0, j = ems.length; i < j; i++) {
									jo.setStyle(p, ems[i], parseInt(jo.getStyle(p, ems[i])) - v[1] * 1 + v[2]);
								}
							} else {
								for (var i = 0, j = ems.length; i < j; i++) {
									jo.setStyle(p, ems[i], v);
								}						
						    }						
						}
					}
				}
			}	
			return this;
		},
		addClass : function(c){//添加css样式
			var e,ems = this.ems,
				re = new RegExp("(^| )" + c + "( |$)");
			for (var i = 0, j = ems.length; i < j; i++) {
				e = ems[i];
				if (e.className) {
					if (!re.test(e.className)) {
						e.className += " " + c;
					}
				} else {
					e.className = c;
				}
			}
			return this;
		},
		removeClass : function(c){//删除Css样式
			var e,ems = this.ems;
			if (arguments.length === 1) {
				var cls,re = new RegExp(c.replace(",","|"),"g");
				for (var i = 0, j = ems.length; i < j; i++) {
					e = ems[i];
					cls = e.className;
					if (cls) {
						e.className = jo.trim(cls.replace(re, ""));
					}
				}
			}else{//len = 0
				for (var i = 0, j = ems.length; i < j; i++) {
					ems[i].className = "";
				}
			}
			return this;
		},
		style : function(sty){//添加style内嵌形式的字符串
			var arr,ems = this.ems;
			if (arguments.length === 1) {
				var str,e;
					arr = sty.split(";");
				for (var i = 0, j = ems.length, m = arr.length, n; i < j; i++) {
					e = ems[i];
					sty = e.style.cssText + ";";
					for (n = 0; n < m; n++) {
						str = arr[n].split(":");
						if (str[0].indexOf(sty) !== -1) {
							sty = sty.replace(new RegExp(str[0] + "\.*:\.*;", "i"), arr[n] + ";");
						} else {
							sty += arr[n] + ";";
						}
					}
					e.style.cssText = sty;
				}
				return this;
			}else{//len = 0
				arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					arr[i] = ems[i].style.cssText;
				}
				return arr;
			}
		},
		removeStyle : function(sty){//删除style内嵌形式的字符串
			var e,ems = this.ems;
			if (arguments.length === 1) {
				var arr = sty.split(",");
				for (var i = 0, j = ems.length, m = arr.length, n; i < j; i++) {
					e = ems[i];
					sty = e.style.cssText + ";";
					for (n = 0; n < m; n++) {
						sty = sty.replace(new RegExp(arr[n] + "\.*:\.*;", "i"), "");
					}
					e.style.cssText = sty;
				}
			}else{
				for (var i = 0, j = ems.length; i < j; i++){
					ems[i].style.cssText = "";
				}
			}
			return this;			
		},
		anim : function(){//自定义动画
			var args = arguments,obj = args[0],
				dur,fn,type,ease,
				ops,arr,p,
				ems = this.ems,
				tids = this.tids;//存放计时器id
			
			if(args.length === 2 && typeof args[1] === "object"){//参数为对象的形式
				ops = args[1];
				dur = ops.dur || 300;//动画时间
				fn = ops.fn || null;//完成回调函数
				type = ops.type || "swing";//动画类型
				ease = ops.ease || "easeIn";//缓冲类型
			}else{//多参数形式
				dur = args[1] || 300;
				fn =  args[2] || null;
				type =  args[3] || "swing";
				ease =  args[4] || "easeIn";
			}
			
			ops = [];//依次装入:属性名,符号,值,单位
			args = 0;
			for(p in obj){//解析属性值
				ops[args] = p;
				if (p.toLowerCase().indexOf("color") !== -1) {//颜色属性
					ops[args + 1] = obj[p];
					ops[args + 2] = "#";
					ops[args + 3] = "";
				} else {
					arr = obj[p].match(/((-=)?|(\+=)?)(-?\d+)(\D*)/);
					ops[args + 1] = arr[2] || arr[3];
					ops[args + 2] = arr[4];
					ops[args + 3] = arr[5] || "px";
				}		
				args += 4;
			}
			arr = this;//传递给回调函数作为this的值

			for (var i = 0, j = ems.length; i < j; i++){
				tids[i] = jo.parseAnim(ems[i],ops,dur,type,ease,fn,arr);
			}
			return this;
		},
		isAnim : function(){//是否动画中
			if(this.tids.length){
				return true;
			}
			return false;
		},
		stop : function(){//终止动画
			var tids = this.tids;
			for (var i = 0, j = tids.length; i < j; i++) {
				clearInterval(tids[i]);
			}
			tids.length = 0;
			return this;			
		},
		addEnd : function(fn){//动画回调函数
			this.ends.push(fn);
			return this;
		},
		removeEnd : function(fn){//移除动画回调
			var ends = this.ends;
			if (arguments.length === 1) {
				for (var i = 0, j = ends.length; i < j; i++) {
					if (fn === ends[i]) {
						ends.splice(i, 1);
					}
				}
			}else {
				ends.length = 0;
			}
			return this;
		},
		bind : function(type,fn){//绑定事件
		    var e,ems = this.ems,ths = this,myfn,
				args = Array.prototype.slice.call(arguments,2);
			for (var i = 0, j = ems.length; i < j; i++){
				e = ems[i];
				myfn = function(event){
					fn.apply(ths,[e, window.event || event].concat(args));
				}
				jo.addEventHandler(e,type,myfn);
				//缓存事件类型和函数
				if (!e.mojoEventHandler) {
					e.mojoEventHandler = {};
				}
				if (!e.mojoEventHandler[type]) {
					e.mojoEventHandler[type] = [];
				}
				e.mojoEventHandler[type].push(myfn);
			}
			return this;	
		},
		unbind : function(){//移除事件
			var args = arguments,len = args.length,type,
				mh,e,ems = this.ems;
			if(len === 1){//移除类型所有处理函数
				type = args[0];
				for (var i = 0, j = ems.length, n, m; i < j; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh && mh[type]) {
						for (n = 0, m = mh[type].length; n < m; n++) {
							jo.removeEventHandler(e, type, mh[type][n]);
						}
						delete mh[type];
					}
				}
			}else if(len === 2){//移除对应类型对应函数
				type = args[0];
				var fn = args[1];
				for (var i = 0, j = ems.length, n, m; i < j; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh && mh[type]) {
						for (n = 0, m = mh[type].length; n < m; n++) {
							if (mh[type][n] === fn) {
								jo.removeEventHandler(e, type, fn);
								mh[type].splice(n, 1);
							}
						}
						if (mh[type].length === 0) {
							delete mh[type]
						}
					}
				}
			}else{//没有参数移除所有事件
				for (var i = 0, j = ems.length, n, m; i < j; i++) {
					e = ems[i];
					mh = e.mojoEventHandler;
					if (mh) {
						for (type in mh) {
							for (n = 0, m = mh[type].length; n < m; n++) {
								jo.removeEventHandler(e, type, mh[type][n]);
							}
							delete mh[type];
						}
						mh = null;
					}
				}				
			}
			return this;
		},
		on : function(type,fn){//触发和绑定标签上的事件
			var ems = this.ems,ths = this,e;
			if(arguments.length > 1){
				if (typeof fn === "function") {
					var args = Array.prototype.slice.call(arguments,2);
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i]["on" + type] = function(event){
							fn.apply(ths, [this, window.event || event].concat(args));
						};
					}
				} else {
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i]["on" + type] = fn;
					}
				}
			}else{// len = 1
				for (var i = 0, j = ems.length; i < j; i++) {
					e = ems[i];
					if (e["on" + type]) {
						e["on" + type]();
					}
					if (e.mojoEventHandler && e.mojoEventHandler[type]) {
						var fns = e.mojoEventHandler[type];
						for (var n = 0, m = fns.length; n < m; n++) {
							fns[n]();
						}
					}
				}
			}
			return this;
		}
	};
	
	//内部对象,mojo方法辅助对象
	jo = {
		/**
		 * 根据选择器初始化mo对象
		 * @param {String or HTMLElement} selector
		 */
		init : function(selector){
			var i,j,str,obj,
			    arr = [];
			
			//选择器为字符串	
			if (typeof selector === "string") {
				arr = arr.concat(shimmer.selector(selector,document));
			} else if(typeof selector === "object"){//选择器为对象
				arr = arr.concat(selector);
			}
			
			//判断选择器的有效性
			if(arr.length){
				return new mo(selector,arr);
			}
			
			return null;
		},
		
		getNextNode : function(e){//获取下一个非空白字符节点
			var next = e.nextSibling; 
			if (next) {
				if (next.nodeType === 3 && next.nodeValue.replace(/\s/g, "") === "") {//空白文本节点
					return this.getNextNode(next);
				}
				return next;
			} else {
				return null;
			}
		},
		strToFragment : function(s){//html字符串转换成documentFragment
			var d = document.createElement("div"),
				f = document.createDocumentFragment(),cns;
				d.innerHTML = s;
				cns = d.childNodes;
				while (cns.length) {
					f.appendChild(cns[0]);
				}
			return f;				
		},
		
		/**
		 * 去除字符串前后的空白字符
		 * @param {Srting} str
		 */
		trim : function(str){
			return str.replace(/^\s+|\s+$/g,"");
		},
		getStyle : function(sty,e){//获取style
			var obj =  e.currentStyle || window.getComputedStyle(e, null);
			switch (sty) {
	       		case "float" : return  obj.styleFloat || obj.cssFloat;
	 			case "opacity" : return e.filters ? (e.filters.alpha ? e.filters.alpha.opacity : 100) : obj.opacity * 100;
	  			default : return obj[sty];	 	 
			}
		},
		setStyle : function(sty, e, val){
			var obj = e.style;
  			switch (sty) {
		 		case "float" : obj.styleFloat ? obj.styleFloat = val : obj.cssFloat = val;
					break;
		 		case "opacity" : e.filters ? obj.filter = (e.currentStyle.filter || "").replace(/alpha\([^)]*\)/, "") + "alpha(opacity=" + val + ")" : obj.opacity = val / 100;
					break;
		  		default : obj[sty] = val;
			}
		},
		parseAnim : function(e,ops,dur,type,ease,fn,ths){//配置anim
			var	len = ops.length,
		    	step = [],//属性值数组
				isColor;//是否为颜色属性
		    for (var i = 0,j = 0; i < len; i += 4,j += 5) {
				isColor = ops[i + 2] === "#";
				if (!isColor) {//不是颜色属性
					var b ,c;//初始值,变化值
					if(typeof e[ops[i]] === "undefined"){
						b = parseInt(this.getStyle(ops[i], e));
						if (isNaN(b)) {//设置初始值
							b = 0;
						}						
					} else {
						b = e[ops[i]];
					}
					
					switch (ops[i + 1]) {//判断符号,设置变化量
						case "+=":
							c = ops[i + 2] * 1;
							break;
						case "-=":
							c = ops[i + 2] * 1 - ops[i + 2] * 2;
							break;
						default:
							c = ops[i + 2] * 1 - b;
					}
					step[j] = b;//压入当前属性的初始值
					step[j + 1] = c;//压入当前属性的变化值
				}else {//颜色属性
					var arr = [],//RGB三种颜色的初始值(b1,b2,b3)和变化值(c1,c2,c3)
 						rgb1 = this.color10(this.getStyle(ops[i], e)),//十进制RGB初始颜色
 						rgb2 = this.color10(ops[i + 1]);//十进制RGB最终颜色
					for(var n = 0;n < 3;n++){
						arr[n] = rgb1[n] * 1;
						arr[n + 3] = rgb2[n] * 1 - arr[n];
					}
					
					step[j] = arr;//压入颜色属性的变化数组
					step[j + 1] = "#";//表示为颜色数组
				}
				
				step[j + 2] = 0;//当前属性的动画开始时间
				step[j + 3] = ops[i];//压入当前属性的属性名
				step[j + 4] = ops[i + 3];//当前属性单位
			}
			return this.timer(step,fn,e,ths,dur,type,ease);
		},
		timer : function(step,fn,e,ths,dur,type,ease){
			var j = step.length,k = j/5,
				end,start = new Date().valueOf(),
				tid = setInterval(function(){
					end = new Date().valueOf();
					var step2,step3,step1,stepi;
					for(var i = 0;i < j; i += 5){
						step2 = step[i + 2];
						if (step2 !== dur) {//当前属性动画未完成
							step[i + 2] = step2 += end - start;
							if(step2 > dur){//当前属性动画完成
							        step[i + 2] = step2 = dur;
							}						
							step3 = step[i + 3];
							step1 = step[i + 1];
							stepi = step[i];
							if (step1 === "#") {//颜色属性
								for (var n = 0, m; n < 3; n++) {
									m = Math.ceil(tween[type][ease](step2, stepi[n], stepi[n + 3], dur)).toString(16);
									stepi[n + 6] = m.length === 1 ? "0" + m : m;
								}
								jo.setStyle(step3, e, "#" + stepi[6] + stepi[7] + stepi[8]);
							}else {//非颜色属性
								if (typeof e[step3] === "undefined") {
									jo.setStyle(step3, e, Math.ceil(tween[type][ease](step2, stepi, step1, dur)) + step[i + 4]);
								} else {
								    e[step3] = Math.ceil(tween[type][ease](step2, stepi, step1, dur));
								}
							}
						}else{
							k--;//未完成属性动画计数器
						}
					}				
					
					if (k !== 0) {
						start = end;
					} else {//所有属性动画完成
						clearInterval(tid);
						var ends = ths.ends,tids = ths.tids;
						for (var w = 0, z = tids.length; w < z; w++) {
							if (tids[w] === tid) {
								tids.splice(w, 1);
							}
						}
						if (fn) {
							fn.call(ths, e);
						}
						for (var a = 0, b = ends.length; a < b; a++) {
							ends[a].call(ths, e);
						}
					}					
				},10);
			return tid;
		},
		color10 : function(cor){//转换颜色为十进制值
			var rgb = [],len = cor.length; 
			if(len === 7){//#000000格式				
				for(var i = 0;i < 3;i++){
					rgb[i] = parseInt(cor.substring(2 * i + 1,2 * i + 3),16);
				}
			} else if(len === 4){//#000格式
				cor = cor.replace(/\w{1}/g,"$&$&");	
				for(var i = 0;i < 3;i++){
					rgb[i] = parseInt(cor.substring(2 * i + 1,2 * i + 3),16);
				}				
			} else{//rgb(0,0,0)格式
				if (cor === "transparent") {
					cor = "rgb(255,255,255)";
				}
				rgb = cor.match(/\d+/g).toString().split(",");
			}
			return rgb;
		},		
		addEventHandler : function(e,type,fn){//添加事件函数
			if (e.attachEvent) {
				e.attachEvent("on" + type, fn);
			}else {
				e.addEventListener(type, fn, false);
			}
			
		},
		removeEventHandler : function(e,type,fn){//删除事件函数
			if (e.detachEvent) {
				e.detachEvent("on" + type, fn);
			}else {
				e.removeEventListener(type, fn, false);
			}
		}
	};
	
	
	
	/**
 	 * Copyright (c) 2009 scott.cgi
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
				if (arr2 === null) {//没有4大规则的情况
					arr = arr.concat(this.idClassTag(arr1[0], context, " "));//默认为当前上下文的后代规则
				} else {
					nodes1 = this.idClassTag(arr1[0], context, " ");
					for (var n = 0, m = arr2.length, k, l; n < m; n++) {//更具规则组装arr数组,存放既是HTMLElement
						l = nodes1.length
						for (k = 0; k < l; k++) {
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
				pseudo = pseudo.length === 1 ? null : pseudo.slice(1);//存放伪类数组
				
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
							if (n[i].className.indexOf(cls) !== -1) {
								arr[k] = n[i];
								k++;
							}
						}
						break;
					//子元素		
					case ">":
						for(var i = 0,ns = context.childNodes, j = ns.length; i < j; i++){
							n = ns[i];
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag) {
								if (n.className.indexOf(cls) !== -1) {
									arr[k] = n;
									k++;
								}								
							}
						}
						break;	
					//弟弟元素
					case "+":
						n = context.nextSibling;
						while(n){
							if(n.nodeType === 1 && n.nodeName.toLowerCase() === tag){
								if (n.className.indexOf(cls) !== -1) {
									arr[k] = n;
									k++;
								}
							}
							n = n.nextSibling;
						}
						break;
					//哥哥元素
					case "~":
						n = context.previousSibling;
						while(n){
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === tag) {
								if (n.className.indexOf(cls) !== -1) {
									arr[k] = n;
									k++;
								}
							}
							n = n.previousSibling;
						}
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
						}
						break;
					//子元素		
					case ">":
						for (var i = 0, ns = context.childNodes, j = ns.length, k = 0; i < j; i++) {
							n = ns[i];
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === s){
								arr[k] = n;
								k++;
							}
						}
						break;
					//弟弟元素
					case "+":
						n = context.nextSibling;
						var k = 0;
						while(n){
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === s) {
								arr[k] = n;
								k++;
							}
							n = n.nextSibling;
						}
						break;
					//哥哥元素	
					case "~":
						n = context.previousSibling;
						var k = 0;
						while (n) {
							if (n.nodeType === 1 && n.nodeName.toLowerCase() === s) {
								arr[k] = n;
								k++;
							}
							n = n.previousSibling;
						}
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
							if(attrVal !== attr1[1])
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
							if(attrVal.indexOf(attr1[1]) === -1)
								n = len;		
					}
				}
				if(n === len){//说明循环顺利结束,当前元素符合条件
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
						if (f.nodeType === 1) {
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
						if(f.nodeType === 1){
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
				param = param * 1;
				if(param < nodes.length){
					arr[0] = nodes[param];
				}
				return arr;
			},
			gt : function(nodes,param){
				var arr = [];
				param = param * 1;
				if(param < nodes.length){
					arr = arr.concat(nodes.slice(param));
				}
				return arr;				
			},
			lt : function(nodes,param){
				var arr = [];
				param = param * 1;
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

	//mojo扩展
	mojo.extend = mojo.fn.extend = function(obj){
		var p;
		for (p in obj) {
			this[p] = obj[p];
		}
		return this;
	};
	
	mojo.extend({
		tween: function(t){//安装tween算法
			var p;
			for (p in t) {
				tween[p] = t[p];
			}
			return this;
		},
		addPseudo : function(n,fn){//添加伪类选择器解析
			shimmer.pseudos[n] = fn;
			return this;
		},
		ver : "0.65",
		info : "code by scott.Cgi"
	});
	
  
})(window,undefined);