'use strict';
var express = require('express');
var router = express.Router();
var multer = require('multer')
var fs = require('fs');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
	  console.log("image destination");
    cb(null, 'public\\cand\\');
  },
  filename: function (req, file, cb) {
	  console.log("image filename")
    var arr = file.originalname.split('.');
    cb(null, file.fieldname + '-' + Date.now() + "." + arr[arr.length - 1])
  }
})
 
var upload = multer({ storage: storage })

// var upload = multer({dest: 'uploads/'})

var config = require('../models/config');
var pool = require('../models/db');

var home = "NASS Online Voting System";

function renderForm(res, req, obj) {

  pool.getConnection(function(err, con) {
    if(err){
      console.log('could not connect to DB.');
      con.release();
      return;
    } else {
      console.log('GET::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
  
    con.query('SELECT v_id FROM voters WHERE id = (SELECT MAX(id) FROM voters) LIMIT 1', function(err, rows) {
      if(err) {
        console.error('GET::Error querying database...');
        con.release();
        return;
      } else {
        var num = parseInt(rows[0].v_id.split('s')[2]);
        num = 'nass'+ ++num;
        obj.v_id = num;
        res.render('page', obj);
        con.release();
      }
    });
  });
}

router.get('/register', function(req, res, next) {
  var obj = { home: home, title: 'Register Voter', page: 'register', };
  renderForm(res, req, obj);
});

// register student to the database...
router.post('/register', function(req, res, next){
  console.log('POST::connecting')
  pool.getConnection(function(err, con){
    if(err){
      console.error('POST::cannot connect to database at this moment...');
      res.redirect('register');
      con.release();
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }

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
      con.query("SELECT * FROM voters WHERE matric_num = ? OR email = ?", [post.matric_num, post.email], function(err, result) {
        if(!err) {
          if(result.length < 1) {  
            con.query("SELECT * FROM students WHERE matric_no = ?", [post.matric_num], function(err, result) {
              if(!err){
                if(result.length > 0) {
                  con.query('INSERT INTO voters SET ?', post, function(err, result){
                    if(result) {
                      console.log("POST::result on post: ", result);
                      var obj = { home: home, title: 'Register Voter', page: 'register', status: 'inserted' };
                      renderForm(res, req, obj);
                      con.release();
                    } else {
                      console.log('result on not_inserted: ', result);
                      var obj = { home: home, title: 'Register Voter', page: 'register', status: 'not_inserted' };
                      renderForm(res, req, obj);
                      con.release();
                    }
                    
                  });
                } else {
					var obj = { home: home, title: 'Register Voter', page: 'register', status: 'notSeen' };
                    renderForm(res, req, obj);
				}
              } else {
                var obj = { home: home, title: 'Register Voter', page: 'register', status: 'error' };
                renderForm(res, req, obj);
              }
              
            });
          } else {
            var obj = { home: home, title: 'Register Voter', page: 'register', status: 'used' };
            renderForm(res, req, obj);
          }
        }
      });
    } else {
      var obj = { home: home, title: 'Register Voter', page: 'register', status: 'empty' }
      renderForm(res, req, obj);
    }

  });

});

router.get('/newelection', function(req, res, next) {
  res.render('page', { home: home, title: 'New Election', page: 'newelection' });
});

router.post('/newelection', function(req, res, next) {
  
  pool.getConnection(function(err, con){
    if(err){
      console.error('POST::cannot connect to database at this moment...');
      res.redirect('newelection');
      con.release()
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }

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
          console.log('POST::insert successfull: ', result.insertId);
          var elect = {id: null, elect_id: result.insertId}
          con.query('INSERT INTO candidates SET ?', elect, function(err, result1){
            if(result) {
              res.render('page', { home: home, title: 'New Election', page: 'newelection', status: 'inserted' });
              con.release();
              console.log('POST::Candidates table successful added: ', result1.insertId);
            }
            else {
              
              console.log('POST:: Candidates table not insserted: ', result1);
            }
          })

        } else {
          res.render('page', { home: home, title: 'New Election', page: 'newelection', status: 'not_inserted' });
          con.release();
        }
      });
    } else {
      res.render('page', { home: home, title: 'New Election', page: 'newelection', status: 'empty' });
      con.release();
    }
  });
});


