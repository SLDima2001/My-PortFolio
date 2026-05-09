import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: {
            type: [String],
            required: true,
        },
        tech: {
            type: [String],
            required: true,
        },
        liveUrl: {
            type: String,
            default: "#",
        },
        githubUrl: {
            type: String,
            default: "#",
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Project = mongoose.model('Project', projectSchema);
