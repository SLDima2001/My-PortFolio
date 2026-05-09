import mongoose from "mongoose";

const profileSchema = mongoose.Schema(
    {
        images: {
            type: [String],
            required: true,
        },
        bio: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Profile = mongoose.model('Profile', profileSchema);
