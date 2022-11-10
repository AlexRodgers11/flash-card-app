import express from "express";
const userRouter = express.Router();

import User from "../models/user.js";
import Group from "../models/group.js";
import Deck from "../models/deck.js";
import Attempt from "../models/attempt.js";
import { Message } from "../models/message.js";
// import Notification from '../models/notification.js';
import { Notification } from '../models/notification.js';
import { generateCode, generateRandomFileName } from "../utils.js";

import multer from "multer";
import { getObjectSignedUrl, uploadFile } from "../s3.js";

userRouter.param("userId", (req, res, next, userId) => {
    User.findById(userId, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else if(!user) {
            res.status(404).send("User not found");
        } else {
            req.user = user;
            next();
        }
    });
});

userRouter.get("/emails", async (req, res, next) => {
    console.log("Req.query.email", req.query.email);
    if(req.query.email) {
        let user = await User.findOne({"login.email": req.query.email});
        res.status(200).send({emailAvailable: !user});
    } else {
        res.status(400).send("No email submitted");
    }
});

userRouter.get("/:userId/tile", async (req, res, next) => {
    let partialData = {
        firstName: req.user.name.first,
        lastName: req.user.name.last,
        login: req.user.login,
        // password: req.user.login.password, /////////////////////////delete this once testing is done
        email: req.user.email,
        photo: await getObjectSignedUrl(req.user.photo),
    }
    res.status(200).send(partialData);
});

userRouter.get("/:userId", async (req, res, next) => {
    try {
        let userData = await User.findById(req.user._id);
        userData = await userData.populate("decks", "name");
        userData.photo = await getObjectSignedUrl(req.user.photo);
        res.status(200).send(userData);          

    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.get("/:userId/groups", (req, res, next) => {
    Group.find({members: req.user._id}, (err, groups) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            //should probably come back and map groups to a smaller object needed to render the page
            res.status(200).send(groups);
        }
    });
});

userRouter.patch("/:userId/verification", async (req, res, next) => {
    if(Date.now() < req.user.verification.codeExpDate) {
        if(req.user.verification.code === req.body.code) {
            await User.findByIdAndUpdate(req.user._id, {"verification.verified": true});
            res.status(200).send({verificationResponse: "verified"});
        } else {
            res.status(401).send({verificationResponse: "invalid"})
        }
    } else {
        res.status(401).send({verificationResponse: "expired"});
    }
});

userRouter.delete("/:userId", async (req, res, next) => {
    const userId = req.user._id
    try {
        await Group.updateMany({members: userId}, {$pull: {members: userId}});
        await Group.updateMany({administrators: userId}, {$pull: {administrators: userId}});
        await Deck.deleteMany({creator: userId});
        await Deck.updateMany({"permissions.view": userId}, {$pull: {"permissions.view": userId}});
        const deletedUser = await User.findByIdAndDelete(userId);
        await Attempt.deleteMany({_id: {$in: deletedUser.attempts}});
        res.status(200).send(userId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.put("/:userId", (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, req.body, {new: true}, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(user)
        }
    });
});

userRouter.get("/:userId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.user.decks));
});

userRouter.post("/:userId/decks", async (req, res, next) => {
    try {
        let newDeck = new Deck({
            name: req.body.deckName,
            public: req.body.public,
            creator: req.body.creator,
        });
        const deck = await newDeck.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {decks: deck}});
        res.status(200).send({_id: deck._id, name: deck.name});
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.post("/:userId/messages", async (req, res, next) => {
    try {
        let newMessage = new Message();
        newMessage.type = req.body.type;
        newMessage.sendingUser = req.body.sendingUser;
        newMessage.targetDeck = req.body.targetDeck;
        newMessage.targetGroup = req.body.targetGroup;
        const message = await newMessage.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {'messages.received': message}});
        await User.findByIdAndUpdate(message.sendingUser, {$push: {'messages.sent': message}});
        res.status(200).send(message);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw receivingUserErr;
    }
});

