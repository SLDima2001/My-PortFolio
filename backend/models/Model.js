import mongoose from "mongoose";

const cusfeedback = mongoose.Schema(
    {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            subject: {
                type: String,
                required: false,
            },
            message: {
                type: String,
                required: true,
            },
    },
    {
        timestamps: true,
    }
);

export const feedback = mongoose.model('feedback', cusfeedback);
