import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // Get video ID and pagination parameters from request
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate video ID
  if (!videoId) {
    throw new ApiError(400, "Video Not Found");
  }

  // Define options for pagination (adjust as needed)
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }, // Sort by creation date descending
  };

  // Build the aggregation pipeline
  const aggregation = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId), // Convert videoId to ObjectId
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwner",
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        commentOwner: {
          username: 1,
          fullName: 1,
        },
      },
    },
    {
      $facet: {
        data: [
          { $skip: (options.page - 1) * options.limit },
          { $limit: options.limit },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];

  // Use Comment.aggregatePaginate to handle pagination
  Comment.aggregatePaginate(aggregation, options)
    .then((data) => {
      const { docs: comments, totalDocs: totalCount } = data;

      // Handle successful response
      if (!comments?.length) {
        return res
          .status(200)
          .json(new ApiResponse(200, [], "No Comments Found"));
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { comments, totalCount },
            "Comments Fetched Successfully"
          )
        );
    })
    .catch((error) => {
      console.error("Error fetching comments:", error);
      // Handle errors appropriately (e.g., throw a custom error)
    });
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;

  if (!videoId || !content?.trim()) {
    throw new ApiError(400, "Missing required data (videoId or content)");
  }

  const newComment = new Comment({
    video: videoId,
    content,
    owner: req.owner?._id, // Assuming user ID is available in req.user
  });

  try {
    await newComment.save();
  } catch (error) {
    console.error("Error saving comment:", error);
    throw new ApiError(500, "Failed to add comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { videoId, content } = req.body;

  if (!videoId || !content?.trim()) {
    throw new ApiError(400, "Missing required data (videoId or content)");
  }

  const updateCriteria = {
    video: new mongoose.Types.ObjectId(videoId.toString()),
    owner: req.owner?._id, // Assuming user ID for authenticated owner
  };

  try {
    const updatedComment = await Comment.findOneAndUpdate(
      updateCriteria,
      {
        $set: {
          content,
        },
      },
      { new: true } // Return the updated document
    ).select("-videos"); // Exclude unnecessary field (optional)

    if (!updatedComment) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Comment Not Found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "Comment Updated Successfully")
      );
  } catch (error) {
    console.error("Error updating comment:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to Update Comment"));
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment based on videoId and owner (assuming authentication)

  const { videoId } = req.body; // Assuming only videoId is needed for deletion

  if (!videoId) {
    throw new ApiError(400, "Missing required data (videoId)");
  }

  const deleteCriteria = {
    video: new mongoose.Types.ObjectId(videoId.toString()),
    owner: req.user?._id, // Assuming user ID for authenticated owner
  };

  try {
    const deletedComment = await Comment.findOneAndDelete(deleteCriteria);

    if (!deletedComment) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Comment Not Found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment Deleted Successfully"));
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to Delete Comment"));
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
