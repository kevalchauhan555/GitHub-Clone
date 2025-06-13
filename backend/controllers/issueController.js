const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createIssue = async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;

  try {
    const issue = new Issue({
      title,
      description,
      repository: id,
    });

    await issue.save();
    res.status(201).json({
      message: "Issue created successfully",
      issue: issue,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const updateIssueById = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const issue = await Issue.findByIdAndUpdate(
      id,
      { title, description, status },
      { new: true }
    );

    if (!issue) {
      return res.status(404).send("Issue not found");
    }

    res.json({
      message: "Issue updated successfully",
      issue: issue,
    });
  } catch (error) {
    console.error("Error updating issue:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteIssueById = async (req, res) => {
  const {id} = req.params;
  try{
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).send("Issue not found");
    }

    res.json({
      message: "Issue deleted successfully",
      issue: issue,
    });
  }catch(error) {
    console.error("Error deleting issue:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getAllIssues = async (req, res) => {
  try{
    const issue = await Issue.find({repository: req.params.id});
    if (!issue || issue.length === 0) {
      return res.status(404).send("No issues found");
    }
    res.json({
      message: "Issues fetched successfully",
      issues: issue,
    });
  }catch(error) {
    console.error("Error fetching issues:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getIssueById = async (req, res) => {
  const { id } = req.params;
  try{
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).send("Issue not found");
    }
    res.json({
      message: "Issue fetched successfully",
      issue: issue,
    });
  }
  catch (error) {
    console.error("Error fetching issue by ID:", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
