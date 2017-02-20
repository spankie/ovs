var express = require('express');
var router = express.Router();

/* render Vote page. */
router.get('/:elect_id', function(req, res, next) {
  // check if the election is ongoing
  res.render('page', { home: 'Online Voting System', title: 'Vote', page: 'vote', elect_id: req.params.elect_id });
});

router.get('/:elect_id/:id', function(req, res, next) {
  // check if the election is ongoing
  res.render('vote', { home: 'Online Voting System', title: 'Cast Your Vote', page: 'vote', id: req.params.id, elect_id: req.params.elect_id });
});

router.post('/votenow/:elect_id/:id', function(req, res, next) {
  console.log(JSON.stringify(req.body));
  var voter = req.params.id;
  var elect_id = req.params.elect_id;

  var voteobj = req.body;
  // save the data to the database...
  var con = mysql.createConnection(config.dbconf);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      res.redirect('/');
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
    }
  });

  con.query("UPDATE candidates SET votes = votes + 1 WHERE voter_id = ? AND elect_id = ?", [], function(error, res) {
    // repeat this query for all submitted values that are not empty...
  })

})

module.exports = router;