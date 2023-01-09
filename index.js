const express = require("express"),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser= require('body-parser'),
    uuid = require('uuid');
const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

//list of users
let users = [
    {
        "id": "1",
        "name": "Olivia",
        "favoriteMovies": []
    },
    {
        "id": "2",
        "name": "Trevor",
        "favoriteMovies": ["Castle in the Sky"]
    },
];

//list of the best movies
let movies = [
    {
        "Title": "Pride and Prejudice",
        "Description": "test description",
        "Director": {
            "Name": "Joe Wright",
            "Description": "meh",
            "Birthday": "8/25/1972",
        },
        "Genre": {
            "Name": "genre",
            "Description": "genre description",
        },
        //link to stream?
        "ImageURL": "url for movie cover",
        "Featured": false,
    },
    {
        "Title": "Castle in the Sky",
        "Description": "test description",
        "Director": {
            "Name": "Hayao Miyazaki",
            "Description": "litteraly god of movies",
            "Birthday": "xx/xx/xxxx",
        },
        "Genre": {
            "Name": "genre",
            "Description": "genre description",
        },
        "ImageURL": "url for movie cover",
        "Featured": false,
    },
    {
        "Title": "Howl's Moving Castle",
        "Description": "test description",
        "Director": {
            "Name": "Hayao Miyazaki",
            "Description": "litteraly god of movies",
            "Birthday": "xx/xx/xxxx",
        },
        "Genre": {
            "Name": "genre",
            "Description": "genre description",
        },
        "ImageURL": "url for movie cover",
        "Featured": false,
    },
    {
        "Title": "Treasure Planet",
        "Description": "test description",
        "Director": {
            "Name": "John Musker and Ron Clements",
            "Description": "bio",
            "Birthday":"xx/xx/xxxx",
        },
        "Genre": {
            "name": "genre",
            "description": "genre description",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
    {
        "Title": "Anastasia",
        "description": "test description",
        "director": {
            "name": "Don Bluth and Gary Goldman",
            "description": "bio",
            "birthday": "xx/xx/xxxx",
        },
        "Genre": {
            "Name": "fantasy",
            "Description": "fantasy is a broad range of mental experiences, mediated by the faculty of imagination in the human brain, and marked by an expression of certain desires through vivid mental imagery.",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
    {
        "title": "Princess Mononoke",
        "description": "test description",
        "director": {
            "name": "Hayao Miyazaki",
            "description": "litteraly god of movies",
            "birthday": "xx/xx/xxxx",
        },
        "genre": {
            "name": "genre",
            "description": "genre description",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
    {
        "title": "Mary and the Witch's Flower",
        "description": "test description",
        "director": {
            "name": "Hiromasa Yonebayashi",
            "description": "bio",
            "birthday": "xx/xx/xxxx",
        },
        "genre": {
            "name": "genre",
            "description": "genre description",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
    {
        "title": "Spirited Away",
        "description": "test description",
        "director": {
            "name": "Hayao Miyazaki",
            "description": "litteraly god of movies",
            "birthday": "xx/xx/xxxx",
        },
        "genre": {
            "name": "genre",
            "description": "genre description",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
    {
        "title": "Corpse Bride",
        "description": "test description",
        "director": {
            "name": "Tim Burton and Mike Johnson",
            "description": "bio",
            "birthday": "xx/xx/xxxx",
        },
        "genre": {
            "name": "genre",
            "description": "genre description",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
    {
        "title": "The Nightmare Before Christmas",
        "description": "test description",
        "director": {
            "name": "Henry Selick",
            "description": "bio",
            "birthday": "xx/xx/xxxx",
        },
        "genre": {
            "name": "genre",
            "description": "genre description",
        },
        "imageURL": "url for movie cover",
        "featured": false,
    },
];

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());

//get route at '/' that returns 'Welcome!'
app.get('/', (req, res) => {
    res.send('Welcome!');
});

//new user
app.post('/users', (req, res) => {
    const newUser = req.body;
    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Name is required');
    }
});

//update user
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find(user => user.id == id);
    if (user) {
        user.name = updatedUser.name;
        res.status(201).json(user);
    } else {
        res.status(400).send('User does not exist');
    }
});

//post fav movie
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(201).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('User does not exist');
    }
});

//delete fav movie
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(201).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
        res.status(400).send('User does not exist');
    }
});

//delete user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        users = users.filter(user => user.id != id);
        res.status(201).send(`User ${id} has been deleted `);
    } else {
        res.status(400).send('User does not exist');
    }
});

//reads movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//gets movies
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Movie not found');
    }
});

//gets genre name
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
    if (genre){
        res.status(200).json(genre);
    } else {
        res.status(400).send('Genre not found');
    }
});

//gets director name
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    if (director) {
       return res.status(200).json(director);
    } else {
        res.status(400).send('Director not found');
    } 
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