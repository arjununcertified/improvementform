const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const pool = require('./db');

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'views'))); // Adjust 'views' if necessary

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/submit', upload.single('file'), (req, res) => {
    console.log('Uploaded file:', req.file);
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { fullname, email, address, sugest } = req.body;
    const file = req.file ? req.file.filename : null;

    const insertQuery = `
    INSERT INTO suggestions (fullname, email, address, suggestion, file)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
    `;

    pool.query(insertQuery, [fullname, email, address, sugest, file], (err, result) => {
        if (err) {
            console.error('Error saving suggestion', err.stack);
            res.status(500).send('Error saving suggestion');
        } else {
            res.send('Suggestion received successfully!');
        }
    });
});


// Use environment variable for port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
