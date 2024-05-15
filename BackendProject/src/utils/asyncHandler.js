// #Try-Catch

/*const asyncHandler = (fn) => async(req,red,next)=>{
    try {
        await fn(req,red,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}*/


const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}