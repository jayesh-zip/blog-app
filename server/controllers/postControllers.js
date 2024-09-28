const Post = require('../models/postModel')
const User = require('../models/userModel')
const cloudinary = require('cloudinary').v2;
const HttpError = require('../models/errorModel')

// ***************** CREATE A POST
// POST : api/posts
// PROTECTED
const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;
        if (!title || !category || !description || !req.file) {
            return next(new HttpError("Fill in all fields and choose a thumbnail.", 422));
        }

        // Extract Cloudinary details from the file object
        const thumbnailUrl = req.file.path; // Cloudinary URL
        const thumbnailPublicId = req.file.filename; // Cloudinary public ID (from multer-storage-cloudinary)

        // Create a new post with the Cloudinary URL and public ID
        const newPost = await Post.create({
            title,
            category,
            description,
            thumbnail: thumbnailUrl, // Use Cloudinary URL
            thumbnailPublicId: thumbnailPublicId, // Save the public ID
            creator: req.user.id
        });

        if (!newPost) {
            return next(new HttpError("Post couldn't be created.", 422));
        }

        // Find user and increase post count by 1
        const currentUser = await User.findById(req.user.id);
        const userPostCount = currentUser.posts + 1;
        await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

        res.status(201).json(newPost);
    } catch (error) {
        return next(new HttpError(error));
    }
};

// ***************** GET ALL POSTS
// GET : api/posts
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
}

// ***************** GET SINGLE POSTS
// GET : api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("post not found.", 404));
        }
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError("Post not found", 422));
    }
}

// ***************** GET POSTS BY CATEGORY
// GET : api/posts/categories/:category
// UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError("No post at this category.", 422));
    }
}

// ***************** GET USER/AUTHOR POST
// GET : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
}

// ***************** EDIT POST
// PATCH : api/posts/:id
// PROTECTED
const editPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let { title, category, description } = req.body;

        // Check if all required fields are provided
        if (!title || !category || !description) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        const oldPost = await Post.findById(postId);
        if (!oldPost) {
            return next(new HttpError("Post not found.", 404));
        }

        if (req.user.id == oldPost.creator) {
            let updateFields = { title, category, description };

            if (req.file) {
                // Delete old thumbnail from Cloudinary
                if (oldPost.thumbnailPublicId) {
                    try {
                        await cloudinary.uploader.destroy(oldPost.thumbnailPublicId);
                    } catch (err) {
                        return next(new HttpError("Failed to delete old thumbnail.", 500));
                    }
                }

                // Use the file details from Cloudinary storage
                const result = await cloudinary.uploader.upload(req.file.path);

                updateFields.thumbnail = result.secure_url;
                updateFields.thumbnailPublicId = result.public_id;
            }

            const updatedPost = await Post.findByIdAndUpdate(postId, updateFields, { new: true });

            if (!updatedPost) {
                return next(new HttpError("Couldn't update post.", 400));
            }

            res.status(200).json(updatedPost);
        } else {
            return next(new HttpError("Unauthorized to update this post.", 403));
        }
    } catch (error) {
        return next(new HttpError(error));
    }
};

// ***************** DELETE POST
// DELETE : api/posts/:id
// PROTECTED
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            return next(new HttpError("Post ID is required.", 400));
        }

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }

        if (req.user.id == post.creator) {
            // Delete thumbnail from Cloudinary
            if (post.thumbnailPublicId) {
                try {
                    await cloudinary.uploader.destroy(post.thumbnailPublicId);
                } catch (err) {
                    return next(new HttpError("Failed to delete thumbnail from Cloudinary.", 500));
                }
            }

            // Delete the post from the database
            await Post.findByIdAndDelete(postId);

            // Find user and reduce post count by 1
            const currentUser = await User.findById(req.user.id);
            if (currentUser) {
                const userPostCount = currentUser.posts - 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
            }

            res.status(200).json({ message: `Post ${postId} deleted successfully.` });
        } else {
            return next(new HttpError("Unauthorized to delete this post.", 403));
        }
    } catch (error) {
        return next(new HttpError("An error occurred while deleting the post.", 500));
    }
};

module.exports = { createPost, getPost, getPosts, getCatPosts, getUserPosts, editPost, deletePost }
