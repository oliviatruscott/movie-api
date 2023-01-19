const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser= require('body-parser'),
    uuid = require('uuid'),
    app = express(),
    accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'}),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User;

app.use(morgan('common', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport');

//allows mongoose to connest to databade created in mongo shell
mongoose.connect('mongodb://127.0.0.1:27017/movieapiDB', {useNewUrlParser: true, useUnifiedTopology: true});

//get route at '/' that returns 'Welcome!'
app.get('/', (req, res) => {
    res.send('Welcome!');
});

//new user (post)
app.post('/users', (req, res) => {
    Users.findOne({ username: req.body.username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.username + 'already exists');
        } else {
            Users
                .create({
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    birthday: req.body.birthday,
                })
                .then((user) =>{res.status(201).json(user)})
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//get all users (read)
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//get a user by username (read)
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ username: req.params.username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//update user info by username (update)
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, { $set: 
        {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday,
        }
    },
    { new: true },  //makes sure that updated doc is returned
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//add fav movie to user's list (update?)
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, { 
        $push: { favoriteMovies: req.params.movieId }
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//remove fav movie from users list (delete)
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req,res) => {
    Users.findOneAndUpdate({ username: req.params.username },
        { $pull : { favoriteMovies: req.params.movieID }
    },
    { new: true },
    (err, updateUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updateUser);
        }
    });
});

//delete user by username (delete)
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
        .then((user) => {
            if(!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//get all movies (read)
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//get movies by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ title: req.params.title })
        .then ((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//get movie by genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'genre.name': req.params.genreName })
        .then((movie) => {
            res.json(movie.genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//get movie by director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'director.name': req.params.directorName })
        .then((movie) => {
            res.json(movie.director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
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

//listen for requests OLD
app.listen(8080, () => {
    console.log('listening on port 8080');
});