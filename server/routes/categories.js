import express from "express";
const categoryRouter = express.Router();

import Category from "../models/category.js";

categoryRouter.param("categoryId", (req, res, next, categoryId) => {
    Category.findById(categoryId, (err, category) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!category) {
                res.status(404).send("Category not found");
            } else {
                req.category = category;
                next();
            }
        }
    });
});

categoryRouter.get("/", (req, res, next) => {
    Category.find({}, (err, categories) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            res.status(200).send(categories);
        }
    });
});

categoryRouter.get("/:categoryId/decks", (req, res, next) => {
    res.status(200).send(req.category.decks);
});

export default categoryRouter;