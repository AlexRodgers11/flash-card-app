const express = require("express");
const categoryRouter = express.Router();

const Category = require("../models/category");

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

module.exports = categoryRouter;