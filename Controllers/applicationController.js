const { applicationModel } = require("../Models/applicationModel.js");
const { jobModel } = require("../Models/jobModel.js");
const cloduinary = require("cloudinary");

// ! Function For Posting An Application
async function postApplication(req, res, next) {
  try {
    //! Check the Role of the user
    const { Role } = req.user;
    if (Role === "Job Manager") {
      return next(new Error("Unathorized for this functionality"));
    }
    //!

    // ! Uploading The Resume Document
    if (!req.files) {
      return next(new Error("Resume File is required"));
    }

    const { Resume } = req.files;
    const allowedFormat = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormat.includes(Resume.mimetype)) {
      return next(
        new Error("Resume File is required in correct format in PNG,JPEG,WEBP")
      );
    }

    const cloduinaryResponse = await cloduinary.uploader.upload(
      Resume.tempFilePath
    );

    if (!cloduinaryResponse) {
      return next(new Error("cloduinaryResponse error"));
    }
    //!

    const { Name, Address, Email, Phone, coverLetter, jobId } = req.body;

    if (!jobId) {
      return next(new Error("Job Not Found"));
    }

    const applicantInfo = {
      user: req.user._id,
      Role: "Job Seeker",
    };

    // console.log(applicantInfo);

    const AppliedJobDetails = await jobModel.findById(jobId);

    const ManagerInfo = {
      user: AppliedJobDetails.postedBy,
      Role: "Job Manager",
    };
    // console.log(ManagerInfo);
    if (
      !Name ||
      !Address ||
      !Phone ||
      !coverLetter ||
      !Email ||
      !applicantInfo ||
      !ManagerInfo ||
      !Resume
    ) {
      return next(new Error("Enter All The Fields"));
    }

    const Application = await applicationModel.create({
      Name,
      Address,
      Email,
      Phone,
      coverLetter,
      applicantInfo,
      ManagerInfo,
      Resume: {
        public_id: cloduinaryResponse.public_id,
        url: cloduinaryResponse.secure_url,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Application Created Successfully",
      Application,
    });
  } catch (error) {
    return next(new Error(error.message));
  }
}

// ! Function to get the applications posted by a particular user
async function getMyApplication(req, res, next) {
  //! Check the Role of the user
  const { Role } = req.user;
  if (Role === "Job Manager") {
    return next(new Error("Unathorized for this functionality"));
  }
  //!

  //   ! Gettnig the Id of the user
  const { _id } = req.user;

  if (!_id) {
    return next(new Error("User not found"));
  }
  //   ! Fetching All the Jobs that the user has Applied for
  const myApplications = await applicationModel.find({
    "applicantInfo.user": _id,
  });

  if (myApplications.length <= 0) {
    return next(new Error("You Have Not Applied To Any of the Jobs"));
  }

  return res.status(200).json({
    success: true,
    message: "The Applications that u have applied are",
    myApplications,
  });
}

// ! Function To get All The Job Applications For A Particular Job Manager
async function JobManagerGetAllJobApplications(req, res, next) {
  try {
    //! Check the Role of the user
    const { Role } = req.user;
    if (Role === "Job Seeker") {
      return next(new Error("Unathorized for this functionality"));
    }
    //!

    const { _id } = req.user;
    console.log(_id);
    if (!_id) {
      return next(new Error("No User Found"));
    }

    const allApplication = await applicationModel.find({
      "ManagerInfo.user": _id,
    });

    if (allApplication.length <= 0) {
      return next(new Error("No Application Found for this Manager"));
    }

    return res.status(200).json({
      success: true,
      message: "The Applications that u have recived are",
      allApplication,
    });
  } catch (error) {
    return next(new Error(error.message));
  }
}

// ! Function To Delete A Job Application from Job Seeker
async function jobSeekerDeleteApplication(req, res, next) {
  //! Check the Role of the user
  const { Role } = req.user;
  if (Role === "Job Manager") {
    return next(new Error("Unathorized for this functionality"));
  }
  //!

  const { id } = req.params;

  if (!id) {
    return next(new Error("Id Is Required"));
  }

  const jobApplication = await applicationModel.findById(id);

  if (!jobApplication) {
    return next(new Error("Job Application Not Found"));
  }

  await jobApplication.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Job Application deleted successfully",
  });
}

module.exports = {
  postApplication,
  getMyApplication,
  JobManagerGetAllJobApplications,
  jobSeekerDeleteApplication,
};
