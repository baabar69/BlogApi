const Post = require("../models/Post");
const path = require("path");

//@desc     Create a Post
//@route    POST /api/v1/post
//@access   Private
exports.createpost = async (req, res, next) => {
  try {
    const userPost = await Post.create(req.body);

    res.status(201).json({ status: true, data: userPost });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

//@desc     Get Posts
//@route    Get /api/v1/post/
//@access   Public
exports.getposts = async (req, res, next) => {
  try {
    let query;

    const reqQeury = { ...req.query };

    const removeFields = ["select", "page", "limit"];

    removeFields.forEach((param) => delete reqQeury[param]);

    let queryStr = JSON.stringify(reqQeury);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // console.log(queryStr);
    query = Post.find(JSON.parse(queryStr));

    //To select only title and textContent OR title and tags.
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      //   console.log(fields);
      query = query.select(fields);
    }

    //Default Values for Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //If all the results are showing in one request Pagination will eb an empty object
    const pagination = {};

    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    const post = await query;
    res.status(200).json({
      status: true,
      count: post.length,
      pagination,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
    });
  }
};

//@desc     Upload an image
//@route    PUT /api/v1/post/:id/photo
//@access   Private
exports.uploadimage = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }

    if (!req.files) {
      return res
        .status(400)
        .json({ success: false, message: "PLease upload an image" });
    }

    const file = req.files.file;
    //Check File Type
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        success: false,
        message: "file you are trying to upload is not an image",
      });
    }
    //Check FIleSize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return res.status(400).json({
        success: false,
        message: `PLease upload file less than ${process.env.MAX_FILE_UPLOAD}`,
      });
    }

    //Creating Custom file names so the files dont get overwritten
    file.name = `photo_${post.id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Problem With file uploading" });
      }

      await Post.findByIdAndUpdate(req.params.id, { photo: file.name });
      res.status(200).json({ success: true, data: file.name });
    });
    console.log(file.name);
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     update a Post
//@route    PUT /api/v1/post/:id
//@access   Private
exports.updatePost = async (req, res, next) => {
  try {
    const userPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!userPost) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: userPost });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

//@desc     delete a Post
//@route    DELETE /api/v1/post/:id
//@access   Private
exports.deletePost = async (req, res, next) => {
  try {
    const userPost = await Post.findByIdAndDelete(req.params.id);

    if (!userPost) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, message: "Post has been deleted" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};
