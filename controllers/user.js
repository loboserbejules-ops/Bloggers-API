const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../auth");

module.exports.registerUser = (req, res) => {

    if (
        !req.body.username ||
        !req.body.email ||
        !req.body.password
    ) {
        return res.status(400).send("All fields must be provided");
    }

    if (
        typeof req.body.username !== "string"
    ) {
        return res.status(400).send(false);
    }

    if (!req.body.email.includes("@")) {
        return res.status(400).send(false);
    }

    if (req.body.password.length < 8) {
        return res.status(400).send(false);
    }

    User.findOne({ email: req.body.email })
        .then((result) => {
            if (result !== null && result.email === req.body.email) {
                return res.status(409).send("Duplicate email found");
            }

            let newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                isAdmin: req.body.isAdmin
            });

            return newUser
                .save()
                .then((user) => res.status(201).send(user))
                .catch((err) => res.status(500).send(err));
        })
        .catch((err) => auth.errorHandler(err, req, res));
};

function emailCheck(emailCheck) {
  let check = User.find({email: emailCheck})
  console.log(check);
  if(check){
      return check
  } else {
      return false
  }
}

module.exports.loginUser = (req, res) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(req.body.email)) {
        return res.status(400).send({
            message: "Invalid email format"
        });
    }

    return User.findOne({ email: req.body.email })
    .then(user => {
         if (user == null) {
            return res.status(404).send({
                message: "No email found"
            });
         }

         const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);

          if (isPasswordCorrect == true) {
            return res.status(200).send({
                message: "User logged in successfully",
                access: auth.createAccessToken(user)
            });
          } else {
            return res.status(401).send({
                message: "Incorrect email or password"
            });
          }
    })
    .catch((err) => auth.errorHandler(err, req, res));
};

module.exports.getProfile = (req, res, next) => {
    return User.findById(req.user.id)
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "No user found" });
            }
            result.password = "";
            return res.send(result);
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

module.exports.checkEmailExists = (req, res, next) => {
    return User.find({ email : req.body.email})
    .then(result => {
        if (result.length > 0) {
            return res.status(200).send(true);
        } else {
            return res.status(200).send(false);
        }
    })
    .catch(err => next(err));
};

module.exports.resetPassword = async (req, res) => {

    const { newPassword } = req.body;
    const { id } = req.user; 

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    User.findByIdAndUpdate(id, { password: hashedPassword })
    .then(result => {

        res.status(200).json({ message: 'Password reset successfully' });
    })
    .catch(error => errorHandler(error, req, res));
};