import { useAuth } from "./AuthProvider";
export function Note({note, update}) {

    const { apiFetch } = useAuth();
    
    const deleteNote = async (note_id) => {
        const url = "http://localhost:3001/api/notes/delete";
        const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "note_id": note_id
                })
        };
        const result = await apiFetch(url, options);
        update();
    }

    return (
        <>
            <div>
                <div style={{ position: 'relative', padding: '20px' }}>
                <p>{note.content}</p>
                <button style={{ position: 'absolute', top: 0, right: 0 }}
                        onClick={() => deleteNote(note.note_id)}
                >
                    X
                </button>
                </div>
            </div>
        </>
    )
}