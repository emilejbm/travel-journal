document.addEventListener("DOMContentLoaded", () => {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    let activeNote = false;
  
    const sidebarNotes = document.getElementById("sidebarNotes");
    const titleInput = document.getElementById("title");
    const bodyInput = document.getElementById("body");
  
    // Function to render sidebar notes
    function renderSidebarNotes() {
        sidebarNotes.innerHTML = "";
        notes.forEach((note) => {
            const noteElement = document.createElement("div");
            noteElement.classList.add("app-sidebar-note");
            if (note.id === activeNote) {
                noteElement.classList.add("active");
            }
    
            noteElement.innerHTML = `
            <div class="sidebar-note-title">
                <strong>${note.title}</strong>
                <button data-id="${note.id}" class="delete-note">Delete</button>
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
                setActiveNote(note.id);
            });
    
            const deleteButton = noteElement.querySelector(".delete-note");
            deleteButton.addEventListener("click", (e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
            });
    
            sidebarNotes.appendChild(noteElement);
        });
    }
  
    function setActiveNote(id) {
        activeNote = id;
        const note = notes.find((n) => n.id === id);
        if (note) {
            titleInput.value = note.title;
            bodyInput.value = note.body;
            document.querySelector(".preview-title").textContent = note.title;
            document.querySelector(".markdown-preview").textContent = note.body;
        } else {
            titleInput.value = "";
            bodyInput.value = "";
            document.querySelector(".preview-title").textContent = "";
            document.querySelector(".markdown-preview").textContent = "";
        }
        renderSidebarNotes();
    }
  
    function onAddNote() {        
        const newNote = {
            id: Date.now(),
            title: "Untitled Note",
            body: "",
            lastModified: Date.now(),
        };
        notes.unshift(newNote);
        setActiveNote(newNote.id);
        localStorage.setItem("notes", JSON.stringify(notes));
    }
  
    // Function to delete a note
    function onDeleteNote(id) {
        const noteIndex = notes.findIndex((note) => note.id === id);
        if (noteIndex !== -1) {
            notes.splice(noteIndex, 1);
            localStorage.setItem("notes", JSON.stringify(notes));
            if (activeNote === id) {
            setActiveNote(false);
            }
        }
    }
  
    // Add event listeners
    document.getElementById("add-note-btn").addEventListener("click", onAddNote);
    titleInput.addEventListener("input", () => onEditField("title", titleInput.value));
    bodyInput.addEventListener("input", () => onEditField("body", bodyInput.value));
  
    // Function to update a note field
    function onEditField(field, value) {
        if (activeNote !== false) {
            const note = notes.find((n) => n.id === activeNote);
            if (note) {
            note[field] = value;
            note.lastModified = Date.now();
            localStorage.setItem("notes", JSON.stringify(notes));
            renderSidebarNotes();
            }
        }
    }
  
    // Initial rendering
    renderSidebarNotes();
    setActiveNote(activeNote || notes[0]?.id);
});