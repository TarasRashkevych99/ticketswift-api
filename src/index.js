const express = require("express");
const geolib = require("geolib");
const r = require("./api/router");

const app = express();

app.get("/", (req, res) => {
  res.send(`Hello World!`);
  console.log("Cookies: ", req.cookies["connect.sid"]);
  console.log("Session: ", req.session);
  console.log("Session ID: ", req.sessionID);
  req.session.views = req.session.views ? req.session.views + 1 : 1;
  console.log("Session views: ", req.session.views);
});

const port = process.env.PORT || 5000;

app.use("/api", r());
app.listen(port, () => console.log(`Listening on port ${port}`));
