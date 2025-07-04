import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