// Live elections (ongoing elections result)
router.get('/live', function(req, res, next) {
  res.render('page', { home: home, title: 'Live Election Result', page: 'live' });
});

// View all available elections ()
router.get('/viewelection', function(req, res) {
  
  pool.getConnection(function(err, con){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
      con.release();
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
  
    con.query('SELECT * FROM election', function(err, result){
      if(result){
        res.render('page', { home: home, title: 'Elections', page: 'viewelection', election: result });
        console.log("result: ", result);
      } else {
        res.render('page', { home: home, title: 'Elections', page: 'viewelection', election: false }) 
      }
      con.release();
    });
  });
});


router.get('/viewelection/:election', function(req, res) {
  var eId = parseInt(req.params.election);
	var errr = req.query;
	if(errr.err){
		res.render('page', { home: home, title: 'Add Election Candidate', page: 'viewelection', e_id: eId, err: errr.err })
	}
  pool.getConnection(function(err, con){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }

    con.query('SELECT * FROM election WHERE id = ?', [eId], function(err, result){
      if(result.length > 0){
        res.render('page', { home: home, title: 'Add Election Candidate', page: 'viewelection', e_id: eId, election: result })
        console.log("result: ", result);
      } else {
        res.render('page', { home: home, title: 'Elections', page: 'viewelection', election: false });
      }
      con.release();
    });

  });

});



// add a candidate to an election...
router.post('/viewelection/:election', upload.single('propic'), function(req, res) {
  var resultSave;
  var eId = parseInt(req.params.election);
  if(isNaN(eId)) {
    res.redirect('/page/viewelection/' + eId);
    return;
  }
  var f = req.file;
  var can = req.body;
  pool.getConnection(function(err, con){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
      con.release();
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
    
    
    console.log("can body: ", can)
    console.log("file details:", f)
    // check if the candidate is a registered voter...
    con.query('SELECT v_id FROM voters WHERE v_id = ?', can.mnum, function(err, results) {
      if(err) {
        console.error("Could not check if the candidate is a registered voter.", err);
        resultSave = "You are not a registered voter";
        if (typeof f != 'undefined') {
          fs.unlink(f.path, (err) => {
            if(err)  
              console.log(err);
            console.log('deleted the file:', f.path);
          })
        }
        // work on some error handling here...
        return;

      } else if(results.length > 0) {

        var insertCandidate = {elect_id: eId, position: can.position, voter_id: can.mnum, img: f.filename || 'power.png' }
        con.query('INSERT INTO candidates SET ?', [insertCandidate], function(err, result){
          if(err) {
            console.error('POST:: Could not update the candidate table: ', err);
            res.redirect('/page/viewelection/' + eId);
          } else {
            console.log("New candidate inserted");
            resultSave = "New Candidate added";
            res.render('page', { home: home, title: 'Election Candidate', page: 'viewelection', e_id: eId, election: result, saveResult: resultSave });
          }
          con.release();
        });

      } else if(results.length < 1) {
        if (typeof f != 'undefined') {
          fs.unlink(f.path, (err) => {
            if(err)  
              console.log(err);
            console.log('deleted the file:', f.path);
          })
        }
        res.redirect('/page/viewelection/' + eId + '?err=You+are+not+a+registered+voter');
        con.release();
      }

    });
  });
});

router.get("/viewvoters", function(req, res) {
  pool.getConnection(function(err, con){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
      con.release();
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }

    con.query("SELECT * FROM voters", function(err, result) {
      if(err) {
        console.error('POST:: Could not update the candidate table: ', err);
        res.redirect('/');
      } else if(result.length > 0) {
        var obj = {home: home, title: 'All Voters', voters: result}
        res.render("voters", obj);
      } else if(result.length < 1) {
        var obj = {home: home, title: 'All Voters', voters: null}
        res.render("voters", obj);
      }
    })

  });
})


module.exports = router;