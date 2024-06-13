const { userModel } = require("../Models/userMode.js");
const { GenerateToken } = require("../Services/JWTServices.js");
const {
  hashPassword,
  comparePassword,
} = require("../Services/bcryptPasswordService.js");
const jwt = require("jsonwebtoken");

// ! Function For Creating A new User
async function createUser(req, res, next) {
  try {
    const { Name, Password, Email, Role, Phone } = req.body;

    //   ! Checking If User has enter All details
    if (!Name || !Password || !Email || !Role || !Phone) {
      return res.status(400).json({
        message: "Enter All The Details",
      });
    }

    // ! Password hashing
    const hashedPassword = await hashPassword(Password);

    //! Checking if the user exists
    const userExists = await userModel.findOne({ Email });
    if (userExists) {
      return res.status(400).json({
        message: "You already have an account with this email",
      });
    }

    //! Creating the user
    const userData = {
      Name,
      Password: hashedPassword,
      Email,
      Role,
      Phone,
    };

    const createdUser = await userModel.create(userData);

    res.status(200).json({
      success: true,
      message: "User created successfully",
      user: createdUser,
    });
  } catch (error) {
    return next(error);
  }
}

//! Function For Log In The User
async function logInUser(req, res, next) {
  const { Email, Password, Role } = req.body;

  //  ! Checking If User has enter All details
  if (!Email || !Password || !Role) {
    return next(new Error("Enter Email,Password and Role"));
  }

  const userDetails = await userModel.findOne({
    Email,
    Role,
  });

  if (!userDetails) {
    return next(new Error("User not found Enter Correct Email and Role"));
  }

  const CheckPassword = await comparePassword(Password, userDetails.Password);

  if (!CheckPassword) {
    return next(new Error("Invalid password"));
  }
  // ! User Data
  const userData = {
    id: userDetails._id,
    Email,
    Role,
    Password: userDetails.Password,
  };

  // ! JWT Token Generated and stored in cookies
  const JWTTOKEN = await GenerateToken(userData, res, next);
  req.user = userDetails;

  return res.status(200).json({
    success: true,
    message: "User Logged in successfully",
    userDetails,
    JWTTOKEN,
  });
}

//! Function for Log Out The User
async function logOutUser(req, res) {
  res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expiresIn: "1h",
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
}

// ! Function To Get All the Users
async function getAllUsers(req, res, next) {
  const Role = req.user.Role;

  if (Role === "Job Seeker") {
    return next(new Error("Job Seeker Not Allowed"));
  }

  const ExistingUsers = await userModel.find({});

  return res.status(200).json({
    success: true,
    message: "ExistingUsers are",
    ExistingUsers,
  });
}

// ! Function To Get Current user information
async function getCurrentUser(req, res, next) {
  const { _id } = req.user;

  if (!_id) {
    return next(new Error("No User Is Present"));
  }

  const currentUser = await userModel.findById(_id);
  if (!currentUser) {
    return next(new Error("No User Is Present in the DB"));
  }

  return res.status(200).json({
    success: true,
    message: "User Details are",
    currentUser,
  });
}
module.exports = {
  createUser,
  logInUser,
  logOutUser,
  getAllUsers,
  getCurrentUser,
};
