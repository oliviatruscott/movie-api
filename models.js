const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//example
let movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {
        name: String,
        description: String,
    },
    director: {
        name: String,
        bio: String,
        birth: String,
    },
    imagePath: String,
    featured: Boolean,
});

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: Date,
    favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

//hashes submitted passwords
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

//creates models as setup for export into index.js
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

//exports models to be used in index.js
module.exports.Movie = Movie;
module.exports.User = User;