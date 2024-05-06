import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Product",
        },
        quantity: {
            type : Number,
            required: true,
        }
    })

const orderSchema = new mongoose.Schema(
    {
        orderPrice : {
            type : Number,
            required : true,
        },
        customer : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        orderItems : {
            type : [orderItemSchema]
        },
        address: {
            type : Number,
            required : true,
        },
        status: {
            type : String,
            //enum ka matlab hai choices i.e you can only choose between these 
            enum : ["PENDING","CANCELLED" , "DELIVERED"],
            default: "PENDING"
        }
    },
    {timestamps : true})

export const Order = mongoose.model("Order" , orderSchema)