var express = require('express');
var router = express.Router();

/* render Vote page. */
router.get('/', function(req, res, next) {
  res.render('page', { home: 'Online Voting System', title: 'Vote', page: 'vote' });
});

router.get('/:id', function(req, res, next) {

  res.render('vote', { home: 'Online Voting System', title: 'Cast Your Vote', page: 'vote', id: req.params.id });
});


module.exports = router;
