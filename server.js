const express = require('express');
const path = require('path');
const fs = require('fs');

const notesFilePath = path.join(__dirname, './db/db.json');
const app = express();
const PORT = process.env.PORT || 80;

app.use(express.static('public'));
app.use(express.json());

// Serve the "notes.html" page
app.get('/notes', (req, res) => {
	res.sendFile(path.join(__dirname, './public/notes.html'));
});

// Get all notes from the JSON file
app.get('/api/notes', (req, res) => {
	fs.readFile(notesFilePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading notes:', err);
			res.status(500).json({ error: 'Failed to read notes' });
			return;
		}
		const notes = JSON.parse(data);
		res.json(notes);
	});
});

// Create a new note and save it to the JSON file
app.post('/api/notes', (req, res) => {
	fs.readFile(notesFilePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading notes:', err);
			res.status(500).json({ error: 'Failed to read notes' });
			return;
		}
		const notes = JSON.parse(data);
		const newNote = req.body;

		// Generate a unique ID based on existing notes
		newNote.id = notes.reduce((maxId, note) => Math.max(maxId, note.id), 0) + 1;

		notes.push(newNote);

		fs.writeFile(notesFilePath, JSON.stringify(notes), (err) => {
			if (err) {
				console.error('Error writing notes:', err);
				res.status(500).json({ error: 'Failed to save note' });
				return;
			}
			res.json(newNote); // Return the newly created note
		});
	});
});

// Delete a note by its ID
app.delete('/api/notes/:id', (req, res) => {
	const noteId = parseInt(req.params.id);

	fs.readFile(notesFilePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading notes:', err);
			res.status(500).json({ error: 'Failed to read notes' });
			return;
		}
		let notes = JSON.parse(data);

		// Remove the note with the given ID
		notes = notes.filter(note => note.id !== noteId);

		fs.writeFile(notesFilePath, JSON.stringify(notes), (err) => {
			if (err) {
				console.error('Error writing notes:', err);
				res.status(500).json({ error: 'Failed to delete note' });
				return;
			}
			res.json({ message: 'Note deleted successfully' });
		});
	});
});

// Serve the "index.html" page for all other routes
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, './public/index.html'));
});

// Start the server
app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}`)
);