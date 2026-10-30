import { Note } from './Note';
export function NotesView({notes, update}) {

    return (
        <>
            <div>
                <div style = {{display : "flex", flexDirection:"column", justifyContent : "center", paddingLeft:"5px", paddingBottom : "20px"}}>
                    {notes.map(note => <Note key = {note.note_id} note={note} update={update}/>)}
                </div>
            </div>
        </>
    )
}