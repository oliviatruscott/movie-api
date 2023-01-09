const express = require("express"),
    morgan = require('morgan');
const app = express();

//list of the best movies
let topMovies = [
    {
        title: "Pride and Prejudice",
        director: "Joe Wright",
    },
    {
        title: "Castle in the Sky",
        director: "Hayao Miyazaki",
    },
    {
        title: "Howl's Moving Castle",
        director: "Hayao Miyazaki",
    },
    {
        title: "Treasure Planet",
        director: "John Musker and Ron Clements",
    },
    {
        title: "Anastasia",
        director: "Don Bluth and Gary Goldman",
    },
    {
        title: "Princess Mononoke",
        director: "Hayao Miyazaki",
    },
    {
        title: "Mary and the Witch's Flower",
        director: "Hiromasa Yonebayashi",
    },
    {
        title: "Spirited Away",
        director: "Hayao Miyazaki",
    },
    {
        title: "Corpse Bride",
        director: "Tim Burton and Mike Johnson",
    },
    {
        title: "The Nightmare Before Christmas",
        director: "Henry Selick",
    },
];

app.use(express.static('public'));
app.use(morgan('common'));

//get route at '/' that returns 'Welcome!'
app.get('/', (req, res) => {
    res.send('Welcome!');
});

//get route at '/movies' that returns json object of movies
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

//serves documentation.html from public folder
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//execute every time there is error, logged to terminal (error handling)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//listen for requests
app.listen(8080, () => {
    console.log('listening on port 8080');
});