import { useEffect } from 'react';
import { Note } from './Note';
export function NotesView({notesText}) {

    return (
        <>
            <div>
                <div style = {{display : "flex", flexDirection:"column", justifyContent : "center", paddingLeft:"5px", paddingBottom : "20px"}}>
                    {notesText.map((note, i) => <Note key = {note.id} noteText={note.content}/>)}
                </div>
            </div>
        </>
    )
}