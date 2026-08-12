const Post = require("../models/Post");

// Create a new blog post
module.exports.addPost = (req, res, next) => {
    if (!req.body.title || !req.body.content) {
        return res.status(400).send({ message: "Title and content are required" });
    }

    let newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        author: req.user.username
    });

    return newPost
        .save()
        .then((post) => res.status(201).send(post))
        .catch((err) => next(err));
};

// View all blog posts
module.exports.getAllPosts = (req, res, next) => {
    return Post.find({})
        .then((posts) => res.status(200).send(posts))
        .catch((err) => next(err));
};

// View all active blog posts
module.exports.getAllActive = (req, res, next) => {
    return Post.find({ isActive: true })
        .then((posts) => res.status(200).send(posts))
        .catch((err) => next(err));
};

// View a single blog post by ID
module.exports.getPost = (req, res, next) => {
    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }
            return res.status(200).send(post);
        })
        .catch((err) => next(err));
};

// Update a blog post
module.exports.updatePost = (req, res, next) => {
    const { title, content } = req.body;

    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            if (post.author !== req.user.username) {
                return res.status(403).send({ message: "Action Forbidden: You can only update your own posts" });
            }

            return Post.findByIdAndUpdate(
                req.params.id,
                { title, content },
                { new: true }
            ).then((updatedPost) =>
                res.status(200).send({
                    message: "Post updated successfully",
                    post: updatedPost
                })
            );
        })
        .catch((err) => next(err));
};

// Delete a blog post
module.exports.deletePost = (req, res, next) => {
    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            const isOwner = post.author === req.user.username;
            const isAdmin = req.user.isAdmin === true;

            if (!isOwner && !isAdmin) {
                return res.status(403).send({ message: "Action Forbidden: You can only delete your own posts" });
            }

            return Post.findByIdAndDelete(req.params.id)
                .then(() => res.status(200).send({ message: "Post deleted successfully" }));
        })
        .catch((err) => next(err));
};

// Toggle Like / Unlike Post (Any authenticated user including author)
module.exports.likePost = (req, res, next) => {
    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            const isLiked = post.likes.some(
                (like) => like.userId.toString() === req.user.id
            );

            if (isLiked) {
                post.likes = post.likes.filter(
                    (like) => like.userId.toString() !== req.user.id
                );
            } else {
                post.likes.push({ userId: req.user.id });
            }

            return post.save().then((updatedPost) =>
                res.status(200).send({
                    message: isLiked ? "Post unliked" : "Post liked",
                    likesCount: updatedPost.likes.length,
                    likes: updatedPost.likes
                })
            );
        })
        .catch((err) => next(err));
};

// Add Comment to Post (Any authenticated user)
module.exports.addComment = (req, res, next) => {
    if (!req.body.comment || req.body.comment.trim() === "") {
        return res.status(400).send({ message: "Comment content is required" });
    }

    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            const newComment = {
                userId: req.user.id,
                username: req.user.username,
                comment: req.body.comment
            };

            post.comments.push(newComment);

            return post.save().then((updatedPost) =>
                res.status(201).send({
                    message: "Comment added successfully",
                    comments: updatedPost.comments
                })
            );
        })
        .catch((err) => next(err));
};

// Archive a blog post (Author or Admin)
module.exports.archivePost = (req, res, next) => {
    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            const isOwner = post.author === req.user.username;
            const isAdmin = req.user.isAdmin === true;

            if (!isOwner && !isAdmin) {
                return res.status(403).send({ message: "Action Forbidden: You are not authorized to archive this post" });
            }

            post.isActive = false;

            return post.save().then((updatedPost) =>
                res.status(200).send({
                    message: "Post archived successfully",
                    post: updatedPost
                })
            );
        })
        .catch((err) => next(err));
};

// Activate an archived blog post (Author or Admin)
module.exports.activatePost = (req, res, next) => {
    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            const isOwner = post.author === req.user.username;
            const isAdmin = req.user.isAdmin === true;

            if (!isOwner && !isAdmin) {
                return res.status(403).send({ message: "Action Forbidden: You are not authorized to activate this post" });
            }

            post.isActive = true;

            return post.save().then((updatedPost) =>
                res.status(200).send({
                    message: "Post activated successfully",
                    post: updatedPost
                })
            );
        })
        .catch((err) => next(err));
};