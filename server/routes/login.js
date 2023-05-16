import express from "express";
const loginRouter = express.Router();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jwt-simple";
import User from "../models/user.js";
import { generateCode } from "../utils.js";


import {createTransport} from "nodemailer";
import { sendEmail } from "../utils.js";

const main = async (email, code) => {
    let transporter = createTransport({
        host: "smtp-relay.sendinblue.com",
        port: process.env.SEND_IN_BLUE_PORT,
        secure: false,
        auth: {
            user: process.env.SEND_IN_BLUE_USER,
            pass: process.env.SEND_IN_BLUE_PASSWORD
        }
    });

        await transporter.sendMail({
        from: '"FlishFlash" <admin@flishflash.org>',
        to: `${email}`,
        subject: "Verify your email",
        replyTo: "no-reply@flishflash.org",
        html: (
            `<html>
                <body>
                    <p>Enter this code in the website to verify your account:</p>
                    <h1>${code}</h1>
                </body>
            </html>`
        )
        // (`<html>
        //     <body>
        //         <form action="/test" method="POST" >
        //             <h3>Click to verify your email"</h3>
        //             <button type="submit">Verify My Email</button>
        //         </form>
        //     </body>
        // </html>`)
    });
}

passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "usernameOrEmail",
            passwordField: "password"
        },
        (usernameOrEmail, password, done) => {
        User.findOne({
            $and: [
                {$or: [
                    {"login.username": usernameOrEmail},
                    {"login.email": usernameOrEmail}
                ]},
                {"login.password": password}
            ]
        }, (err, user) => {
            if(err) {
                console.error(err);
                return done(null, false);
            }
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    })
);

passport.use(
    "register",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        (email, password, done) => {
            let code = generateCode(6);
            main(email, code);

            const newUser = new User(
                {
                    login: {email: email, password: password},
                    verification: {
                        code: code,
                        codeExpDate: Date.now() + (1000 * 60 * 60 * 24),
                        verified: false
                    },
                    accountSetupStage: "email"
                }
            );
            newUser.save((err, user) => {
                if(err) {
                    return done(null, false);
                } else {
                    return done(null, user)
                }
            });
    })
);


const requireSignIn = passport.authenticate("login", {session: false});
const requireRegister = passport.authenticate("register", {session: false});

const tokenForUser = user => {
    return jwt.encode({
        sub: user._id,
        iat: Math.round(Date.now() / 1000),
        //expire after 2 hours
        exp: Math.round(Date.now() / 1000 + 2 * 60 * 60)
    },
    process.env.TOKEN_KEY);
}

loginRouter.post("/", requireSignIn, (req, res, next) => {
    res.cookie('jwt', tokenForUser(req.user), {
        httpOnly: true,
        secure: false, //change this to true once deployed on https
        sameSite: 'none'
    });
    
    res.send({
        token: tokenForUser(req.user),
        userId: req.user._id,
    });
});



loginRouter.post("/new", requireRegister, (req, res, next) => { 
    res.cookie('jwt', tokenForUser(req.user), {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
    });
    res.status(200).send({
        token: tokenForUser(req.user),
        userId: req.user._id,
        email: req.user.email,
        accountSetupStage: req.user.accountSetupStage,
    });
});

loginRouter.get("/emails", async (req, res, next) => {
    if(req.query.email) {
        let user = await User.findOne({"login.email": req.query.email});
        res.status(200).send({emailAvailable: !user});
    } else {
        res.status(400).send("No email submitted");
    }
});

loginRouter.get("/usernames", async (req, res, next) => {
    if(req.query.username) {
        let user = await User.findOne({"login.username": req.query.username});
        res.status(200).send({usernameAvailable: !user});
    } else {
        res.status(400).send("No email submitted");
    }
});

loginRouter.patch("/reset-password", async (req, res, next) => {
    console.log("made it into patch route");
    console.log({email: req.body.email});
    try {
        const foundUser = await User.findOne({"login.email": req.body.email});
        console.log({login: foundUser.login});
        if(!foundUser) {
            return res.status(404).send("A user with that email address wasn't found");
        }

        if(req.body.resetCode && !req.body.password) {
            console.log("in check reset code case");
            if(req.body.resetCode === foundUser.login.passwordResetCode && Date.now() < new Date(foundUser.login.passwordResetCodeExp).getTime()) {
                console.log("in reset code passed case");

                await User.findByIdAndUpdate(foundUser._id,{"login.passwordResetCodeExp": Date.now() + (1000 * 60 * 5)});

    
                return res.status(200).send({userId: foundUser._id});
            } else {
                if(foundUser.login.passwordResetCodeVerificationAttemptCount < 3) {
                    await User.findByIdAndUpdate(foundUser._id, {"login.passwordResetCodeVerificationAttemptCount": foundUser.login.passwordResetCodeVerificationAttemptCount + 1});

                    res.status(403).send(req.body.resetCode === foundUser.login.passwordResetCode ? "Code expired. Please request new code." : "Incorrect code");
                } else {
                    await User.findByIdAndUpdate(foundUser._id,{$unset: {"login.passwordResetCode": "", "login.passwordResetCodeExp": ""}});

                    res.status(403).send("Maximum number of attempts exceeded. Please request a new reset code");
                }
                
            }
        } else if (req.body.resetCode && req.body.password) {
            console.log("should be resetting password");
            const verifiedUser = await User.findById(req.body.userId);
            console.log({login: verifiedUser.login})
            if(req.body.resetCode === verifiedUser.login.passwordResetCode && Date.now() < new Date(verifiedUser.login.passwordResetCodeExp).getTime()) {
                console.log("in reset code passed case");
                await User.findByIdAndUpdate(verifiedUser._id, {"login.password": req.body.password, $unset: {"login.passwordResetCode": "", "login.passwordResetCodeExp": "", "passwordResetCodeVerificationAttemptCount": ""}});
                res.status(200).send({reset: true});
            } else {
                console.log({expDate: new Date(verifiedUser.login.passwordResetCodeExp).getTime()});
                console.log({now: Date.now()});
                return res.status(403).send("Password reset failed. Please request a new reset code");
            }
        } else {
            console.log("in send reset code case");
            const updatedUser = await User.findByIdAndUpdate(foundUser._id, {"login.passwordResetCode": generateCode(10), "login.passwordResetCodeExp": Date.now() + (1000 * 60 * 15)}, {new: true});

            console.log({updatedUser});

            const message = {
                messageType: "PasswordReset",
                resetCode: updatedUser.login.passwordResetCode
            }
            sendEmail(updatedUser.login.email, message);
            res.status(200).send({codeSent: true});
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default loginRouter;
export { requireSignIn };