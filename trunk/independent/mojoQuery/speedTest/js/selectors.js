
window.relativeSelectors = [

'html',

'body', 

'body *',
		
'div', 
			
'div p', 
			
'div div',
			
'div ~ div ~ p',
			
'div > p', 
			
'div + p', 
			
'div ~ p', 
			
'div p a', 

'div, p, a',

'div, div, div',
		
'#title', 
			
'div#title',

'> p',

'+ div'

];

window.clsSelector = [

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

'a[href][lang][class]', 
			
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

window.crazySelector = [

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

window.allSelectors = relativeSelectors.concat(clsSelector).concat(attrSelectors).concat(pseuSelectors).concat(contextSelectors);

// default loaded selectors
window.selectors = relativeSelectors;
