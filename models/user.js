const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [isEmail, 'please enter valid email']
    },
    password: {
        type: String,
        required: true,
    },
});

// before saving to db
userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
  })
  
// login user
userSchema.statics.login = async function(username_or_email, password) {
    const user_from_username = await this.findOne({ username: username_or_email })
    const user_from_email = await this.findOne({ email: username_or_email })
    let user = user_from_username || user_from_email
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            return user
        }
        throw Error('incorrect password')
    }
    throw Error('incorrect email')
};
  
const User = mongoose.model('user', userSchema)
  
module.exports = User