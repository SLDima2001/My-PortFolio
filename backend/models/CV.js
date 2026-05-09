import mongoose from "mongoose";

const cvSchema = mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        originalname: {
            type: String,
            required: true,
        },
        mimetype: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const CV = mongoose.model('CV', cvSchema);
