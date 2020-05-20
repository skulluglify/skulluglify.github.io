

export class DocumentTemplateStandard extends Document 
{
    constructor ()
    {
        super ()
        this._container = null
        this._cel = e => document.createElement ( e )
        // this.initialize ()
    }
    initialize () 
    {
        const head = document.head
        // const link = this._cel ( "link" )
        const style = this._cel ( "style" )

        // link.setAttribute( "rel", "stylesheet" )
        style.textContent = "html, body { display: block; position: fixed; margin: 0; padding: 0; width: 100vw; height: 100vh; background-color: black; }"

        // head.append ( link )
        head.append ( style )
    }
    setStyleContent ()
    {   
        this.initialize ()
        if (document.styleSheets.length >0) 
        {
            const stylesheet = document.styleSheets.item ( document.styleSheets.length-1 )
            // stylesheet.addRule ( "body", "background-color: #fb0a3a;" )
            stylesheet.addRule ( "div#container", "width: 100vw; height: 100vh; background-color: #fb0a3a;" )
        }
        else 
        {
            throw`could't loaded stylesheets!`
        }
    }
    getContentBlank ()
    {
        const body = document.body
        const container = this._cel ( "div" )
        const menubar = this._cel ( "div" )
        const content = this._cel ( "div" )
    
        container.setAttribute ( "id", "container" )
        menubar.classList.add ( "menubar" )
        content.classList.add ( "content" )
    
        body.append ( container )
        container.append ( menubar )
        container.append ( content )

        return container, menubar, content
    }
}