const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(owner) || !name) {
      return res.status(400).send("All fields are required");
    }
    const newRepository = new Repository({
      name,
      owner,
      issues,
      content,
      description,
      visibility,
    });
    const result = await newRepository.save();
    res.status(201).json({
      message: "Repository created successfully",
      repository: result,
    });
  } catch (error) {
    console.error("Error creating repository:", error);
    res.status(500).send("Internal Server Error");
  }
};

const getAllRepository = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

     res.json(repositories);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).send("Internal Server Error");
  }
};

const fetchRepositoryById = async (req, res) => {
  const repoID = req.params.id;
  try {
    const repository = await Repository.find({ _id: repoID })
      .populate("owner", "username")
      .populate("issues");

    if (!repository || repository.length === 0) {
      return res.status(404).send("Repository not found");
    }

    res.json(repository);
  } catch (err) {
    console.error("Error fetching repository by ID:", err);
    res.status(500).send("Internal Server Error");
  }
};

const fetchRepositoryByName = async (req, res) => {
  const repoName = req.params.name;
  try {
    const repository = await Repository.find({ name: repoName })
      .populate("owner", "username")
      .populate("issues");

    if (!repository || repository.length === 0) {
      return res.status(404).send("Repository not found");
    }

    res.json(repository);
  } catch (err) {
    console.error("Error fetching repository by Name:", err);
    res.status(500).send("Internal Server Error");
  }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
  const {userId} = req.params;
  try {
    const repositories = await Repository.find({ owner: userId });
    if (!repositories || repositories.length === 0) {
      return res.status(404).send("No repositories found for this user");
    }

    res.json(repositories , { message: "Repositories fetched successfully" });
  } catch (err) {
    confirm.error("Error fetching repository for current user:", err);
    res.status(500).send("Internal Server Error");
  }
};

const updateRepositoryById = async (req, res) => {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    const repository = await Repository.findByIdAndUpdate(
      id,
      { content, description },
      { new: true }
    );

    if (!repository) {
      return res.status(404).send("Repository not found");
    }

    res.json({
      message: "Repository updated successfully",
      repository,
    });
  } catch (error) {
    console.error("Error updating repository:", error);
    res.status(500).send("Internal Server Error");
  }
};

const toggleVisibilityById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).send("Repository not found");
    }

    repository.visibility = !repository.visibility; // Toggle visibility
    await repository.save();

    res.json({
      message: "Repository visibility toggled successfully",
      repository,
    });
  } catch (error) {
    console.error("Error toggling repository visibility:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteRepositoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).send("Repository not found");
    }

    // Optionally, delete associated issues
    await Issue.deleteMany({ repository: id });

    res.json({
      message: "Repository deleted successfully",
      repository,
    });
  } catch (error) {
    console.error("Error deleting repository:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createRepository,
  getAllRepository,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  updateRepositoryById,
  deleteRepositoryById,
  toggleVisibilityById,
};
