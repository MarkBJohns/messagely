const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
// const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");
// ----------------------------------------------------------------------------------------------------------------
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
// ==============================================================
//  UNFACTORED LOGIN
// ==============================================================
// router.post("/login", async function (req, res, next) {
//     try {
//         const { username, password } = req.body;
//         if (!username || !password) {
//             throw new ExpressError("Username and password required", 400)
//         }
//         const result = await db.query(
//             `SELECT username, password
//             FROM users
//             WHERE username = $1`,
//             [username]
//         );
//         const user = result.rows[0];
//         if (user) {
//             if (await bcrypt.compare(password, user.password)) {
//                 await db.query(
//                     `UPDATE users
//                         SET last_login_at = current_timestamp
//                         WHERE username = $1`,
//                     [username]
//                 );
//                 const token = jwt.sign({ username }, SECRET_KEY);
//                 return res.json({token})
//             }
//         } else {
//             throw new ExpressError("Invalid username or Password", 404)
//         }
//     } catch (err) {
//         return next(err)
//     }
// });
// ==============================================================
//  REFACTORED LOGIN
// ==============================================================
router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        if (await User.authenticate(username, password)) {
            const token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token })
        } else {
            throw new ExpressError("Invalid username or password", 400);
        }
    } catch (err) {
        return next(err)
    }
});
// ----------------------------------------------------------------------------------------------------------------
/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
// ==============================================================
//  UNFACTORED REGISTER
// ==============================================================
// router.post("/register", async function (req, res, next) {
//     try {
//         const { username, password, first_name, last_name, phone } = req.body;
//         if (!username || !password || !first_name || !last_name || !phone) {
//             throw new ExpressError("Please fill out form entirely", 400)
//         }
//         const hashed = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
//         const result = await db.query(
//             `INSERT INTO users (
//                 username, password,
//                 first_name, last_name,
//                 phone, join_at, last_login_at
//             )
//             VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
//             RETURNING username, password, first_name, last_name, phone`,
//             [username, hashed, first_name, last_name, phone]
//         );
//         const user = result.rows[0];
//         const token = jwt.sign(user, SECRET_KEY);
//         return res.json(token)
//     } catch (err) {
//         if (err.code === '23505') {
//             return next(new ExpressError("Username taken", 400))
//         }
//     }
// });
// ==============================================================
//  REFACTORED REGISTER
// ==============================================================
router.post("/register", async function (req, res, next) {
    try {
        const user = await User.register(req.body);
        const token = jwt.sign({ user }, SECRET_KEY);
        User.updateLoginTimestamp(user);
        return res.json(token)
    } catch (err) {
        return next(err)
    }
});
// ----------------------------------------------------------------------------------------------------------------
module.exports = router;