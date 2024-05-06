import mongoose from "mongoose"

const doctorsSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
        },
        salary : {
            type : String,
            required : true,
        },
        qualifications : {
            type : String,
            required : true,
        },
        experienceinYears : {
            type : Number,
            default : 0,
        },
        worksInHospitals :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Hospital"
        }]
    },
    {timestamps:true})

export const Doctors = mongoose.model("Doctors",doctorsSchema)