with( HLight ) lang.md_inline= FConcurentLang( new function(){
	var wrapGhost= TagWrapper( 'std:hlight-md-ghost' )
	var wrapQuote= TagWrapper( 'std:hlight-md-quote' )
	var wrapRemark= TagWrapper( 'std:hlight-md-remark' )
	var wrapStrong= TagWrapper( 'std:hlight-md-strong' )
	var wrapEm= TagWrapper( 'std:hlight-md-em' )
	var wrapCode= TagWrapper( 'std:hlight-md-code' )
	var wrapLink= TagWrapper( 'std:hlight-md-link' )

	this[ '((?:ftp|http):\\/\\/\\S+)' ]= function( href ){
		href= wrapLink( lang.text( href ) )
		return href
	}
	this[ '(""|\\*\\*|//|``)' ]= function( str ){
		return str.charAt(0) + wrapGhost( str.charAt(1) )
	}
	this[ '(^|[\\s\\n])"([^"\\s](?:[\\s\\S]*?[^"\\s])?)"(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + wrapQuote( '"' + content + '"' )
	}
	this[ "(^|[\\s\\n])'([^'\\s](?:[\\s\\S]*?[^'\\s])?)'(?=[\\s,.;\\n]|$)" ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + wrapQuote( "'" + content + "'" )
	}
	this[ '«([\\s\\S]+?)»' ]= function( content ){
		content= lang.md_inline( content )
		return wrapQuote( '«' + content + '»' )
	}
	this[ '(^|[\\s\\n])\\(([^\\(\\s](?:[\\s\\S]*?[^\\)\\s])?)\\)(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= lang.md_inline( content )
		return prefix + wrapRemark( '(' + content + ')' )
	}
	this[ '(^|[\\s\\n])\\*([^*\\s](?:[\\s\\S]*?[^*\\s])?)\\*(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= wrapStrong( lang.md_inline( content ) )
		var marker= wrapGhost( '*' )
		return prefix + marker + content + marker
	}
	this[ '(^|[\\s\\n])/([^/\\s](?:[\\s\\S]*?[^/\\s])?)/(?=[\\s,.;\\n]|$)' ]= function( prefix, content ){
		prefix= lang.text( prefix )
		content= wrapEm( lang.md_inline( content ) )
		var marker= wrapGhost( '/' )
		return prefix + marker + content + marker
	}
	this[ '`([\\s\\S]+?)`' ]= function( content ){
		content= wrapCode( lang.text( content ) )
		var marker= wrapGhost( '`' )
		return marker + content + marker
	}
})

with( HLight ) lang.md= FConcurentLang( new function(){
	var wrapGhost= TagWrapper( 'std:hlight-md-ghost' )
	var wrapBlock= TagWrapper( 'std:hlight-md-block' )

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
		var markerOutGhost= wrapGhost( markerOut )
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
		marker= wrapGhost( marker )
		content= TagWrapper( 'std:hlight-md-header-' + level )( lang.md_inline( content ) )
		return prefix + marker + content
	}
	this[ '((?:(?:^|\\n)> [^\\n]*)+)' ]= RecursiveBlock( '> ', 'std:hlight-md-quote', 'md' )
	this[ '((?:(?:^|\\n)  [^\\n]*)+)' ]= RecursiveBlock( '  ', 'std:hlight-md-code', 'code' )
	this[ '((?:(?:^|\\n)\\t[^\\n]*)+)' ]= RecursiveBlock( '\t', 'std:hlight-md-code', 'code' )
	this[ '((?:(?:^|\\n)\\* [^\\n]*)+)' ]= RecursiveBlock( '\*', 'std:hlight-md-list-item', 'md' )
	this[ '((?:(?:^|\\n)(?!> |\t|  |\\* )[^\\n]+)+)' ]= function( content ){
		content= wrapBlock( lang.md_inline( content ) )
		return content
	}
})
