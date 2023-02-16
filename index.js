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
    Users = Models.User,
    { check, validationResult } = require('express-validator');

//connect to mongodb locally
//mongoose.connect('mongodb://127.0.0.1:27017/movieapiDB', { useNewUrlParser: true, useUnifiedTopology: true });

//connect to mongodb remotely using variable defined in heroku to keep db uri hidden
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const cors = require('cors');
//list of allowed origins, make sure all are allowed (UPDATE!!!!)
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
//limits users access to not allowed origins
app.use(cors({
    orgin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = 'The CORS policy for this application doesnt allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null,true);
    }
}));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport');

app.use(express.static('public'));
app.use(morgan('common'));

//get route at '/' that returns 'Welcome!'
app.get('/', (req, res) => {
    res.send('Welcome!');
});

//new user (post)
app.post('/users',
[ //validation logic for request
    check('username', 'Username is required').isLength({min: 5}),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid.').isEmail()
], (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.username + 'already exists');
        } else {
            Users
                .create({
                    username: req.body.username,
                    password: hashedPassword,
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
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ username: req.params.username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//update user info by username
app.put('/users/:username', 
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail(),
        passport.authenticate('jwt', { session: false }),
    ], (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
        },
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

//add fav movie to user's list
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

//remove fav movie from users list
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

//delete user by username
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

//get all movies
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

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});