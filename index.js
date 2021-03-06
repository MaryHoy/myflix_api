const path = require("path");

const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");
/* necessary modules */
const mongoose = require("mongoose");
const Models = require("./models.js");
const morgan = require("morgan");
const app = express();
const Movies = Models.Movie;
const users = Models.user;
const { check, validationResult } = require("express-validator");
const cors = require("cors");

//mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
/* connect to mongodb */
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

/**
*endpoint GET returns a list of all movies
*endpoint URL: /movies
*GET request
*no required params
*example request:
*@function getMovies(token) {
*  axios
*    .get("https://hoymyflix.herokuapp.com/movies", {
*      headers: { Authorization: `Bearer ${token}` }
*    })
*    .then(response => {
*      this.props.setMovies(response.data);
*    })
*    .catch(function(error) {
*      console.log(error);
*    });
*}
*example response:
*@param {string} _id
*@param {string}title
*@param {string}description
*@param {object} director
*@param {object} genre
*/

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
    users.findOne({ Username: req.params.username })
      .then(function(user) {
        res.json(user);
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


/**
*endpoint POST allows users to register
*endpoint URL: /users
*POST request
*params required:
*@params {string} username
*@params {string} password
*@params {string} email
*@params {date} birthday
*@constant handleSubmit
*example request:
*@function handleSubmit = (e) => {
*  e.preventDefault();
*  axios.post('https://hoymyflix.herokuapp.com/users', {
*      username: username,
*      email: email,
*      birthday: birthday,
*      password: password,
*      confirmPassword: confirmPassword
*  })
*  .then(response =>{
*    const data = response.data;
*    console.log(data);
*    window.location.assign('/');
*  })
*  .catch(e => {
*    console.log('error registering the user')
*  });
*}
*example response:
*@param {object} user
*@params {string} username
*@params {string} password
*@params {string} email
*@params {date} birthday
*/
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

  /**
  *endpoint PUT allow users to update information
  *endpoint URL: /users/:username
  *PUT request
  *@params {string} username
  *@params {string} password
  *@params {string} email
  *@params {date} birthday
  *example request:
  *@function handleUpdate(token) {
  *  const { user } = this.props;
  *  const { username, email, birthday, password, confirmPassword } = this.state;
  *  axios({
  *    method: "put",
  *    url: `https://hoymyflix.herokuapp.com/users/${user.username}`,
  *    headers: {
  *      Authorization: `Bearer ${token}`
  *    },
  *    data: {
  *      username: username,
  *      email: email,
  *      birthday: birthday,
  *      password: password,
  *      confirmPassword: confirmPassword
  *    }
  *  })
  *    .then(response => {
  *      //const data = response.data;
  *      localStorage.removeItem("token");
  *      localStorage.removeItem("user");
  *      window.location.reload();
  *    })
  *    .catch(e => {
  *      console.log("error updating the user");
  *    });
  *}
  *example response:
  *@param {object} user
  *@params {string} username
  *@params {string} password
  *@params {string} email
  *@params {date} birthday
  */
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  [
    check("username", "username is required").isLength({ min: 5 }),
    check(
      "username",
      "username contained non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "password is required")
      .not()
      .isEmpty(),
    check("email", "email does not appear to be valid").isEmail()
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

/**
*endpoint post add a movie to users favorites
*endpoint URL: /users/:username/favorites/:movieID
*POST request
*@params {ObjectId} _id
*@params {string} user
*@function addToFavorites() {
*  const { movie} = this.props;
*  const user = localStorage.getItem("user");
*  const token = localStorage.getItem("token");
*  console.log({ token });
*  axios
*    .post(
*      `https://hoymyflix.herokuapp.com/users/${user}/favorites/${
*        movie._id
*      }`,
*      null,
*      { headers: { Authorization: `Bearer ${token}` } }
*    )
*    .then(res => {
*      console.log(res);
*      window.location.reload();
*    })
*    .catch(error => {
*      console.log(error);
*    });
*}
*example response:
* Json of users updated list of favorites
*/
app.post(
  "/users/:username/Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.MovieID }
      },
      { new: true },
      function(err, updateduser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
            console.log(err);
          res.json(updateduser);
        }
      }
    );
  }
);

/**
*endpoint DELETE deletes a movie from user list of favorites
*endpoint URL: /users/:username/favorites/:movieID
*DELETE request
*@params {ObjectId} _id
*@params {string} user
*example request:
removeFavorite(id, token) {
  const { favorites } = this.props;
  const { user } = this.props;
  axios.delete(
    `https://hoymyflix.herokuapp.com/users/${user.username}/favorites/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log(res);
      window.location.reload();
    })
    .catch(error => {
      console.log(error);
    });
}
*example response:
* Json of users updated list of favorites
*/
app.delete(
  "/users/:username/:Movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $pull: { FavoriteMovies: req.params.MovieID }
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

/**
*endpoint DELETE deletes the user
*endpoint URL: /users/:username
*DELETE request
*@params {string} user
*example request:
*@function handleDelete(token) {
*  const { user } = this.props;
*  axios
*    .delete(`https://hoymyflix.herokuapp.com/users/${user.username}`, {
*      headers: { Authorization: `Bearer ${token}` }
*    })
*    .then(res => {
*      localStorage.removeItem("token");
*      localStorage.removeItem("user");
*      window.location.reload();
*    })
*    .catch(error => {
*      console.log(error);
*    });
*}
*example response:
* username was deleted
*/
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    users.findOneAndRemove({ Username: req.params.username })
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

