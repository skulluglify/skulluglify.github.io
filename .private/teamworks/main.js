
import { DocumentReadyOnloader } from "./utilities/documentready.js"
import { DocumentTemplateStandard } from "./utilities/templates.js"

const dro = new DocumentReadyOnloader
const dts = new DocumentTemplateStandard

// DocumentTemplateStandard.prototype.initialize ()

dro.addEventListener ( "documentready", _ => {
    
    console.log ( document.readyState )
    
    const body = document.body
    const container = document.createElement ( "div" )
    const menubar = document.createElement ( "div" )
    const content = document.createElement ( "div" )

    container.setAttribute ( "id", "container" )
    menubar.classList.add ( "menubar" )
    content.classList.add ( "content" )

    body.append ( container )
    container.append ( menubar )
    container.append ( content )

    const webpage = new Object
    
    webpage.title = document.createElement ( "h1" )

    menubar.append ( webpage.title )

    dts.setStyleContent ()


}, true )