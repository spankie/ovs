'use strict';
var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var home = "Online Voting System";

var conVs = { 
  host : 'localhost',
  user : 'root',
  password : 'toor',
  database : 'vs'
};

function renderForm(res, req, obj) {
  var con = mysql.createConnection(conVs);
  
  con.connect(function(err){
    if(err){
      console.log('could not connect to DB.');
      return;
    } else {
      console.log('GET::conected to ' + conVs.host + ':' + conVs.database);
    }
  });

  con.query('SELECT v_id FROM voters WHERE id = (SELECT MAX(id) FROM voters) LIMIT 1', function(err, rows) {
    if(err) {
      console.error('GET::Error querying database...');
      return;
    } else {
      var num = parseInt(rows[0].v_id.split('s')[2]);
      num = 'nass'+ ++num;
      obj.v_id = num;
      res.render('page', obj);
    }
  });
  con.end();
}

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('register', { title: 'Register Voter' });
// });

router.get('/register', function(req, res, next) {
  var obj = { home: home, title: 'Register Voter', page: 'register', };
  renderForm(res, req, obj);
});

// register student to the database...
router.post('/register', function(req, res, next){
  console.log('POST::connecting')
  var con = mysql.createConnection(conVs);
  con.connect(function(err){
    if(err){
      console.error('POST::cannot connect to database at this moment...');
      res.redirect('register');
    } else {
      console.log('POST::conected to ' + conVs.host + ':' + conVs.database);
    }
  });

  var voter = req.body;
  
  if(voter.fname != '' && voter.mname != '' && voter.lname != '' && voter.email != '' && voter.vid != '' && voter.mnum != '' && voter.dept != '' &&
  voter.state != '' && voter.lga != '' && voter.addr != '' && voter.dob != '' && voter.pass != '') {
    var post = { id: null,
                fname: voter.fname,
                mname: voter.mname,
                lname: voter.lname,
                email: voter.email,
                v_id: voter.vid,
                matric_num: voter.mnum,
                dept: voter.dept,
                sor: voter.state,
                lga: voter.lga,
                address: voter.addr,
                dob: voter.dob,
                pass: voter.pass
            };
    con.query('INSERT INTO voters SET ?', post, function(err, result){
      if(result) {
        console.log("POST::result on post: ", result);
        var obj = { home: home, title: 'Register Voter', page: 'register', status: 'inserted' };
        renderForm(res, req, obj);
      } else {
        console.log('result on not_inserted: ', result);
        var obj = { home: home, title: 'Register Voter', page: 'register', status: 'not_inserted' };
        renderForm(res, req, obj);
      }
      
    });
  } else {
    var obj = { home: home, title: 'Register Voter', page: 'register', status: 'empty' }
    renderForm(res, req, obj);
  }
  con.end();
});

router.get('/newelection', function(req, res, next) {
  res.render('page', { home: home, title: 'New Election', page: 'newelection' });
});

router.post('/newelection', function(req, res, next) {
  var con = mysql.createConnection(conVs);
  con.connect(function(err){
    if(err){
      console.error('POST::cannot connect to database at this moment...');
      res.redirect('newelection');
    } else {
      console.log('POST::conected to ' + conVs.host + ':' + conVs.database);
    }
  });

  var election = req.body;

  if(election.type != '' && election.date != '' && election.duration != '') {
    
    var post = {
      id: null,
      type: election.type,
      date: election.date,
      duration: election.duration,
      status: 'pending'
    }

    con.query('INSERT INTO election SET ?', post, function(err, result){
      if(result) {
        console.log('POST::insert successfull: ', result);
        res.render('page', { home: home, title: 'New Election', page: 'newelection', status: 'inserted' });
      } else {
        res.render('page', { home: home, title: 'New Election', page: 'newelection', status: 'not_inserted' });
      }
    });
  } else {
    res.render('page', { home: home, title: 'New Election', page: 'newelection', status: 'empty' });
  }
});

router.get('/live', function(req, res, next) {
  res.render('page', { home: home, title: 'Live Election Result', page: 'live' });
});

router.get('/viewelection', function(req, res) {
  var con = mysql.createConnection(conVs);
  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
    } else {
      console.log('POST::conected to ' + conVs.host + ':' + conVs.database);
    }
  });

  con.query('SELECT * FROM election', function(err, result){
    if(result){
      res.render('page', { home: home, title: 'Elections', page: 'viewelection', election: result });
      console.log("result: ", result);
    } else {
      res.render('page', { home: home, title: 'Elections', page: 'viewelection', election: false });
    }
  });
});

router.get('/viewelection/:election', function(req, res) {
  var eId = parseInt(req.params.election);
  var con = mysql.createConnection(conVs);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
    } else {
      console.log('POST::conected to ' + conVs.host + ':' + conVs.database);
    }
  });

  con.query('SELECT * FROM election WHERE id = ?', [eId], function(err, result){
    if(result){
      res.render('page', { home: home, title: 'Election Candidate', page: 'viewelection', e_id: eId, election: result })
      console.log("result: ", result);
    } else {
      res.render('page', { home: home, title: 'Elections', page: 'viewelection', election: false });
    }
  });

  

});

module.exports = router;