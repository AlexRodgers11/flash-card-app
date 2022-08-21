import express from "express";
const loginRouter = express.Router();
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jwt-simple";
import User from "../models/user.js";

// const jwtOptions = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: "Kacchan"
// }

// passport.use(
//     "loginWithJwt",
//     new Strategy(jwtOptions, function(payload, done) {
//         return done(null, {});
//     })
// );

// const requireJwt = passport.authenticate("loginWithJwt", {session: false});

passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "usernameOrEmail",
            passwordField: "password"
        },
        (usernameOrEmail, password, done) => {
        console.log("finding user");
        return User.find({
            $and: [
                {$or: [
                    {"login.username": usernameOrEmail},
                    {"email": usernameOrEmail}
                ]},
                {"login.password": password}
            ]
        }, (err, user) => {
            if(err) {
                console.error(err);
                throw err;
            }
            if(user) {
                console.log("user found");
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    })
);

const requireSignIn = passport.authenticate("login", {session: false});

const tokenForUser = user => {
    console.log("creating token for user");
    return jwt.encode({
        sub: user._id,
        iat: Math.round(Date.now() / 1000),
        //expire after 2 hours
        exp: Math.round(Date.now() / 1000 + 2 * 60 * 60)
    },
    "theblackswordsman");
}
loginRouter.post("/", requireSignIn, (req, res, next) => {
    console.log("POST request received");
    res.send({
        token: tokenForUser(req.user)
    });
});

export default loginRouter;
export { requireSignIn };