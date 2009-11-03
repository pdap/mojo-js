/**
 * @author scott.Cgi
 * @since  2009-9-1
 */
(function(){
	var elems = {},//缓存HTMLElement对象
		mojos = {},//缓存mojo对象
		arrSelector,//选择器解析队列
		tween,//动画算法
		jo,//内部对象,mojo方法实现的辅助对象
	    mojo = window.mojo = function(selector){//把mojo注册到window顶级对象上，这样可以直接使用了
			return jo.init(selector);
		};
		
	//执行jo对象的init方法返回的对象
	function mo(selector){
		this.selector = selector;//选择器
		this.ems = elems[this.selector];//选择器对应缓存的HTMLElement对象数组
		this.tids = [];//动画id数组
		this.ends = [];//动画回调函数数组,每一个anim函数后回调
		this.datas = {};//缓存在mojo对像上数据
	};
	
	//mojo的方法和mo对象的原型链
	mojo.face = mo.prototype = {
		each : function(fn){//注册在对应选择器上的dom元素的处理函数
			var ems = this.ems;
			for (var i = 0, j = ems.length; i < j; i++) {
				fn.call(this, ems[i]);
			}
			return this;
		},
		renew : function(){//更新mojo对象的缓存
			delete elems[this.selector];
			delete mojos[this.selector];
			var newMojo = jo.init(this.selector),p;
			for(p in this){
				this[p] = newMojo[p];
			}
			return newMojo;
		},
		clean : function(){//清除mojo对象的缓存
			delete elems[this.selector];
			delete mojos[this.selector];
			var p;
			for(p in this){
				delete this[p];
			}
			return null;			
		},
		data : function(k,v){//在mojo对象上注册数据
			if(arguments.length == 2){ 
				this.datas[k] = v; 
				return this;
			}else{
				return this.datas[k];
			}
		},
		removeData : function(k){//删除mojo对象上注册的对象
			var p,d = this.datas;
			if(arguments.length == 1){
				for(p in d){
					if(p == k){
						delete d[p];
					}
				}
			}else{//len = 0
				for(p in d){
					delete  d[p];
				}
			}
			return this;
		},
		append : function(c,isTrue){//添加子节点
			var ems = this.ems;
			if(typeof c == "string"){//字符串形式
				c = jo.trim(c);
				for (var i = 0, j = ems.length; i < j; i++){
					ems[i].innerHTML += c;
				}
			}else{//对象形式
				if (!isTrue) {
					for (var i = 0, j = ems.length; i < j; i++){
						ems[i].appendChild(c);
					}
				}else{
					var cc;
					for (var i = 0, j = ems.length; i < j; i++){
						cc = c.cloneNode(true);
						if(cc.id){
							cc.removeAttribute("id")
						}
						ems[i].appendChild(cc);
					}
				}
			}
			return this;
		},
		after : function(c,isTrue){//追加兄弟节点
			var next,e,ems = this.ems;
			if(typeof c == "string"){
				c = jo.trim(c);
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					next = jo.getNextNode(e);
					if (next) {
						e.parentNode.insertBefore(jo.strToFragment(c), next);
					}else {
						e.parentNode.appendChild(jo.strToFragment(c));
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
			if(typeof c == "string"){
				c = jo.trim(c);
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					e.parentNode.insertBefore(jo.strToFragment(c), e);
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
			if(typeof c == "string"){
				c = jo.trim(c);
				for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						e.parentNode.insertBefore(jo.strToFragment(c), e);
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
			if(typeof c == "string"){
				c = jo.trim(c);
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					e.parentNode.replaceChild(jo.strToFragment(c), e);
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
			if (arguments.length == 1) {
				if(h){
					h = jo.trim(h);
				}
				for (var i = 0, j = ems.length; i < j; i++){
					ems[i].innerHTML = h;
				}
				return this;
			} else {//len == 0
				var arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					arr.push(jo.trim(ems[i].innerHTML));
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
			if(arguments.length == 1){
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					e.innerText ? e.innerText = t : e.textContent = t;
				}
				return this;
			}else{//len == 0
				var arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					arr.push(jo.trim(e.innerText || e.textContent));
				}
				return arr;
			}
		},
		val : function(v){
			var ems = this.ems;
			if(arguments.length == 1){
				for (var i = 0, j = ems.length; i < j; i++){
					ems[i].value = v;
				}
				return this;
			}else{//len == 0
				var arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					arr.push(ems[i].value);
				}
				return arr;
			}
		},
		attr : function(){
			var args = arguments,ems = this.ems,attr = args[0];
			if (args.length == 2) {//设置属性值k-v形式
				if (typeof args[1] != "function") {
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i][attr] = args[1];
					}
				}else{
					var ths = this;
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i][attr] = args[1].call(ths,ems[i]);
					}					
				}
			}else {//len == 1
				var arr = [],e;
				if (typeof attr == "string") {//获取属性值
					for (var i = 0, j = ems.length; i < j; i++) {
						e = ems[i];
						arr.push(typeof e[attr] != "undefined" ?  e[attr] : e.getAttribute(attr));
					}
					return arr;
				}else {//对象形式
					var p;
					for (var i = 0, j = ems.length; i < j; i++) {
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
			 for (var i = 0, j = ems.length; i < j; i++) {
			 	e = ems[i];
			 	for (var n = 0, m = attr.length; n < m; n++) {
					e.removeAttribute(attr[n]);
					if (typeof e[attr[n]] != "undefined") {
						delete e[attr[n]];
					}
				}
			 }
			 return this;
		},
		css : function(){
			var args = arguments,len = args.length,ems = this.ems;
			if (len == 2) {//设置k-v形式
				if (typeof args[1] != "function") {
					for (var i = 0, j = ems.length; i < j; i++) {
						jo.setStyle(args[0], ems[i], args[1]);
					}
				}else{
					var ths = this;
					for (var i = 0, j = ems.length; i < j; i++) {
						jo.setStyle(args[0], ems[i], args[1].call(ths,ems[i]));
					}										
				}
			} else {//len = 1
				if (typeof args[0] == "string") {//获取
					var arr = [];
					for (var i = 0, j = ems.length; i < j; i++) {
						arr.push(jo.getStyle(args[0], ems[i]));
					}
					return arr;
				}else {//设置
					var p;
					for (var i = 0, j = ems.length; i < j; i++) {
						for(p in args[0]){
							jo.setStyle(p, ems[i], args[0][p]);
						}
					}
				}
			}	
			return this;
		},
		addClass : function(c){//添加css样式
			var e,ems = this.ems,
				re = new RegExp("(^| )" + c + "( |$)");
			for (var i = 0, j = ems.length; i < j; i++){
				e = ems[i];
				if(e.className){
					if (!re.test(e.className)) {
						e.className += " " + c;
					}
				}else{
					e.className = c;
				}				
			}
			return this;
		},
		removeClass : function(c){//删除Css样式
			var e,ems = this.ems;
			if (arguments == 1) {
				var cls,re = new RegExp("(^| )" + c + "( |$)");
				for (var i = 0, j = ems.length; i < j; i++) {
					e = ems[i];
					cls = e.className;
					if (cls) {
						if (re.test(cls)) {
							cls = cls.replace(re, "$1").replace(/ $/, "");
							e.className = cls;
						}
					}
				}
			}else{//len = 0
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					if (e.className) {
						e.className = "";
					}
				}
			}
			return this;
		},
		style : function(sty){//添加style内嵌形式的字符串
			var arr,ems = this.ems;
			if (arguments.length == 1) {
				var str,e;
					arr = sty.split(";");
				for (var i = 0, j = ems.length; i < j; i++) {
					e = ems[i];
					sty = e.style.cssText + ";";
					for (var n = 0, m = arr.length; n < m; n++) {
						str = arr[n].split(":");
						if (str[0].indexOf(sty) != -1) {
							sty = sty.replace(new RegExp(str[0] + "\.*:\.*;", "i"), arr[n] + ";");
						}else {
							sty += arr[n] + ";";
						}
					}
					e.style.cssText = sty;
				}
				return this;
			}else{//len == 0
				arr = [];
				for (var i = 0, j = ems.length; i < j; i++){
					arr.push(ems[i].style.cssText);
				}
				return arr;
			}
		},
		removeStyle : function(sty){//删除style内嵌形式的字符串
			var e,ems = this.ems;
			if (arguments.length == 1) {
				var arr = sty.split(",");
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					sty = e.style.cssText + ";";
					for (var n = 0, m = arr.length; n < m; n++) {
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
			
			if(args.length == 2 && typeof args[1] == "object"){//参数为对象的形式
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
			for(p in obj){//解析属性值
				ops.push(p);
				if (p.toLowerCase().indexOf("color") != -1) {//颜色属性
					ops.push(obj[p]);
					ops.push("#");
					ops.push("");
				}else {
					arr = obj[p].match(/((-=)?|(\+=)?)(-?\d+)(\D*)/);
					ops.push(arr[2] || arr[3]);
					ops.push(arr[4]);
					ops.push(arr[5] || "px");
				}		
			}
			arr = this;//传递给回调函数作为this的值

			for (var i = 0, j = ems.length; i < j; i++){
				tids.push(jo.parseAnim(ems[i],ops,dur,type,ease,fn,arr));
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
			if (arguments.length == 1) {
				for (var i = 0, j = ends.length; i < j; i++) {
					if (fn == ends[i]) {
						ends.splice(i, 1);
					}
				}
			}else {
				ends.length = 0;
			}
			return this;
		},
		bind : function(type,fn){//绑定事件
		    var e,ems = this.ems,ths = this,myfn; 
			for (var i = 0, j = ems.length; i < j; i++){
				e = ems[i];
				myfn = function(event){
					fn.call(ths,e,window.event || event);
				}
				jo.addEventHandler(e,type,myfn);
				//缓存事件类型和函数
				if (!e.mojoHandler) {
					e.mojoHandler = {};
				}
				if (!e.mojoHandler[type]) {
					e.mojoHandler[type] = [];
				}
				e.mojoHandler[type].push(myfn);
			}
			return this;	
		},
		unbind : function(){//移除事件
			var args = arguments,len = args.length,type,
				mh,e,ems = this.ems;
			if(len == 1){//移除类型所有处理函数
				type = args[0];
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					mh = e.mojoHandler;
					if (mh && mh[type]) {
						for (var n = 0, n = mh[type].length; n < m; n++) {
							jo.removeEventHandler(e, type, mh[type][n]);
						}
						delete mh[type];
					}
				}
			}else if(len == 2){//移除对应类型对应函数
				var fn = args[1];
				type = args[0];
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					mh = e.mojoHandler;
					if (mh && mh[type]) {
						for (var n = 0, m = mh[type].length; n < m; n++) {
							if (mh[type][n] == fn) {
								jo.removeEventHandler(e, type, fn);
								mh[type].splice(i, 1);
							}
						}
						if(mh[type].length == 0){
							delete mh[type]
						}
					}
				}
			}else{//没有参数移除所有事件
				for (var i = 0, j = ems.length; i < j; i++){
					e = ems[i];
					mh = e.mojoHandler;
					if (mh) {
						for (type in mh) {
							for (var n = 0, m = mh[type].length; n < m; n++) {
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
			if(arguments.length == 2){
				if (typeof fn == "function") {
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i]["on" + type] = function(event){
							fn.call(ths, this, window.event || event);
						};
					}
				} else {
					for (var i = 0, j = ems.length; i < j; i++) {
						ems[i]["on" + type] = fn;
					}
				}
			}else{// len = 1
				for (var i = 0, j = ems.length; i < j; i++){
						e = ems[i];
						if(e["on" + type]){
							e["on" + type]();
						}
						if (e.mojoHandler && e.mojoHandler[type]) {
							var fns = e.mojoHandler[type];
							for (var n = 0, m = fns.length; n < m; n++) {
								fns[n].call(ths, e);
							}
						}
				}
			}
			return this;
		}
	};
	
	//内部对象,mojo方法实现实现辅助对象
	jo = {
		init : function(s){//初始化mojo对象
			return this.handleSelector(s);
		},
		handleSelector : function(s){//处理选择器
			//选择器为字符串
			if (typeof s == "string") {
				return this.handleCache(s);
			}
			//选择器为对象的情况
			if (typeof s == "object") {
				return this.handleObj(s);
			}
			return null;
		},
		handleObj : function(s){//处理对象的情况
				if (s.id) {//检查id是否存在
					return this.init("#" + s.id);
				}
				if (s.mojoId) {//检查mojoId是否存在
					return this.handleCache(s.mojoId);
				}else {//构建mojoId
					s.mojoId = new Date().valueOf() + Math.random().toFixed(3);
					return this.parseSelector(s);
				}
		},
		handleCache : function(s){//处理已经缓存的情况
			var obj = mojos[s];
			if (obj) {
				return obj;
			}
			return this.parseSelector(s);
		},
		parseSelector : function(s){//解析选择器
			var arr = [];
			if (typeof s == "string") {
				var arrS = s.split(",");
				for (var i = 0, j = arrS.length; i < j; i++) {//','分隔的有效选择器
					for (var n = 0, m = arrSelector.str.length; n < m; n++) {//针对每个有效选择器实施解析
						(arrSelector.str[n])(arrS[i], arr);
					}
				}
			}else{//对象情况
				for (var i = 0, j = arrSelector.obj.length; i < j; i++) {
					(arrSelector.obj[i])(s, arr);
				}
				s = s.mojoId;
			}
			
			if(arr.length){//判断选择器的有效性
				elems[s] = arr;
				return this.createMo(s);
			}
			return null;
		},
		createMo : function(s){//创建mo对象
			mojos[s] = new mo(s);
	        return mojos[s]; 
		},
		getNextNode : function(e){//获取下一个非空白字符节点
			var next = e.nextSibling; 
			if(next){
		  		if(next.nodeType == 3 && next.nodeValue.replace(/\s/g,"") == ""){//空白文本节点
					return this.getNextNode(next);
				}
				return next;
			}else{
				return null;
			}
		},
		strToFragment : function(s){//html字符串转换成documentFragment
			var d = document.createElement("div"),
				f = document.createDocumentFragment();
				d.innerHTML = s;
				for (var i = 0, cns = d.childNodes, j = cns.length; i < j; i++) {
					f.appendChild(cns[i]);
				}
			return f;				
		},
		trim : function(s){//去除字符串前后的空白字符
			return s.replace(/^\s+|$\s+/g,"");
		},
		getStyle : function(sty,e){//获取style
			var obj =  e.currentStyle || window.getComputedStyle(e, null);
			switch (sty) {
	       		case "float" : return  obj.styleFloat || obj.cssFloat;
	        		break;
	 			case "opacity" : return e.filters ? (e.filters.alpha ? e.filters.alpha.opacity : 100) : obj.opacity * 100;
	     			break;
	  			default : return obj[sty];	 	 
			}
		},
		setStyle : function(sty, e, val){
			var obj = e.style;
  			switch (sty) {
		 		case "float" : obj.styleFloat ? obj.styleFloat = val : obj.cssFloat = val;
					break;
		 		case "opacity" : e.filters ? obj.filter = "alpha(opacity="+val+")" : obj.opacity = val / 100;
					break;
		  		default : obj[sty] = val;
			}
		},
		parseAnim : function(e,ops,dur,type,ease,fn,ths){//配置anim
			var	len = ops.length,
		    	step = [],//属性值数组
				isColor;//是否为颜色属性
		    for (var i = 0; i < len; i += 4) {
				isColor = ops[i + 2] == "#";
				if (!isColor) {//不是颜色属性
					var b ,c;//初始值,变化值
					if(typeof e[ops[i]] == "undefined"){
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
					step.push(b);//压入当前属性的初始值
					step.push(c);//压入当前属性的变化值
				}else {//颜色属性
					var arr = [],//RGB三种颜色的初始值(b1,b2,b3)和变化值(c1,c2,c3)
 						rgb1 = this.color10(this.getStyle(ops[i], e)),//十进制RGB初始颜色
 						rgb2 = this.color10(ops[i + 1]);//十进制RGB最终颜色
					for(var n = 0;n < 3;n++){
						arr[n] = rgb1[n] * 1;
						arr[n + 3] = rgb2[n] * 1 - arr[n];
					}
					
					step.push(arr);//压入颜色属性的变化数组
					step.push("#");//表示为颜色数组
				}
				
				step.push(0);//当前属性的动画开始时间
				step.push(ops[i]);//压入当前属性的属性名
				step.push(ops[i + 3]);//当前属性单位
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
						if (step2 != dur) {//当前属性动画未完成
							step[i + 2] = step2 += end - start;
							if(step2 > dur){//当前属性动画完成
							        step[i + 2] = step2 = dur;
							}						
							step3 = step[i + 3];
							step1 = step[i + 1];
							stepi = step[i];
							if (step1 == "#") {//颜色属性
								for(var n = 0,m;n < 3;n++){
									m = Math.ceil(tween[type][ease](step2, stepi[n], stepi[n + 3], dur)).toString(16);
									stepi[n + 6] = m.length == 1 ? "0" + m : m;
								}
								jo.setStyle(step3, e, "#" + stepi[6] + stepi[7] + stepi[8]);
							}else {//非颜色属性
								if (typeof e[step3] == "undefined") {
									jo.setStyle(step3, e, Math.ceil(tween[type][ease](step2, stepi, step1, dur)) + step[i + 4]);
								} else {
								    e[step3] = Math.ceil(tween[type][ease](step2, stepi, step1, dur));
								}
							}
						}else{
							k--;//未完成属性动画计数器
						}
					}				
					
					if (k != 0) {
						start = end;
					}else {//所有属性动画完成
						clearInterval(tid);
						var ends = ths.ends,tids = ths.tids;
						for (var w = 0, z = tids.length; w < z; w++) {
							if (tids[w] == tid) {
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
			if(len == 7){//#000000格式				
				for(var i = 0;i < 3;i++){
					rgb[i] = parseInt(cor.substring(2 * i + 1,2 * i + 3),16);
				}
			}else if(len == 4){//#000格式
				cor = cor.replace(/\w{1}/g,"$&$&");	
				for(var i = 0;i < 3;i++){
					rgb[i] = parseInt(cor.substring(2 * i + 1,2 * i + 3),16);
				}				
			}else{//rgb(0,0,0)格式
				if (cor == "transparent") {//transparent
					cor = "rgb(255,255,255)";
				}
				rgb = cor.match(/\d+/g).toString().split(",");
			}
			return rgb;
		},		
		addEventHandler : function(target,type,fn){//添加事件函数
			if (target.attachEvent) {
				target.attachEvent("on" + type, fn);
			}else {
				target.addEventListener(type, fn, false);
			}
			
		},
		removeEventHandler : function(target,type,fn){//删除事件函数
			if (target.detachEvent) {
				target.detachEvent("on" + type, fn);
			}else {
				target.removeEventListener(type, fn, false);
			}
		}
	};
	
	
	//选择器解析队列
	arrSelector ={
	str : [//字符串选择器
		function(s, arr){
			if (s.indexOf(" ") != -1) 
				return;
			if (/#(\S+)/.test(s)) {//解析id
				var obj = document.getElementById(RegExp.$1);
				if (obj) {
					arr.push(obj);
				}
				return;
			}
			var nodes,j;
			if (/(\w*)\.(\S+)/.test(s)) {//解析class
				var cls = RegExp.$2.replace(/&/g, " ");
				if (!document.getElementsByClassName) {
					nodes = document.getElementsByTagName(RegExp.$1 || "*");
					for (var i = 0, j = nodes.length; i < j; i++) {
						if (nodes[i].className.indexOf(cls) != -1) {
							arr.push(nodes[i]);
						}
					}
				}else {
					nodes = document.getElementsByClassName(cls);
					for (var i = 0, j = nodes.length; i < j; i++) {
						arr.push(nodes[i]);
					}
				}
				return;
			}
			//解析tag
			nodes = document.getElementsByTagName(s);
			j = nodes.length;
			if (j) {
				for (var i = 0; i < j; i++) {
					arr.push(nodes[i]);
				}
			}
		}
	],
	obj : [//对象选择器
		function(s,arr){//解析dom对象
			if (s.nodeType == 1) {
				arr.push(s);
			}
		}
	]};
	
	//安装自定义的选择器的解析
	mojo.selector =	function(s,fn){
		if(typeof fn == "function"){ 
			arrSelector[s].push(fn);
		}else{
			for (var i = 0, j = fn.length; i < j; i++) {
				arrSelector[s].push(fn[i]);
			}
		}
		return this;
	};
	
	//安装tween算法
	mojo.tween = function(t){
		var p;
		for (p in t) {
			tween[p] = t[p];
		}
		return this;
	};
	
	//mojo扩展
	mojo.extend = mojo.face.extend = function(obj){
		var p;
		for (p in obj) {
			this[p] = obj[p];
		}
		return this;
	};
	
	/*
 	 补间缓冲动画算法
 	 t: current time 当前时间
 	 b: beginning value 初始值
 	 c: change in value 变化量
 	 d: duration 持续时间
	 每个效果都分三个缓动方式：
 	 easeIn：从0开始加速的缓动；
 	 easeOut：减速到0的缓动；
 	 easeInOut：前半段从0开始加速，后半段减速到0的缓动。
	*/
	tween = {
	  swing: {
	  	easeIn: function(t, b, c, d){
	  		return ((-Math.cos(t / d * Math.PI) / 2) + 0.5) * c + b;
	  	}
	  }	
    };   

})();
