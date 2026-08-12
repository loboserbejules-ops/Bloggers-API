const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const { verify } = require("../auth");

router.post("/", verify, postController.addPost);
router.get("/", postController.getAllPosts);

router.get("/active", postController.getAllActive); 
router.get("/:id", postController.getPost);
router.patch("/:id", verify, postController.updatePost);
router.delete("/:id", verify, postController.deletePost);
router.patch("/:id/like", verify, postController.likePost);
router.post("/:id/comment", verify, postController.addComment);

router.patch("/:id/archive", verify, postController.archivePost);
router.patch("/:id/activate", verify, postController.activatePost);

module.exports = router;