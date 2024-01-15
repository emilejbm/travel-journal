/* 
local storage is used while user is on notes page. when page is 'unloaded' 
(refresh or exit), a request is made to save all notes information to the db.
when page is loaded, request is made to fetch all notes information from db. 
*/

document.addEventListener("DOMContentLoaded", async () => {
    const notes = await fetchNotes();
    let activeNote = -1; // ideally make it so that no preview is shown when there is no active note
  
    const sidebarNotes = document.getElementById("sidebarNotes");
    const titleInput = document.getElementById("title");
    const bodyInput = document.getElementById("body");
  
    // iter through notes in reverse order (show last created/updated first)
    function renderSidebarNotes() {
        sidebarNotes.innerHTML = "";
        for (let idx = notes.length - 1 ; idx >= 0; idx--){
            var note = notes[idx];
            const noteElement = document.createElement("div");
            noteElement.classList.add("app-sidebar-note");
            if (idx === activeNote) {
                noteElement.classList.add("active");
            }
    
            noteElement.innerHTML = `
            <div class="sidebar-note-title">
                <strong>${note.title}</strong>
                <button data-id="${idx}" class="delete-note"><i class="far fa-trash-alt"></i></button>
            </div>
            <p>${note.body && note.body.substr(0, 100) + "..."}</p>
            <small class="note-meta">
                Last Modified ${new Date(note.lastModified).toLocaleDateString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                })}
            </small>
            `;
    
            noteElement.addEventListener("click", () => {
                setActiveNote(idx);
            });
    
            const deleteButton = noteElement.querySelector(".delete-note");
            deleteButton.addEventListener("click", (e) => {
                e.stopPropagation();
                onDeleteNote(idx);
            });
    
            sidebarNotes.appendChild(noteElement);
        }
    }
  
    function setActiveNote(idx) {
        activeNote = idx;
        if (idx !== -1) {
            const note = notes[idx];
            titleInput.value = note.title;
            bodyInput.value = note.body;
        } else {
            titleInput.value = "";
            bodyInput.value = "";
        }
        renderSidebarNotes();
    }
  
    function onAddNote() {        
        const newNote = {
            title: "Untitled Note",
            body: "",
            lastModified: Date.now(),
        };
        notes.push(newNote);
        setActiveNote(notes.length - 1);
        localStorage.setItem("notes", JSON.stringify(notes));
    }
  
    function onDeleteNote(idx) {
        if (notes[idx] !== undefined) { // item is found
            notes.splice(idx, 1); // takes care of moving elements after it backward
            localStorage.setItem("notes", JSON.stringify(notes));
            if (activeNote === idx) {
                setActiveNote(-1);
            }
        }
    }
  
    document.getElementById("add-note-btn").addEventListener("click", onAddNote);
    titleInput.addEventListener("input", () => onEditField("title", titleInput.value));
    bodyInput.addEventListener("input", () => onEditField("body", bodyInput.value));
    window.addEventListener("beforeunload", (Event) => {
        Event.preventDefault();
        saveNotes();
        return Event.returnValue = '';
    });

  
    // update a note field, shift to the end of array s.t. it is shown first 
    function onEditField(field, value) {
        if (activeNote !== -1) { // activeNote is an idx
            const note = notes[activeNote];
            if (note) {
                note[field] = value;
                note.lastModified = Date.now();
                notes.push(notes.splice(activeNote, 1)[0]) // place active note in front of array, moves everything accordingly
                activeNote = notes.length - 1;
                localStorage.setItem("notes", JSON.stringify(notes));
                renderSidebarNotes();
            }
        }
    }

    async function fetchNotes() {
        try {
            const url = window.location.href + "/fetchNotes";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                return data.notes;
            } else {
                console.log("error loading notes");
            }
        } catch (err) {
            console.log("Error fetching notes data", err);
            return JSON.parse(localStorage.getItem("notes")) || [];
        }
    }

    function saveNotes() {
        try {
            const journalId = window.location.href.split("/")[5];
            const url = window.location.href + "/updateNotes";
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    journalId: journalId,
                    notes: notes
                }),
                keepalive: true
            })
        } catch (err) {
            console.log('Error saving data', err);
        }
    }

    // Initial rendering
    renderSidebarNotes();
    setActiveNote(activeNote || notes[0]?.id);
});