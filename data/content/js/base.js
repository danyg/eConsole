(function($){
	
	function getOffset(e, l){
		var i,
			o = 0,
			elm = $(e),
			r = /px|em|ex/
		;
		for(i=0;i<l.length;i++){
			var Z = parseFloat( elm.css(l[i]).replace(r, ''), 10);
			o += Z;
		}
		return o;
	}
	
	$.fn.boundHeight = function(){
		return $(this).height() + getOffset(this, [
				'marginTop',
				'borderTopWidth',
				'paddingTop',
				'paddingBottom',
				'borderBottomWidth',
				'marginBottom'
			]);
	};
	$.fn.boundWidth = function(){
		return $(this).width() + getOffset(this,[
				'marginTop',
				'borderTopWidth',
				'paddingTop',
				'paddingBottom',
				'borderBottomWidth',
				'marginBottom'
			]);
	};

}(jQuery));