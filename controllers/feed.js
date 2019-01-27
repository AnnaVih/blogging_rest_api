const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');

exports.getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
        return res.status(200).json({message: 'Fetched posts successfully', posts})
    } catch(err){
        if (!err.statusCode) {
            err.status = 500;
        }
        next(err);    
    };
}

exports.createPost = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('Validation failed, entered data is incorrect');
            error.statusCode = 422;
            throw error
        }

        if(!req.file){
            const error = new Error('No image provided');
            error.statusCode = 422;
            throw error;
        }

        const imageUrl = req.file.path;

        const title = req.body.title;
        const content = req.body.content;

        const post = new Post({
            title, 
            content,
            imageUrl: imageUrl,
            creator: {
                name: 'Anna'
            }
        })

        const result = await post.save();
        return res.status(201).json({
            message: 'Post created successfully',
            post: result
        });

    } catch(err){
        if (!err.statusCode) {
            err.status = 500;
        }
        next(err);
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error('Could not find post.')
            error.statusCode = 404;
            throw err;
        }
        return res.status(200).json({message: 'Post fetched', post});
    } catch(err) {
        if (!err.statusCode) {
            err.status = 500
        }
        next(err)
    }
}

exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('Validation failed, entered data is incorrect');
            error.statusCode = 422;
            throw error
        }
    
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.image;
        if(req.file){
            imageUrl = req.file.path;
        }
    
        if(!imageUrl){
            const error = new Error('No file picked');
            error.statusCode = 422;
            throw error;
        }
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error
        }
    
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
    
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = await post.save();
        res.status(200).json({message: 'Post updated', post: result});
    } catch(err){
        if (!err.statusCode) {
            err.status = 500
        }
        next(err)
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if(!post){
            const error = new Error('Could not find a post');
            error.statusCode = 404;
            throw error
        }
    
        clearImage(post.imageUrl);
        const result = await Post.findByIdAndRemove(postId)
        res.status(200).json({message: 'Deleted post'});
    } catch(err) {
        if (!err.statusCode) {
            err.status = 500
        }
        next(err)
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('ddd',err));
}