require("dotenv").config();
const express = require("express");
const { Project } = require("../models/project");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get(`/`, async (req, res) => {
  try {
    const projectList = await Project.find();

    if (!projectList) {
      res.status(500).json({ success: false });
    }
    res.send(projectList);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(500).json({ success: false });
    }
    res.send(project);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/", upload.array("images"), async (req, res) => {
  try {
    let imagesUrl = [];
    let imagesPublic = [];
    const files = req.files;
    for (const image of files) {
      const { path } = image;
      const newPath = await cloudinary.uploader.upload(path);
      imagesUrl.push(newPath.url);
      imagesPublic.push(newPath.public_id);
    }
    console.log(files);

    let project = new Project({
      title: req.body.title,
      description: req.body.description,
      demoLinks: req.body.demoLinks,
      githubLinks: req.body.githubLinks,
      images: imagesUrl.map((item) => item),
      author: req.auth.userId,
      cloudinary_id: imagesPublic.map((item) => item),
    });
    project = await project.save();
    if (!project) {
      return res.status(404).send("project tidak bisa dibuat");
    }
    res.send(project);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete(`/:id`, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    for (const ids of project.cloudinary_id) {
      await cloudinary.uploader.destroy(ids);
    }
    await project.remove();
    res.send("deleted");
  } catch (err) {
    console.log(err);
  }
});

router.put(`/:id`, upload.array("images"), async (req, res) => {
  try {
    if (req.files && req.files.length > 0) {
      let project = await Project.findById(req.params.id);
      for (const ids of project.cloudinary_id) {
        await cloudinary.uploader.destroy(ids);
      }
      let imagesUrl = [];
      let imagesPublic = [];
      const files = req.files;
      for (const image of files) {
        const { path } = image;
        const newPath = await cloudinary.uploader.upload(path);
        imagesUrl.push(newPath.url);
        imagesPublic.push(newPath.public_id);
      }
      console.log(Boolean(req.files));
      let projectData = {
        title: req.body.title || project.title,
        description: req.body.description || project.description,
        demoLinks: req.body.demoLinks || project.demoLinks,
        githubLinks: req.body.githubLinks || project.githubLinks,
        images: imagesUrl.map((item) => item) || project.images,
        creator: req.body.creator || project.creator,
        cloudinary_id:
          imagesPublic.map((item) => item) || project.cloudinary_id,
      };
      project = await Project.findByIdAndUpdate(req.params.id, projectData, {
        new: true,
      });
      res.json(project);
    } else {
      let project = await Project.findById(req.params.id);
      let projectData = {
        title: req.body.title || project.title,
        description: req.body.description || project.description,
        demoLinks: req.body.demoLinks || project.demoLinks,
        githubLinks: req.body.githubLinks || project.githubLinks,
        images: project.images,
        creator: req.body.creator || project.creator,
        cloudinary_id: project.cloudinary_id,
      };
      project = await Project.findByIdAndUpdate(req.params.id, projectData, {
        new: true,
      });
      res.json(project);
      console.log(res.json);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
