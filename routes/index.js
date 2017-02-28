var express = require('express');
var router = express.Router();
var config = require('../models/config');
var pool = require('../models/db');

var home = "NASS Online Voting System";


/* GET home page. */
router.get('/', function(req, res, next) {

  // get session first. if session is not set, then the user is not logged in.
  // provide the vote page which contains login portal.
  var obj = { title: home }
  
  pool.getConnection(function(err, con) {
    
      if(err){
        console.error('DBERROR::cannot connect to database at this moment...', err);
        obj.result = 'null';
        res.render('index', obj);
        con.release();
      } else {
        console.log('GET::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
        con.query('SELECT * FROM `election` WHERE date BETWEEN NOW() AND NOW() + INTERVAL 24 hour OR date BETWEEN NOW() - INTERVAL 24 hour AND NOW() LIMIT 1', function(err, result){
          if(err) {
            obj.result = 'null';
            console.log("RESULT(err): " + typeof result);
            res.render('index', obj);
            con.release();
          } else if(result != "") {// might not be relevant tho...
            if(result.lenght < 1){
              obj.result = 'null';
              console.log("RESULT(<1): " + typeof result);
            } else {
              obj.result = result;
              console.log("RESULT(>1): " + JSON.stringify(result), "\n\nOBJ:", JSON.stringify(obj), "\n\n");
              res.render('index', obj);
            }
            con.release();
            return;
          } else {
            obj.result = 'null';
            console.log("RESULT(No result): " + typeof result);
            res.render('index', obj);
            con.release();
            return;
          }
        });
      }

  });// pool.getConnection()

});

router.post("/getresult/:id", function (req, res) {
  var id = parseInt(req.params.id);
  if(isNaN(id)) {
    //res.redirect('/page/viewelection/' + eId);
    res.setHeader('Content-Type', 'application/json');
    res.send({error: "not a valid election id"});
    return;
  }
  // var con = mysql.createConnection(config.dbconf);
  pool.getConnection(function(err, con) {
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.setHeader('Content-Type', 'application/json');
      res.send({error: "database not available"});
      con.release();
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
  
  
    con.query("SELECT * FROM candidates WHERE elect_id = ?", [id], function(err, result) {
      
      if (err) {
        console.error('GET::could not get candidates...');
        res.setHeader('Content-Type', 'application/json');
        res.send({error: "Could not get candidates"});
        con.release();
        return;
      } else {
        console.log("candidate result: ", JSON.stringify(result, null, 3))
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
        con.release();
        return;
      }

    });// con.query();

  });// pool.getConnection()
})

router.post("/getnames/:id", function (req, res) {
  var id = req.params.id;
  
  pool.getConnection(function(err, con) {

    if(err){
      console.error('GET::cannot connect to database at this moment...', err);
      res.setHeader('Content-Type', 'application/json');
      res.send({error: "database not available"});
      con.release();
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }

    con.query("SELECT fname, lname FROM voters WHERE v_id = ?", [id], function(err, result) {
      if(err) {
        console.error('GET::DB query error:', err);
        res.setHeader('Content-Type', 'application/json');
        res.send({error: "error in query"});
        con.release();
        return;
      } else {
        console.error('GET::got names', JSON.stringify(result, null, 3));
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
        con.release();
        return;
      }
    })
  });
})

router.get("/logout", function(req, res) {
    res.clearCookie("auth");
    res.
    console.log("i want to logout");
    res.redirect("/");
})

module.exports = router;
