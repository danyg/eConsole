(function($) {
	$(document).ready(function(){
		
		var data = parseQueryString(window.location.hash.substring(1));
		
		var lang = undefined !== data.lang ? data.lang : (navigator.language || 'en');
		switchLang(lang);
		
		var lastHash = window.location.hash;
		setInterval(function(){
			if(lastHash !== window.location.hash){
				var data = parseQueryString(window.location.hash.substring(1));
				if(undefined !== data.lang && data.lang !== window.actualLanguage){
					switchLang(data.lang);
					lastHash = window.location.hash;
				}
			}
		}, 333);

		// putting lines by the pre blocks
		$("pre").each(function(){
			var pre = $(this).text().split("\n");
			var lines = new Array(pre.length+1);
			for(var i = 0; i < pre.length; i++) {
				var wrap = Math.floor(pre[i].split("").length / 70)
				if (pre[i]==""&&i==pre.length-1) {
					lines.splice(i, 1);
				} else {
					lines[i] = i+1;
					for(var j = 0; j < wrap; j++) {
						lines[i] += "\n";
					}
				}
			}
			$(this).before("<pre class='lines'>" + lines.join("\n") + "</pre>");
		});

		var headings = [];

		var collectHeaders = function(){
			headings.push({
				"top":$(this).offset().top - 15,
				"elm":$(this)
				});
		}

		if($(".markdown-body h1").length > 1) $(".markdown-body h1").each(collectHeaders)
		else if($(".markdown-body h2").length > 1) $(".markdown-body h2").each(collectHeaders)
		else if($(".markdown-body h3").length > 1) $(".markdown-body h3").each(collectHeaders)

		$(window).scroll(function(){
			if(headings.length==0) return true;
			var scrolltop = $(window).scrollTop() || 0;
			if(headings[0] && scrolltop < headings[0].top) {
				$(".current-section").css({
					"opacity":0,
					"visibility":"hidden"
				});
				return false;
			}
			$(".current-section").css({
				"opacity":1,
				"visibility":"visible"
			});
			for(var i in headings) {
				if(scrolltop >= headings[i].top) {
					$(".current-section .name").text(headings[i].elm.text());
				}
			}
		});

		$(".current-section a").click(function(){
			$(window).scrollTop(0);
			return false;
		})
	});
	
	
	var old_text = $.fn.text;
	$.fn.text = function(){
		
		if(arguments.length === 0){
			var e = $('[lang=' + window.actualLanguage + ']', this);
			if(e.length > 0){
				return old_text.apply(e[0]);
			}
		}

		return old_text.apply(this, arguments);
	};
	
	function switchLang(lang, defaultLang){
		if(undefined === defaultLang){
			defaultLang = 'en';
		}
		$('[lang]').hide();
		
		if( $('[lang=' + lang + ']').length === 0){
			lang = defaultLang;
		}

		window.actualLanguage = lang;

		$('[lang=' + lang + ']').show();
	}
	
	function parseQueryString(q){
		var i, tmp, data = {},
			keyValuePairs = q.split('&')
		;
		for(i in keyValuePairs){
			if(keyValuePairs.hasOwnProperty(i)){
				tmp = keyValuePairs[i].split('=');
				if(tmp[1]){
					if(tmp[1] === 'true'){
						tmp[1] = true;
					}else if(tmp[1] === 'false'){
						tmp[1] = false;
					}

					data[ tmp[0] ] = tmp[1];
				}else{
					data[ tmp[0] ] = true;
				}
			}
		}
		return data;
	}
	
})(jQuery)