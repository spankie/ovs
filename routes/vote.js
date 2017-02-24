var express = require('express');
var router = express.Router();
var config = require('../models/config');
var mysql = require('mysql');

var home = "NASS Online Voting System";

/* render Vote page. */
router.get('/:elect_id', function(req, res, next) {
  // check if the election is ongoing
  res.render('page', { home: home, title: 'Vote', page: 'vote', elect_id: req.params.elect_id });
});

router.get('/:elect_id/:id', function(req, res, next) {
  var elect_id = req.params.elect_id;
  var voter = req.params.id;
  var con = mysql.createConnection(config.dbconf);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect("/");
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
      // res.setHeader('Content-Type', 'application/json');
      // res.send({message: "error"});
      
    }
  });
  // check if the election is ongoing
  con.query("SELECT * FROM `election` WHERE id = ? AND NOW() BETWEEN date AND date + INTERVAL + 24 hour", [elect_id], function(err, r) {
    if(err) {
      res.redirect("/");
      return;
    }
    if (r.length > 0){
      // check if the voter is registered...
      con.query("SELECT v_id FROM voters WHERE v_id = ?", [voter], function(err, r) {
        if(err) {
          res.redirect("/");
          return;
        }
        if (r.length > 0){
          // check if this user has voted bofore...
          con.query("SELECT voter_id FROM voted WHERE voter_id = ? AND elect_id = ?", [voter, elect_id], function(err, r) {
            if(err) {
              res.redirect("/");
              return;
            }
            if (r.length > 0){
              res.redirect("/");
            } else {
              console.log("result:", r);
              res.render('vote', { home: home, title: 'Cast Your Vote', page: 'vote', id: req.params.id, elect_id: req.params.elect_id });
            }
          })
        } else {
          res.redirect("/");
        }
      })
    } else {
      res.redirect("/");
    }
  });
});


router.post('/votenow/:elect_id/:id', function(req, res, next) {
  
  var voter = req.params.id;
  var elect_id = req.params.elect_id;

  var voteobj = req.body;
  console.log(JSON.stringify(voteobj));
  // save the data to the database...
  var con = mysql.createConnection(config.dbconf);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect("/");
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
      // res.setHeader('Content-Type', 'application/json');
      // res.send({message: "error"});
      vote();
    }
  });


  function vote () {
    for (var key in voteobj) {
      console.log("key:", key)
      if (voteobj.hasOwnProperty(key) && voteobj[key] != "") {

        con.query("UPDATE candidates SET votes = (votes + 1) WHERE voter_id = ? AND elect_id = ? AND position = ?", [voteobj[key], elect_id, key], function(err, res) {
          console.log(res);

        })

      }
      if (key == "a_pro"){
        cb();
      }
    }
  }
  //
  function cb() {
    var options = {elect_id: elect_id, voter_id: voter, vote_date: new Date()}
    con.query("INSERT INTO voted SET ?", [options], function(error, result) {
      console.log("registering voter as voted : ", voter);
      
      if(!error) {
        res.setHeader('Content-Type', 'application/json');
        res.send({message: "ok"});
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send({message: "error"});
      }
    })
  }
})

module.exports = router;