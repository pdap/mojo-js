
window.baseSelectors = [

'html',

'body', 

'body div',
		
'div', 
			
'div p', 
			
'div a',
			
'div div',
			
'div ~ div ~ p',
			
'div > p', 
			
'div + p', 
			
'div ~ p', 
			
'div p a', 

'div, p, a',

'div, div, div',
		
'.note', 
			
'div.example', 
			
'ul .tocline2', 
			
'div.example, div.note', 

'div.example.note',

'#title', 
			
'div #title', 
			
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
			
'div[class|=dialog]', 
			
'div[class!=made_up]',
			
'div[class^=exa][class$=mple]',
			
'div[class~=example]'

];

window.pseuSelectors = [

'div:not(.example)', 
			
'div:not(:nth-child(odd))',
			
'div:not(a,p)',

'div:not([class])',
			
'div:not(:not(.example))',
			
'div:not(:not(:not(.example)))',
			
':empty',
			
'p:nth-child(even)', 
			
'p:nth-child(n-4)',
			
//'p:nth-child(-2n+2)', this is cause some browser crush (not mojoQuery make)
			
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

window.contextSelector = [

['div', 'div']

];

window.allSelector = baseSelectors.concat(attrSelectors).concat(pseuSelectors).concat(contextSelector);

// default loaded selectors
window.selectors = baseSelectors;
