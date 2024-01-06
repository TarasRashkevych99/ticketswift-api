require("dotenv").config();
const express = require("express");
const middlewares = require("./middlewares");

const app = express();

middlewares(app);

app.get("/", (req, res) => {
  console.log("Cookies: ", req.cookies["ticketswift"]);
  console.log("Session: ", req.session);
  console.log("Session ID: ", req.sessionID);
  req.session.views = req.session.views ? req.session.views + 1 : 1;
  console.log("Session views: ", req.session.views);
  res.send(`Hello World!`);
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
