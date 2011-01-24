
window.relativeSelectors = [

'html',

'body', 

'div', 
			
'div p', 
			
'div div',

'div ~ p', 
			
'div ~ div ~ p',
			
'div > p', 

'div > p > p',
			
'div + p', 

'div + div + p',
			
'div p a', 

'div, p, a',

'div, div, div',
		
'#title', 
			
'div#title'

];

window.clsSelectors = [

'.note',

'div.example', 
			
'ul .tocline2', 
			
'div.example, div.note', 

'.url.fn',

'.fn.url', 
			
'ul.toc li.tocline2', 
			
'ul.toc > li.tocline2'

];

window.attrSelectors = [

'a[href][name][class]', 
			
'div[class]', 
			
'div[class=example]', 
			
'div[class^=exa]', 
			
'div[class$=mple]', 
			
'div[class*=e]', 
			
'a[name|=gen]', 
			
'div[class!=made_up]',
			
'div[class^=exa][class$=mple]',
			
'div[class~=example]'

];

window.pseuSelectors = [

'div:not(.example)', 
			
'div:not(:nth-child(odd))',
			
':not(#title)',

'div:not([class])',
			
':empty',
			
'p:nth-child(even)', 
			
'p:nth-child(n-4)',
			
'p:nth-child(-2n+2)', 
			
'p:nth-child(-n+6)',
			
'p:nth-child(3n+2)',
			
'p:nth-child(3n)',
			
'p:nth-child(2n)', 
			
'p:nth-child(odd)', 
			
'p:nth-child(2n+1)', 
			
'p:nth-child(n)', 
			
'p:nth-child(5)',
			
'p:only-child', 
			
'p:last-child', 

'p:first-child'

];

window.crazySelectors = [

'div + div, div ~ div, div',

'div ~ div, div',

'div + *',

'div > div, div + div, div ~ div',

'div:not(:not(.example))',
			
'div:not(:not(:not(.example)))',

'div:not(a, p)',

'*',

'* div *',

'* > * + * ~ *',

'*.fn.url, .example.example'

];

window.customSelectors = [

];

window.allSelectors = relativeSelectors.concat(clsSelectors).concat(attrSelectors).concat(pseuSelectors);

// default loaded selectors
window.selectors = relativeSelectors;