userRouter.delete("/:userId/messages/:messageId", async (req, res, next) => {
    try {
        const messageId = req.params.messageId;
        if(req.user.messages.sent.findIndex(messageId) > -1) {
            await User.findByIdAndUpdate(req.user._id, {$pull: {'messages.sent': messageId}});
        } else if (req.user.messages.received.findIndex(messageId) > -1) {
            await User.findByIdAndUpdate(req.user._id, {$pull: {'messages.received': messageId}});
        } else {
            res.status(404).send("Message not found in user's messages");
            throw err;
        } 
        await Message.findByIdAndDelete(messageId);
        res.status(200).send(messageId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.post("/:userId/notifications", async (req, res, next) => {
    try {
        let newNotification = new Notification();
        newNotification.type = req.body.type;
        newNotification.content = req.body.content;
        newNotification.actor = req.body.actor;
        newNotification.groupTarget = req.body.groupTarget;
        newNotification.deckTarget = req.body.deckTarget;
        newNotification.cardTarget = req.body.cardTarget;
        newNotification.read = req.body.read;
        const notification = await newNotification.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {notifications: notification}});
        res.status(200).send(notification);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }

});

userRouter.post("/:userId/groups", async (req, res, next) => {
    console.log("body:", req.body);
    try {
        let newGroup = new Group(req.body);
        await newGroup.save();
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {$push: {groups: newGroup._id, adminOf: newGroup._id}});
        res.status(200).send(newGroup._id);
    } catch (err) {
        res.status(500).send(err.message);
        console.error(err);
    }
});

userRouter.put("/:userId/notifications", (req, res, next) => {
    Notification.updateMany({_id: {$in: req.user.notifications}}, {$set: {read: true}})
        //may not need to send anything back here, may need to send back certain number of notifications
        .then(res.status(200).send())
        .catch(err => {
            res.status(500).send("There was an error with your request");
            throw err;
        });
});

const fileFilter = (req, file, callback) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        callback(null, true);
    } else {
        callback(new Error("Only jpeg and png file types may be submitted"), false);
    }
};

//figure out how to handle errors for fileSize, etc
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

userRouter.patch("/:userId", upload.single("photo"), async (req, res, next) => {
    const patchObj = {};
    
    if(req.file) {
        const file = req.file;
        let photoName;
        if(req.user.photo) {
            photoName = req.user.photo;
        } else {
            photoName = generateRandomFileName();
            patchObj.photo = photoName;
        }
        await uploadFile(file.buffer, photoName, file.mimetype)
    }
    
    if(req.body.first || req.body.last) {
        patchObj.name = {
            first: req.body.first ? req.body.first : req.user.name.first ? req.user.name.first : "",
            last: req.body.last ? req.body.last : req.user.name.last ? req.user.name.last : "",
        }
    }
    
    if((req.body.username || req.body.password) || req.body.email) {
        if(req.body.email) {
            console.log("nothing counts as something")
        }
        patchObj.login = {
            username: req.body.username ? req.body.username : req.user.login.username ? req.user.login.username : "",
            password: req.body.password ? req.body.password : req.user.login.password ? req.user.login.password : "",
            email: req.body.email ? req.body.email : req.user.login.email ? req.user.login.email : ""
        }
    }

    console.log({patchObj});
    try {
        const user = await User.findByIdAndUpdate(req.user._id, patchObj, {new: true});
        let responseData = user;
        // why doesn't this delete the password
        // delete responseData.login.password;

        responseData.login = {username: user.login.username};
        let photoUrl = await getObjectSignedUrl(user.photo);
        responseData.photo = photoUrl;
        res.status(200).send(responseData);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw(err);
    }
});

userRouter.post("/:userId/attempts", async (req, res, next) => {
    try {
        const newAttempt = new Attempt(req.body);
        const attempt = await newAttempt.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {attempts: attempt}});
        res.status(200).send(attempt);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.delete("/:userId/attempts/:attemptId", async (req, res, next) => {
    const attemptId = req.params.attemptId;
    try {
        await User.findByIdAndUpdate(req.user._id, {$pull: {attempts: attemptId}});
        await Attempt.findByIdAndDelete(attemptId);
        res.status(200).send(attemptId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.delete("/:userId/attempts", async (req, res, next) => {
    try {
        const deletedAttempts = await Attempt.deleteMany({_id: req.user.attempts});
        await User.findByIdAndUpdate(req.user._id, {$set: {attempts: []}});
        res.status(200).send(deletedAttempts.deletedCount);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

userRouter.delete("/:userId/decks/:deckId/attempts", async (req, res, next) => {
    try {
        const attempts = await Attempt.find({$and: [{_id: {$in: req.user.attempts}}, {deck: req.params.deckId}]});
        let attemptIds = attempts.map(attempt => attempt._id);
        await User.findByIdAndUpdate(req.user._id, {$pull: {attempts: {$in: attemptIds}}});
        const deletedAttempts = await Attempt.deleteMany({_id: {$in: attemptIds}});
        res.status(200).send(deletedAttempts.deletedCount);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

export default userRouter;