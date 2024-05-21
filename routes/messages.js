const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
// const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Message = require("../models/message");
// ----------------------------------------------------------------------------------------------------------------
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const { id } = req.params;
        const message = await Message.get(id);
        if (req.user.username !== message.to_username || req.user.username !== message.from_username) {
            throw new ExpressError("User is not part of this conversation", 400)
        }
        return res.json({ message })
    } catch (err) {
        return next(err)
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
        const { to_username, body } = req.body;
        const from_username = req.user.username;
        const message = await Message.create({ from_username, to_username, body });
        return res.json({ message })
    } catch (err) {
        return next(err)
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        const { id } = req.params;
        const message = await Message.get(id);
        if (message.to_username !== req.user.username) {
            throw new ExpressError("Unauthorized", 400)
        }
        await Message.markRead(id)
        return res.json({
            message: {
                id: id,
                read_at: message.read_at
            }
        })
    } catch (err) {
        return next(err)
    }
});