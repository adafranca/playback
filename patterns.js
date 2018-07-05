/*=============================================
=            Section comment block            =
=============================================*/
/**
 *
 * Create the patterns that are being used in the SPeedCodeEn flag
 *
 */
function Patterns() {

	var defs = document.createElementNS("http://www.w3.org/2000/svg",'defs'),rect=null,
	pattern = null, colors={'Active':'#c0c0c0', 'Inactive':'#404040',
		'Active-Block':'#9d4874','Active-Occup':'#ff0000',
		'Inactive-Block':'#560056','Inactive-Occup':'#7c0000',
		'Active-UnblockConf':'#FFAFAF','Inactive-UnblockConf':'#7C5555',
		 },
	svgContainer =  document.getElementById('svgPrincipal');
	svgContainer.appendChild(defs);

	for (prop in colors) {
		if (colors.hasOwnProperty(prop)) {
			pattern = document.createElementNS('http://www.w3.org/2000/svg','pattern');
			pattern.setAttribute('id','speedcodeen-'+prop);
			pattern.setAttribute('x','0');
			pattern.setAttribute('y','0');
			pattern.setAttribute('width','10');
			pattern.setAttribute('height','5');
			pattern.setAttribute('patternUnits',"userSpaceOnUse");

			rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
			rect.setAttribute('x','0');
			rect.setAttribute('y','0');
			rect.setAttribute('width','5');
			rect.setAttribute('height','5');
			rect.setAttribute('fill',colors[prop]);
			pattern.appendChild(rect);

			rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
			rect.setAttribute('x','5');
			rect.setAttribute('y','0');
			rect.setAttribute('width','5');
			rect.setAttribute('height','5');
			rect.setAttribute('fill','#0000d4');
			pattern.appendChild(rect);

			defs.appendChild(pattern);
		}
	}

}

Patterns();
/*=====  End of Section comment block  ======*/
