const express = require("express");
const fs = require("fs");
const path = require("path");

//Helper method for generating unique IDs
const id = require("./helpers/uuid");

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware for parsing JSON data
app.use(express.json());

// Middleware to serve static assets from public folder
app.use(express.static("public"));

// Get request for index.html
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// Get request for notes.html
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

// Get route for retrieving all the notes
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request recieved for notes`);
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading notes data.");
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// API post route for a new note
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  const newNote = {
    title,
    text,
    id: id(),
  };

  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading notes data.");
    } else {
      const parsedNotes = JSON.parse(data);

      parsedNotes.push(newNote);

      fs.writeFile(
        "./db/db.json",
        JSON.stringify(parsedNotes, null, 4),
        (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
            res.status(500).send("Error saving new note.");
          } else {
            console.info("Successfully added new note!");
            res.json(parsedNotes);
          }
        }
      );
    }
  });
});

// Wildcard get request for index.html
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// Listen to start the server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
