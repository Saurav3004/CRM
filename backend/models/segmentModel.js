import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
    name:String,
    description:String,
    conditions:{
        field:String,
        operator:String,
        value:mongoose.Mixed
    }
},{
    timestamps:true
})

export const Segment = mongoose.model("Segment",segmentSchema);