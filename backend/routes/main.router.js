const express = require("express");

const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/repo", repoRouter);
mainRouter.use("/issue", issueRouter);


mainRouter.get("/", (req, res) => {
  res.send("Welcome to the Git Server");
});

module.exports = mainRouter;
