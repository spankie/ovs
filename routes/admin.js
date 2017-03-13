var express = require('express');
var router = express.Router();
var pool = require("../models/db");
// var config = require('../models/config');

// var mysql = require('mysql');
// var pool  = mysql.createPool(config.dbconf);

var home = "NASS Online Voting System";


router.get("/", function(req, res, next) {
    var getQuery = req.query;
    var obj = {title: home, home: home}

    // perform log in here and set login to ok or not
    console.log("get query:", getQuery)
    if(getQuery.err) {
        // if there is a form error.
        obj.formerr = getQuery.err;
    } else {
        // if there is a successful form handling...
        if(getQuery.suc) { obj.formsuc = getQuery.suc; }
        if(typeof req.cookies.auth != 'undefined') {
            console.log(req.cookies.auth.name);
            obj.loggedin = "yes";
        } else {
            obj.loggedin = "no";
        }
    }
    
    res.render("admin", obj);
})

router.post("/", function(req, res, next) {
    var body = req.body;
    console.log(body);
    var email = body.email;
    var pass = body.pass;
    // var obj = {}

    pool.getConnection(function(err, connection) {
        // Use the connection 
        connection.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, pass], function (error, results, fields) {
            if(results.length > 0) {
                // set cookie and log the user in.
                console.log("you are logged in");
                res.cookie("auth" , {name: email});
                res.redirect("/admin");
            } else {
                // reply with wrong username or password.
                console.log("wrong username or password");
                res.redirect('/admin?err=Username+or+Password+Incorrect');
            }
            
            // And done with the connection. 
            connection.release();
        
            // Handle error after the release. 
            if (error) throw error;
        
            // Don't use the connection here, it has been returned to the pool. 
        });
    });
})

router.post("/addstudent", function(req, res) {
    // remember to check if it is empty or undefined
    if(req.body.matnum == 'undefined' || req.body.matnum == "") {
        res.redirect("/admin?err=Please+fill+out+the+required+fields");
        return;
    }
    var mat = req.body.matnum;
    pool.getConnection(function(err, connection) {
        // Use the connection 
        connection.query('SELECT * FROM students WHERE matric_no = ?', [mat], function (error, results, fields) {
            if(results.length > 0) {
                // the matric number has already been registered.
                console.log("Already registered");
                
                res.redirect("/admin?err=Already+Registered");
            } else {
                // Register the student/
                console.log("New student registeration.");
                connection.query('INSERT INTO students SET ?', [{matric_no: mat}], function (error, results, fields) {
                    if(!error) {
                        // send a query to /admin stating succes.
                        res.redirect("/admin?suc=New+Student+added.");
                    }

                    // And done with the connection. 
                    connection.release();
                
                    // Handle error after the release. 
                    if (error) throw error;
                })
                
            }
        
            // Don't use the connection here, it has been returned to the pool. 
        });
    });
})

module.exports = router;