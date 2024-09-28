const { Router } = require('express')

const { createPost, getPost, getPosts, getCatPosts, getUserPosts, editPost, deletePost } = require('../controllers/postControllers')
const authMiddleware = require('../middleware/authMiddleware')
const { cloudinaryFileUploader } = require('../middleware/FileUplaoder')

const router = Router()


router.post('/', authMiddleware, cloudinaryFileUploader.single('thumbnail'), createPost)
router.get('/', getPosts)
router.get('/:id', getPost)
router.get('/categories/:category', getCatPosts)
router.get('/users/:id', getUserPosts)
router.patch('/:id', authMiddleware, cloudinaryFileUploader.single('thumbnail'), editPost);
router.delete('/:id', authMiddleware, cloudinaryFileUploader.single('thumbnail'), deletePost);

module.exports = router