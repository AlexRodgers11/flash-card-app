import express from "express";
const loginRouter = express.Router();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jwt-simple";
import User from "../models/user.js";
import { generateCode } from "../utils.js";


import {createTransport} from "nodemailer";

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
                throw err;
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

export default loginRouter;
export { requireSignIn };