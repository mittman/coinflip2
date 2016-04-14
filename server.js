// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */

"use strict";

// Depends
var express = require("express");
var bodyParser = require("body-parser");
var redis = require("redis");

// Ports
var httpPort = 3000;
var redisPort = 6379;

// Intialize
var app = express();
var jsonParser = bodyParser.json();
var redisClient = redis.createClient();

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
        redisClient.incr("wins");
        ++wins;
        return "{ 'result': 'win' }";
    }
    else if (result === "lose") {
        redisClient.incr("losses");
        ++losses;
        return "{ 'result': 'lose' }";
    }
    else {
        console.log("error", result);
    }
}

function callback(key, result) {
    if (key === "wins") {
        wins = result;
    }
    else if (key === "losses") {
        losses = result;
    }
}

function getValue(key) {
    redisClient.get(key, function(err, result) {
        if (err) {
            throw err;
        }
        console.log(key, result);
        callback(key, result);
    });
}

function setValue(key, val) {
    redisClient.set(key, val, function(err, result) {
        if (err) {
            throw err;
        }
        console.log(key, result);
        callback(key, val);
    });
}

function resetScore(key) {
    redisClient.exists(key, function(err, result) {
         if (err) {
             console.log("Error:", key, "exists");
         }
         else if (!result) {
             console.log("Set var in REDIS", key);
             redisClient.set(key, 0);
         }
         else {
             console.log("Load from REDIS", key);
             if (key === "wins") {
                 getValue("wins");
             }
             else if (key === "losses") {
                 getValue("losses");
             }
         }
    });
}

// Listen on httpPort 3000
app.listen(httpPort, function() {
    console.log("Running node server on port", httpPort);
});

// Redis
redisClient.on("connect", function() {
    console.log("Running redis server on port", redisPort);
});

// Load values
resetScore("wins");
resetScore("losses");

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
    getValue("wins");
    getValue("losses");
    console.log(wins, losses);
    result = "{ 'wins':" + wins + ", 'losses':" + losses + "}";
    res.send(result.replace(/'/g, "\""));
});

// Handle DELETE request
app.delete("/stats", jsonParser, function (req, res) {
    setValue("wins", 0);
    setValue("losses", 0);
    console.log(wins, losses);
    result = "{ 'wins':" + 0 + ", 'losses':" + 0 + "}";
    res.send(result.replace(/'/g, "\""));
});
