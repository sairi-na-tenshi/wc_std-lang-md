with( HLight ) lang.md_inline= FConcurentLang( new function(){
	this[ '(""|\\*\\*|//|``)' ]= function( str ){
		return str.charAt(0) + '<hl:md-ghost>' + str.charAt(1) + '</hl:md-ghost>'
	}
	this[ '(^|[\\s\\n])"([^"\\s](?:[\\s\\S]*?[^"\\s])?)"(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + '<hl:md-quote>"' + content + '"</hl:md-quote>'
	}
	this[ "(^|[\\s\\n])'([^'\\s](?:[\\s\\S]*?[^'\\s])?)'(?=[\\s,.;\\n]|$)" ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + "<hl:md-quote>'" + content + "'</hl:md-quote>"
	}
	this[ '«([\\s\\S]+?)»' ]= function( content ){
		content= lang.md_inline( content )
		return '«<hl:md-quote>' + content + '</hl:md-quote>»'
	}
	this[ '(^|[\\s\\n])\\(([^\\(\\s](?:[\\s\\S]*?[^\\)\\s])?)\\)(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + '<hl:md-remark>(' + content + ')</hl:md-remark>'
	}
	this[ '(^|[\\s\\n])\\*([^*\\s](?:[\\s\\S]*?[^*\\s])?)\\*(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + '<hl:md-ghost>*</hl:md-ghost><hl:md-strong>' + content + '</hl:md-strong><hl:md-ghost>*</hl:md-ghost>'
	}
	this[ '(^|[\\s\\n])/([^/\\s](?:[\\s\\S]*?[^/\\s])?)/(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + '<hl:md-ghost>/</hl:md-ghost><hl:md-em>' + content + '</hl:md-em><hl:md-ghost>/</hl:md-ghost>'
	}
	this[ '`([\\s\\S]+?)`' ]= function( content ){
		content= lang.code( content )
		return '<hl:md-ghost>`</hl:md-ghost><hl:md-code>' + content + '</hl:md-code><hl:md-ghost>`</hl:md-ghost>'
	}
})

with( HLight ) lang.md= FConcurentLang( new function(){
	var Ghost= TagWrapper( 'hl:md-ghost' )
	var brIn= '\n'
	var brOut= lang.text( brIn )
	var FirstBREnshurer= function( func ){
		return function( content ){
			var firstBR= ( content.charAt(0) === brIn )
			if( !firstBR ) content= brIn + content
			content= func.call( this, content )
			if( !firstBR ) content= content.replace( brOut, '' )
			return content
		}
	}
	var RecursiveBlock= function( marker, name, contentLang ){
		var markerIn= brIn + marker
		var markerOut= brOut + lang.text( marker )
		var markerOutGhost= Ghost( markerOut )
		var blockWrap= TagWrapper( name )
		return FirstBREnshurer( function( content ){
			content= content.split( markerIn ).join( brIn )
			content= lang[ contentLang ]( content )
			content= content.split( brOut ).join( markerOutGhost )
			content= blockWrap( content )
			return content
		})
	}
	this[ '(^|\\n)(!{1,3} )([^\\n]*)' ]= function( prefix, marker, content ){
		var level= marker.length - 1
		prefix= lang.text( prefix )
		marker= '<hl:md-ghost>' + marker + '</hl:md-ghost>'
		content= '<hl:md-header-' + level + '>' + lang.md_inline( content ) + '</hl:md-header-' + level + '>'
		return prefix + marker + content
	}
	this[ '((?:(?:^|\\n)> [^\\n]*)+)' ]= RecursiveBlock( '> ', 'hl:md-quote', 'md' )
	this[ '((?:(?:^|\\n)  [^\\n]*)+)' ]= RecursiveBlock( '  ', 'hl:md-code', 'code' )
	this[ '((?:(?:^|\\n)\\t[^\\n]*)+)' ]= RecursiveBlock( '\t', 'hl:md-code', 'code' )
	this[ '((?:(?:^|\\n)\\* [^\\n]*)+)' ]= RecursiveBlock( '\*', 'hl:md-list-item', 'md' )
	this[ '((?:(?:^|\\n)(?!> |\t|  |\\* )[^\\n]+)+)' ]= function( content ){
		content= lang.md_inline( content )
		return '<hl:md-block>' + content + '</hl:md-block>'
	}
})
