const express = require('express');
const app = express();
const port = 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
// Serve static files from 'public' folder
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    // Renders views/index.ejs
    res.render('index', { title: 'Digital Kisaan' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
