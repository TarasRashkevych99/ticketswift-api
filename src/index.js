const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Credentials": true,
    },
    credentials: true,
  })
);

app.use(
  session({
    name: "MySession",
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false, // Default: true
    cookie: { secure: false, maxAge: 60000, httpOnly: true },
    rolling: false, // Default: false
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  console.log("Cookies: ", req.cookies["connect.sid"]);
  console.log("Session: ", req.session);
  console.log("Session ID: ", req.sessionID);
  req.session.views = req.session.views ? req.session.views + 1 : 1;
  console.log("Session views: ", req.session.views);
  res.send(`Hello World!`);
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
