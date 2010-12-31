log = {
	info: function(e){
		var
			i   = 1,
			msg = [],
			len = arguments.length;
		
		for(; i < len; i++) {
			msg.push(arguments[i]);
			msg.push("<br>");
		}	
		
		e.innerHTML = msg.join("");
	}
};


API = {
	ID: 0,
	title: [],
	params: [],
	rt: [],
	targetIds: [],
	btnIds: [],
	preIds: [],
	examples: [],
	
	setTitle: function(title) {
		this.title = title;
		return this;
	},
	
	setParams: function(params) {
		this.params = params;
		return this;
	},
	
	setRt: function(rt) {
		this.rt = rt;
		return this;
	},
	
	setExamples: function(examples) {
		this.examples = examples;
		return this;
	},
	
	insert: function(element) {
		var 
			i, len, btn, ids = this.targetIds,
			tpl = [
				'<div class="api">',
					'<h5 class="api-title">',
						'<span class="left">' + this.title[0] + '(' + this.title[1] + ')' + '</span>',
						'<span class="right">return ' + this.title[2] + '</span>',
						'<div class="clear"></div>',
					'</h5>',
					
					'<div class="api-body">',
						'<h5>参数:</h5>',
						'<div class="api-param">',
							this.getParams(),
						'</div>',
						
						'<h5>返回值:</h5>',
						'<div class="api-param">',
							this.getRt(),
						'</div>',
						
						'<h5>示例:</h5>',
						this.getExamples(),
					'</div>',
				'</div>'		
			];
		   
		   	element.innerHTML += tpl.join('');
			
			for(i = 0, len = this.btnIds.length; i < len; i++) {
				btn = this.examples.buttons[i];
				
				document.getElementById("btn" + this.btnIds[i]).onclick = function() {
					btn.fn.call(null, ids)
				};
				
				document.getElementById("pre" + this.preIds[i]).innerHTML = btn.fn.toString();
			}

			this.targetIds = [];
			this.btnIds = [];
			this.preIds = [];
	},
	
	getParams: function() {
		var 
			arr = [],
			len = this.params.length,
			i   = 0, node;
		
		arr.push('<ul>');
			
		for(; i < len; i++) {
			node = this.params[i];
			arr.push('<li>');
			if(node.length) {
				arr.push(this.getParams(node));
			} else {
				arr.push(node.name);
				arr.push('<div class="api-param-desc">');
				arr.push(node.desc);
				arr.push('</div>');
			}
			arr.push('</li>');
		}	
		
		arr.push('</ul>');
		
		return arr.join('');
	},
	
	getRt: function() {
		var 
			arr = [],
			len = this.rt.length,
			i   = 0, node;
		
		arr.push('<ul>');
			
		for(; i < len; i++) {
			node = this.rt[i];
			arr.push('<li>');
			if(node.length) {
				arr.push(this.getParams(node));
			} else {
				arr.push(node.name);
				arr.push('<div class="api-param-desc">');
				arr.push(node.desc);
				arr.push('</div>');
			}
			arr.push('</li>');
		}	
		
		arr.push('</ul>');
		
		return arr.join('');		
	},

	getExamples: function() {
		var 
			arr = [],
			ids = [],
			len = this.examples.target,
			btns = this.examples.buttons,
			i, btn, id;
		
		arr.push('<div class="api-example"><div class="api-example-container">');			
		for(i = 0; i < len; i++) {
			id = this.ID++;
			this.targetIds.push(id);
			arr.push('<div id="id' + id + '" class="api-example-target">#id' + id + '</div>');
		}
		arr.push('</div>');
		
		arr.push('<ul>');
		for(i = 0, len = btns.length; i < len; i++) {
			btn = btns[i];
			
			id  = this.ID++;
			this.btnIds.push(id);

			arr.push('<li>');
			arr.push('<button id="btn' + id + '">' + btn.text + '</button>');
			
			id  = this.ID++;
			this.preIds.push(id);
			
			arr.push('<div><pre id="pre' + id + '"></pre></div>');
			arr.push('</li>');
		}
		arr.push('</ul></div>');
		
		return arr.join('');
	}
	
};
