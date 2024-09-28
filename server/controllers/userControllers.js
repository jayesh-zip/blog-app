const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;


const User = require('../models/userModel')
const HttpError = require('../models/errorModel')


// ================== REGISTER A NEW USER
// POST: api/users/register
// UNPROTECTED
const registerUser = async (req, res, next) => {
    try {
        const {name, email, password, password2} = req.body;
        if(!name || !email || !password) {
            return next(new HttpError("Fill in all fields.", 422))
        }

        const newEmail = email.toLowerCase()

        const emailExists = await User.findOne({email: newEmail})
        if(emailExists) {
            return next(new HttpError("Email already exists.", 422))
        }

        if((password.trim()).length < 6) {
            return next(new HttpError("password should be at least 6 characters.", 422))
        }
         
        if(password != password2) {
            return next(new HttpError("Password do not match.", 422))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({name, email: newEmail, password: hashedPass});
        res.status(201).json(`New user ${newUser.email} registerd.`)

    } catch (error) {
        return next(new HttpError("User registration faild.", 422))
    }
}



// ================== LOGIN A REGISTER USER
// POST: api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError('Fill in all filds.', 422))
        }

        const newEmail = email.toLowerCase();
        const user = await User.findOne({email: newEmail})
        if(!user) {
            return next(new HttpError("Invalid credentials.", 422))
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if(!comparePass) {
            return next(new HttpError("Invalid credentials.", 422))
        }

        const {_id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json({token, id, name})
    } catch (error) {
        return next(new HttpError("Login failed. Please check uour credentials.", 422))
    }
}



// ================== USER PROFILE
// POST: api/users/:id
// PROTECTED
const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password');

        if(!user) {
            return next(new HttpError("User not found.", 404))
        }
        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError(error))
    }
}




// ================== CHANGE USER AVATER (PROFILE PICTURE)
// POST: api/users/change-avatar
// PROTECTED                                    
const changeAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new HttpError("Please choose an image.", 422));
        }

        // Find the user in the database
        const user = await User.findById(req.user.id);

        // Delete the old avatar from Cloudinary if it exists
        if (user.avatarPublicId) {
            try {
                await cloudinary.uploader.destroy(user.avatarPublicId);
                ('Old avatar deleted from Cloudinary successfully.');
            } catch (err) {
                console.error('Error deleting old avatar from Cloudinary:', err);
                return next(new HttpError("Failed to delete old avatar.", 500));
            }
        }

        // Extract the new file's Cloudinary details from req.file
        const avatarUrl = req.file.path; // Cloudinary secure_url
        const avatarPublicId = req.file.filename; // Cloudinary public_id

        // Update the user's avatar URL and public ID in the database
        user.avatar = avatarUrl;
        user.avatarPublicId = avatarPublicId;

        // Save the updated user information
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating avatar:', error);
        return next(new HttpError("An error occurred while updating the avatar.", 500));
    }
};







// ================== EDIT USER DETAILS (FROM PROFILE)
// POST: api/users/edit-user
// PROTECTED
const editUser = async (req, res, next) => {
    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name || !email ||!currentPassword || !newPassword) {
            return next(new HttpError("Fill in all filds.", 422))
        }

        // Get user from database
        const user = await User.findById(req.user.id);
        if(!user) {
            return next(new HttpError("User not found.", 403))
        }

        // Make sure new email doesn't alreeady exist        
        const emailExist = await User.findOne({email});
        // we want to update other details with?without changing the email (which is a unique to because we use it to login).
        if(emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Email already exist.", 422))
        }

        // compare current password to db password
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if(!validateUserPassword) {
            return next(new HttpError("Invalid current password.", 422))
        }

        // compare new password
        if(newPassword !== confirmNewPassword) {
            return next(new HttpError("New password do not match.", 422))
        }

        // hash user password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // update user info in database
        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password: hash}, {new: true})
        res.status(200).json(newInfo)
    } catch (error) {
        return next(new HttpError(error))
    }
}




// ================== GET AUTHORS
// POST: api/users/authors
// UNPROTECTED
const getAuthors = async (req, res, next) => {
    try {
        const authors = await User.find().select('-password');
        res.json(authors);
    } catch (error) {
        return next(new HttpError(error))
    }
}

 module.exports = {registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors}
