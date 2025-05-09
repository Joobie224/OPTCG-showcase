const express = require("express");
const app = express();
const cors = require('cors');
const axios = require('axios');
const cards = require('./cards.json')
const path = require('path')

app.use(express.json())
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get("/cards", async (req, res, next) => {
   res.send(cards);
  });


app.listen(3000);