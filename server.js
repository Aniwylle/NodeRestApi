const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const notesFilePath = path.join(__dirname, 'notes.json');

app.use(bodyParser.json());

// Функция для чтения заметок из файла
const readNotes = () => {
    if (!fs.existsSync(notesFilePath)) {
        return [];
    }
    const data = fs.readFileSync(notesFilePath);
    return JSON.parse(data);
};

// Функция для записи заметок в файл
const writeNotes = (notes) => {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
};

// GET /notes
app.get('/notes', (req, res) => {
    const notes = readNotes();
    res.status(200).json(notes);
});

// GET /note/:id
app.get('/note/:id', (req, res) => {
    const notes = readNotes();
    const note = notes.find(n => n.id === parseInt(req.params.id));
    if (note) {
        res.status(200).json(note);
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
});

// GET /note/read/:title
app.get('/note/read/:title', (req, res) => {
    const notes = readNotes();
    const note = notes.find(n => n.title === req.params.title);
    if (note) {
        res.status(200).json(note);
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
});

// POST /note/
app.post('/note/', (req, res) => {
    const notes = readNotes();
    const newNote = {
        id: notes.length > 0 ? notes[notes.length - 1].id + 1 : 1,
        title: req.body.title,
        content: req.body.content,
        created: new Date().toISOString(),
        changed: new Date().toISOString(),
    };
    notes.push(newNote);
    writeNotes(notes);
    res.status(201).json(newNote);
});

// DELETE /note/:id
app.delete('/note/:id', (req, res) => {
    let notes = readNotes();
    const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        writeNotes(notes);
        res.status(204).send();
    } else {
        res.status(409).json({ message: 'Note not found' });
    }
});

// PUT /note/:id
app.put('/note/:id', (req, res) => {
    let notes = readNotes();
    const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
    if (noteIndex !== -1) {
        const updatedNote = {
            ...notes[noteIndex],
            title: req.body.title,
            content: req.body.content,
            changed: new Date().toISOString(),
        };
        notes[noteIndex] = updatedNote;
        writeNotes(notes);
        res.status(204).send();
    } else {
        res.status(409).json({ message: 'Note not found' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
