import express from "express";
const app = express();

const PORT = process.env.PORT || 3001;

app.listen(PORT, err => {
  if (err) {
    throw err;
  } else {
    console.log("App listen to " + PORT);
  }
});
