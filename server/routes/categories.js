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

categoryRouter.get("/", async (req, res, next) => {
    try {
        const categories = await Category.find({}, "-decks");
        res.status(200).send(categories);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

categoryRouter.get("/:categoryId/decks", (req, res, next) => {
    res.status(200).send(req.category.decks);
});

export default categoryRouter;