with( FParser ) new function(){

	var wrapLink=       FWrapper( 'std:lang-md-link' )
	var wrapLinkTitle=  FWrapper( 'std:lang-md-link-title' )
	var wrapGhost=      FWrapper( 'std:lang-md-ghost' )
	var wrapCode=       FWrapper( 'std:lang-md-code' )
	var wrapEmphasis=   FWrapper( 'std:lang-md-emphasis' )
	var wrapStrong=     FWrapper( 'std:lang-md-strong' )
	var wrapQuote=      FWrapper( 'std:lang-md-quote' )
	var wrapRemark=     FWrapper( 'std:lang-md-remark' )
	var wrapBlock=      FWrapper( 'std:lang-md-block' )
	var wrapHeader1=    FWrapper( 'std:lang-md-header-1' )
	var wrapHeader2=    FWrapper( 'std:lang-md-header-2' )
	var wrapHeader3=    FWrapper( 'std:lang-md-header-3' )

	lang.md_inline= FParser( new function(){
		
		this.titleNlink= new function(){
			this.regexp= /\[([\s\S]+?)\]\(([\s\S]+?)\)/
			var prefix= wrapGhost( '[' )
			var separator= wrapGhost( '](' )
			var postfix= wrapGhost( ')' )
			this.handler= function( title, link ){
				title= wrapLinkTitle( lang.md_inline( title ) )
				link= wrapLink( link )
				return [ prefix, title, separator, link, postfix ]
			}
		}

		this.link=
		{	regexp: /\b((?:ftp|http):\/\/[\s\S]+?(?=[.,;!?]?(?:\s|$)))/
		,	handler: wrapLink
		}

		this.escaping=
		{	regexp: /(""|\*\*|\/\/|``)/
		,	handler: function( str ){
				return [ str.charAt( 0 ), wrapGhost( str.charAt( 1 ) ) ]
			}
		}
		
		this.emphasis= new function(){
			this.regexp= /(\s)\/([^\/\s](?:[\s\S]*?[^\/\s])?)\/(?=[\s,.;!?]|$)/
			var marker= wrapGhost( '/' )
			this.handler= function( prefix, content ){
				content= wrapEmphasis( lang.md_inline( content ) )
				return [ prefix, marker, content, marker ]
			}
		}
			
		this.strong= new function(){
			this.regexp= /(\s)\*([^\*\s](?:[\s\S]*?[^\*\s])?)\*(?=[\s,.;!?]|$)/
			var marker= wrapGhost( '*' )
			this.handler= function( prefix, content ){
				content= wrapStrong( lang.md_inline( content ) )
				return [ prefix, marker, content, marker ]
			}
		}
			
		this.quote0=
		{	regexp: /«([\s\S]+?)»/
		,	handler: function( content ){
				content= lang.md_inline( content )
				content= wrapQuote([ '«', content, '»' ])
				return content
			}
		}

		this.quote1=
		{	regexp: /(\s)'([^'\s](?:[\s\S]*?[^'\s])?)'(?=[\s,.;!?]|$)/
		,	handler: function( prefix, content ){
				content= lang.md_inline( content )
				content= wrapQuote([ "'", content, "'" ])
				return [ prefix, content ]
			}
		}

		this.quote2=
		{	regexp: /(\s)"([^"\s](?:[\s\S]*?[^"\s])?)"(?=[\s,.;!?]|$)/
		,	handler: function( prefix, content ){
				content= lang.md_inline( content )
				content= wrapQuote([ '"', content, '"' ])
				return [ prefix, content ]
			}
		}

		this.remark=
		{	regexp: /(\s)\(([^(\s](?:[\s\S]*?[^)\s])?)\)(?=[\s,.;!?]|$)/
		,	handler: function( prefix, content ){
				content= lang.md_inline( content )
				content= wrapRemark([ '(', content, ')' ])
				return [ prefix, content ]
			}
		}

		this.code= new function(){
			this.regexp= /`([\s\S]+?)`/
			var marker= wrapGhost( '`' )
			this.handler= function( content ){
				return [ marker, content, marker ]
			}
		}
			
	})

	lang.md_content= FParser( new function(){
		
		this.header1= new function(){
			this.regexp= /\r(!{1,3}) ([^\n]*)/
			this.handler= function( marker, content ){
				content= lang.md_inline( content )
				content= new function(){
					this[ 'std:lang-md-header-' + marker.length ]= content
				}
				marker= [ '\r', wrapGhost( marker + ' ' ) ]
				return [ marker, content ]
			}
		}

		this.quote= new function(){
			this.regexp= /((?:\r> [^\r]*)+)/
			var marker= wrapGhost( '> ' )
			this.handler= function( content ){
				content= content.replace( /\r> /, '\r' )
				content= lang.md_content( content )
				content= { 'std:lang-md-quote': content, '#line-prefix': marker }
				return content
			}
		}

		this.code= new function(){
			this.regexp= /((?:\r  [^\r]*)+)/
			var marker= wrapGhost( '  ' )
			this.handler= function( content ){
				content= content.split( '\r  ' ).join( '\r' )
				content= lang.code( content )
				content= { 'std:lang-md-code': content, '#line-prefix': marker }
				return content
			}
		}

		this.block= new function(){
			this.regexp= /((?:\r(?!> |  |!{1,3} )[^\n]+)+)/
			this.handler= function( content ){
				return wrapBlock( lang.md_inline( content ) )
			}
		}

	})

	lang.md= FPipe( lang.md_content, FWrapper( 'std:lang-md' ) )

}
