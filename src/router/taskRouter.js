import express from "express";
import Task from "../models/task.js";
import auth from "../middlewares/auth.js";
const router = express.Router();

// Store Task
router.post("/task/store", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });
    await task.save();
    res.status(200).send(task);
    console.log("task created");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error creating task");
  }
});
// Get Tasks 
// Filter-> /tasks?completed = true 
// Pagination-> /tasks?limit=2&skip=2 
// Sorting-> /tasks?sortBy=createdAt:desc or any other query
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  try {
    await req.user.populate({ path: "tasks", match, options:{
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort,
    } });
    res.status(200).send(req.user.tasks);
    console.log("Fetched tasks of user");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error getting tasks");
  }
});
// Get Task by id
router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.status(200).send(task);
    console.log("Fetched task by id");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error getting task by id");
  }
});
// Update Task by id
router.patch("/task/update/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(200).send(task);
    console.log("Updated task");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error updating task");
  }
});
// Delete Task by id
router.delete("/task/delete/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
    console.log("Deleted task");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error deleting task");
  }
});

export default router;
