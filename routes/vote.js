var express = require('express');
var router = express.Router();

/* render Vote page. */
router.get('/', function(req, res, next) {
  res.render('page', { home: 'Online Voting System', title: 'Vote', page: 'vote' });
});

module.exports = router;
