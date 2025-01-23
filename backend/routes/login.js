const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const User = require("../models/User"); // Modelo de usuario
const { jsonResponse } = require("../lib/jsonResponse");

const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta"; // Cambia esto en producción

const loginRoute = () => {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    try {
      const { clientId,credential } = req.body;
      const decoded = jwtDecode(credentialResponse.credential);
      const newUser = new User({
        name: decoded.name,
        email: decoded.email,
        profilePic: decoded.picture, 
        points: 0, 
        googleId: clientId, 
      }); 
      await newUser.save();
      res.send("Registro correcto")
    } catch(exc){

    }
  });

  return router;
};

module.exports = loginRoute;
