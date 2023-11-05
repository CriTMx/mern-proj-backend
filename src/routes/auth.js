import express from "express";
import getDb from "../db.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", async (req, res) => {
    const db = getDb();
    const users = db.collection("users");

    const encryptedPassword = await bcrypt.hash(req.body.password, 10);  

    await users.insertOne({
        password: encryptedPassword,
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userType: req.body.userType
    });

    res.status(200).json({ message: "Registered successfully" });
});

router.post("/login", async (req, res) => {
    const db = getDb();
    const users = db.collection("users");

    const user = await users.findOne({
        email: req.body.email,
    });

    const passwordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (user === null || !passwordValid) {
        return res.status(401).json({
            accessToken: null,
            message: "Username or password is incorrect",
        });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ accessToken, userType: user.userType });

});

export default router;