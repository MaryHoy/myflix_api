const path = require("path");

const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const mongoose = require("mongoose");
const Models = require("./models.js");
const morgan = require("morgan");
const app = express();
const Movies = Models.Movie;
const users = Models.user;
const { check, validationResult } = require("express-validator");
const cors = require("cors");

//mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
mongoose.connect(
  "mongodb+srv://maryhoy:1981@cluster0-uufoi.mongodb.net/myFlixDB?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

app.use(bodyParser.json());
app.use(morgan("common"));
app.use(express.static("public"));
app.use("/client", express.static(path.join(__dirname, "client", "dist")));
app.get("/client/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
app.use(cors());
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something has broke!");
});

var auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.get("/", (req, res) => {
  res.send("Welcome to MyFlix!");
});

app.get(
"/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);


app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    Movies.findOne({ Title: req.params.Title })
      .then(function(movie) {
        res.json(movie);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/movies/genres/:Name",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then(function(movies) {
        res.json(movies.Genre);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/movies/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then(function(movies) {
        res.json(movies.Director);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get("/users", function(
  req,
  res
) {
  users.find()
    .then(function(users) {
      res.status(201).json(users);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOne({ username: req.params.username })
      .then(function(user) {
        res.json(user);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.post(
  "/users",
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required")
      .not()
      .isEmpty(),
    check("email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    var hashedPassword = users.hashPassword(req.body.password);
    users.findOne({ Username: req.body.username })
      .then(function(user) {
        if (user) {
          return res.status(400).send(req.body.username + "already exist");
        } else {
          users.create({
            Username: req.body.username,
            Password: hashedPassword,
            Email: req.body.email,
            Birthday: req.body.birthday
          })
            .then(function(user) {
              res.status(201).json(user);
            })
            .catch(function(error) {
              console.error(error);
              res.staus(500).send("Error: " + error);
            });
        }
      })
      .catch(function(error) {
        console.error(error);
        res.stauts(500).send("Error: " + error);
      });
  }
);

app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "username is required").isLength({ min: 5 }),
    check(
      "Username",
      "username contained non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "password is required")
      .not()
      .isEmpty(),
    check("Email", "email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    var errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    var hashedPassword = users.hashPassword(req.body.password);

    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          Username: req.body.username,
          Password: hashedPassword,
          Email: req.body.email,
          Birthday: req.body.birthday
        }
      },
      { new: true },
      function(err, updateduser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updateduser);
        }
      }
    );
  }
);

app.post(
  "/users/:username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { Favorites: req.params.MovieID }
      },
      { new: true },
      function(err, updateduser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updateduser);
        }
      }
    );
  }
);

app.delete(
  "/users/:username/:Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { Favorites: req.params.MovieID }
      },
      { new: true },
      function(err, updateduser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updateduser);
        }
      }
    );
  }
);

app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOneAndRemove({ username: req.params.username })
      .then(function(user) {
        if (!user) {
          res.status(400).send((req.params.username = " was not found"));
        } else {
          res.status(200).send((req.params.username = " was deleted."));
        }
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

var port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function() {
  console.log("Listening on Port 3000");
});

