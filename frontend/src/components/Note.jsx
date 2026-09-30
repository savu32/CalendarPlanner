export function Note({noteText}) {

    return (
        <>
            <div>
                <div style = {{display : "flex", justifyContent : "center", paddingLeft:"5px", paddingBottom : "20px"}}>
                    <p>{noteText}</p>
                </div>
            </div>
        </>
    )
}