import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
  
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //     message: "Chai Aur Biscuit"
  // })
  //get user from frontend
  //validation - not empty
  //check if user already exists: username or email
  //check for images , check for avatar
  //upload them to cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullName, email, username, password } = req.body;
  // console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with emial or UserName alreaxy exists");
  }

  console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "Something Went Wrong while creating the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*//get the user from Frontend
  //Validate and Check if the user exists or send it to register user
  //If user exists Log him in the system
  These are my written Todo's*/

  /* req body se data nikalo
     username ya email ke basis pe check karo
     find the user
     password check
     access and refresh token
     send cookie */

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email Required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){ 
      throw new ApiError(401,"Unauthorized Request")
    }

    try {
      const deocdedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(deocdedToken?._id)
  
      if(!user)
        {
          throw new ApiError(401,"Invalid Refresh Token")
        }
  
      if(incomingRefreshToken  !== user?.refreshToken){
        throw new ApiError(401,"Refresh Token is Expired or used")
      }
  
      const options = {
        httpOnly : true,
        secure : true
      }
  
     const {accessToken , newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken",accessToken)
      .cookie("refreshToken",newRefreshToken)
      .json(
        new ApiResponse(200,{accessToken,refreshToken : newRefreshToken},"Access Token Refreshed")
      )
    } catch (error) {
      throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
});

const changeCurrentPassword = asyncHandler(async(req,res) => {
  const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
      throw new ApiError(400 , "Invalid Password");
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})


    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
  return res
  .status(200)
  .json(200,req,user,"Current User Fetched Successfully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
  const {fullName, email} = req.body
  //Agar Files Update karwa rahe ho toh uska alag controllers rakhna

  if (!fullname || !email) {
    throw new ApiError(400,"All Fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        fullName,//ES6 ka syntax hai
        email : email,
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is Missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400,"Error While Uploading Avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        avatar : avatar.url,
      }
    },
    {
      new:true
    }
  ).select("-password")

  return res
  .status(200)
  .ApiResponse(200,user,"Avatar Updated Successfully")
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400,"Covar Image File is Missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,"Error While Uploading Cover Image")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set : {
        coverImage : coverImage.url,
      }
    },
    {
      new:true
    }
  ).select("-password")

  return res
  .status(200)
  .ApiResponse(200,user,"Cover Image Updated Successfully")

})


export { registerUser, loginUser, logoutUser , refreshAccessToken , changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage};
