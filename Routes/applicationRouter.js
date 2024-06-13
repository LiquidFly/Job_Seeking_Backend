const express = require("express");
const {
  postApplication,
  getMyApplication,
  JobManagerGetAllJobApplications,
  jobSeekerDeleteApplication
} = require("../Controllers/applicationController.js");
const { isAuthorized } = require("../Middlewares/isAuthorized.js");

const Router = express.Router();

Router.get("/getMyApplication", isAuthorized, getMyApplication);
Router.get(
  "/JobManagerGetAllJobApplications",
  isAuthorized,
  JobManagerGetAllJobApplications
);
Router.post("/postApplication", isAuthorized, postApplication);
Router.post(
  "/jobSeekerDeleteApplication/:id",
  isAuthorized,
  jobSeekerDeleteApplication
);

module.exports = Router;
