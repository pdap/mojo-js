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
	codeIds: [],
	apis: [],
	title: [],
	summary: [],
	params: [],
	rt: [],
	examples: [],
	
	add: function(api) {
		this.setTitle(api.title)
			.setSummary(api.summary)
			.setParams(api.params)
			.setRt(api.rt)
			.setExamples(api.examples)
			.addApi();	
		
		return this;		
	},
	
	render: function(element) {
		var 
			i   = 0,
			len = this.codeIds.length,
			id, code;
		
		element.innerHTML += this.apis.join('');	 
		
		for(; i < len; i++) { 
			code = document.getElementById("code" + this.codeIds[i]);
			id   = code.innerHTML;
			code.innerHTML = "";
			code.appendChild(document.getElementById(id));
		}
		
		this.codeIds.length = 0;
		this.apis.length = 0;
	},
	
	setTitle: function(title) {
		this.title = title;
		return this;
	},
	
	setSummary: function(summary) {
		this.summary = summary;
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
	
	addApi: function() {
		var 
			tpl = [
				'<div class="api">',
					'<h5 class="api-title">',
						'<span class="left">' + this.title[0] + '(' + this.title[1] + ')' + '</span>',
						'<span class="right">return ' + this.title[2] + '</span>',
						'<div class="clear"></div>',
					'</h5>',
					
					'<div class="api-body">',
						'<h5>概述:</h5>',
						this.getSummary(),
					
						'<h5>参数:</h5>',
						'<div class="api-desc">',
							this.getParams(),
						'</div>',
						
						'<h5>返回值:</h5>',
						'<div class="api-desc">',
							this.getRt(),
						'</div>',
						
						'<h5>示例:</h5>',
						'<div class="api-example">',
							this.getExamples(),
						'</div>',						
					'</div>',
				'</div>'		
			];
		   
		   	this.apis.push( tpl.join(''));
	},
	
	getSummary: function() {
		var 
			arr = [],
			len = this.summary.length,
			i   = 0;	
		
		for(; i < len; i++) {
			arr.push('<p class="api-desc">');
			arr.push(this.summary[i]);
			arr.push("</p>");
		}
		
		return arr.join('');	
	},

	getParams: function() {
		var 
			arr = [],
			len = this.params.length,
			i   = 0, node;
		
		arr.push('<ul>');
			
		for (; i < len; i++) {
			node = this.params[i];
			arr.push('<li>');
			arr.push(node.name);
			arr.push('<div class="api-sub-desc">');
			arr.push(node.desc);
			
			if(node.child) {
				arr.push(this.getParams.call({params: node.child}));
			}
			
			arr.push('</div>');
			arr.push('</li>');
		}	
		
		arr.push('</ul>');
		
		return arr.join('');
	},
	
	getExamples: function() {
		var 
			arr = [],
			len = this.examples.length,
			i   = 0, node, id;	
		
		arr.push('<ul>');
		
		for(; i < len; i++) {
			node = this.examples[i];
			arr.push('<li>');
			arr.push(node.desc);
			
			id = this.ID++;
			this.codeIds.push(id);
			
			arr.push('<div id="code' + id + '">');
			arr.push(node.codeId);
			arr.push('</div></li>');
		}		
		
		arr.push('</ul>');
		
		return arr.join('');
	},
	
	getRt: function() {
		return this.getParams.call({params: this.rt});	
	}
};
