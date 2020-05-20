
export class DocumentReadyOnloader extends EventTarget
{
    constructor ()
    {
        super ()
        this._cancelled = false
        this._event = new CustomEvent ( "documentready" )
        this._loader ( )
    }
    _loader ( )
    {
        let preload = 0
        window.addEventListener ( "readystatechange", _ => {
            if (document.readyState == "complete" && preload<1) 
            {
                console.log ( this )
                this._cancelled = !this.dispatchEvent ( this._event )
                // console.log ( this._cancelled )
                preload++
            }
        }, true )
    }
}