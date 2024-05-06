import mongoose from "mongoose"

const medicalRecordsSchema = new mongoose.Schema(
    {

    },
    {timestamps:true})

export const Medical = mongoose.model("Medical",medicalRecordsSchema)