import mongoose, {Schema} from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        isPermanent: {
            type: Boolean,
            default: false
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }

)

const Playlist = mongoose.model("Playlist", playlistSchema)

export default Playlist