// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */

"use strict";

// Depends
var express = require("express");
var bodyParser = require("body-parser");

// Intialize
var app = express();
var jsonParser = bodyParser.json();

// Data
var wins = 0;
var losses = 0;
var result = "";

// Function to flip coin
function cointoss(choice) {
    var flip = Math.random() < 0.5 ? "heads" : "tails";
    if (choice === flip) {
        return "win";
    }
    else {
        return "lose";
    }
}

function tally(result) {
    if (result === "win") {
        ++wins;
        return "{ 'result': 'win' }";
    }
    else if (result === "lose") {
        ++losses;
        return "{ 'result': 'lose' }";
    }
    else {
        console.log("error", result);
    }
}

// Listen on port 3000
var port = 3000;
app.listen(port, function() {
    console.log("Running node server on port", port);
});

// Handle POST request
app.post("/flip", jsonParser, function (req, res) {
    if (req.body) {
        console.log(req.body.call);
        result = cointoss(req.body.call);
        res.send(tally(result).replace(/'/g, "\""));
    }
    else {
        return res.sendStatus(400);
    }
});

// Handle GET request
app.get("/stats", jsonParser, function (req, res) {
    console.log(wins, losses);
    result = "{ 'wins':" + wins + ", 'losses':" + losses + "}";
    res.send(result.replace(/'/g, "\""));
});
