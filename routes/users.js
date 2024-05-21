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
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
// ----------------------------------------------------------------------------------------------------------------
// ==============================================================
//  UNFACTORED USERS LIST
// ==============================================================
router.get("/", ensureLoggedIn, async function (req, res, next) {
    try {
        const result = await db.query(
            `SELECT username, first_name, last_name, phone FROM users`
        );
        return res.json({
            users: result.rows[0]
        });
    } catch (err) {
        return next(err)
    }
});
// ==============================================================
//  REFACTORED USERS LIST
// ==============================================================
router.get("/", ensureLoggedIn, async function (req, res, next) {
    try {
        const users = User.all();
        return res.json({
            users
        });
    } catch (err) {
        return next(err)
    }
});
// ----------------------------------------------------------------------------------------------------------------
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
// ----------------------------------------------------------------------------------------------------------------
// ==============================================================
//  UNFACTORED USER
// ==============================================================
// router.get("/:username", ensureCorrectUser, async function (req, res, next) {
//     try {
//         const result = await db.query(
//             `SELECT username, first_name, last_name, phone, join_at, last_login_at
//             FROM users
//             WHERE username = $1`,
//             [username]
//         )
//         const user = result.rows[0];
        
//         if (user) {
//             return res.json({
//                 user: {
//                     username: user.username,
//                     first_name: user.first_name,
//                     last_name: user.last_name,
//                     phone: user.phone,
//                     join_at: user.join_at,
//                     last_login_at: user.last_login_at
//                 }
//             });
//         } else {
//             throw new ExpressError(`"${username}" not found`, 404)
//         }
//     } catch (err) {
//         return next(err)
//     }
// });
// ==============================================================
//  REFACTORED USER
// ==============================================================
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        const { username } = req.params;
        const user = await User.get(username);
        return res.json({ user })
    } catch (err) {
        return next(err)
    }
});
// ----------------------------------------------------------------------------------------------------------------
/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
// ----------------------------------------------------------------------------------------------------------------
// ==============================================================
//  UNFACTORED USER MESSAGES TO
// ==============================================================

// ==============================================================
//  REFACTORED USER MESSAGES TO
// ==============================================================
router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
    try {
        const { username } = req.params;
        const messages = await User.messagesTo(username);
        return res.json({ messages })
    } catch (err) {
        return next(err)
    }
})
// ----------------------------------------------------------------------------------------------------------------
/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
// ----------------------------------------------------------------------------------------------------------------
// ==============================================================
//  UNFACTORED USER MESSAGES FROM
// ==============================================================

// ==============================================================
//  REFACTORED USER MESSAGES FROM
// ==============================================================
router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
    try {
        const { usename } = req.params;
        const messages = await User.messagesFrom(username);
        return res.json({ messages })
    } catch (err) {
        return next(err)
    }
});
// ----------------------------------------------------------------------------------------------------------------
module.exports = router;