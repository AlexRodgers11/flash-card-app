import express from "express";
import { generateRandomFileName, getUserIdFromJWTToken, upload } from "../utils.js";
import User from "../models/user.js";
import {createTransport} from "nodemailer";
import { getObjectSignedUrl, uploadFile } from "../s3.js";

const communicationRouter = express.Router();

communicationRouter.get("/", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const foundUser = await User.findById(req.userId, "messages notifications -_id")
            .populate("messages.received", "messageType read")
            .populate("messages.sent", "messageType read")
            .populate("notifications", "notificationType read");
        res.status(200).send({messages: foundUser.messages, notifications: foundUser.notifications});
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

communicationRouter.post("/send-email-to-site-admins", getUserIdFromJWTToken, upload.single("bug-screenshot"), async (req, res, next) => {
    try {
        const sendingUser = await User.findById(req.userId, "login.email name");
        let transporter = createTransport({
            host: "smtp-relay.sendinblue.com",
            port: process.env.SEND_IN_BLUE_PORT,
            secure: false,
            auth: {
                user: process.env.SEND_IN_BLUE_USER,
                pass: process.env.SEND_IN_BLUE_PASSWORD
            }
        });

        let bugScreenshotUrl;

        if(req.file) {
            const file = req.file;
            const photoName = generateRandomFileName();
            
            await uploadFile(file.buffer, photoName, file.mimetype);

            bugScreenshotUrl = await getObjectSignedUrl(photoName);
        }
        
        await transporter.sendMail({
            from: `"${sendingUser.name.first} ${sendingUser.name.last}" <${sendingUser.login.email}>`,
            to: "admin@flishflash.org",
            subject: `${req.body.subject}`,
            replyTo: "no-reply@flishflash.org",
            html: (
                `<html>
                    <body>
                        <p>${req.body.messageText}</p>
                        ${bugScreenshotUrl ? `<img src=${bugScreenshotUrl} alt="bug-screenshot" />` : ""}
                    </body>
                </html>`
            )
        });
        res.status(200).send("Message sent successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("There was an error sending your message. YOu can try again or if you like you can email us directly at admin@flishflash.org")
    } 
});

export default communicationRouter;