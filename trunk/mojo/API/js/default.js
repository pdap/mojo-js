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
