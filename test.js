var config = require('./models/config');
var mysql = require('mysql');
var con = mysql.createConnection(config.dbconf);

  con.connect(function(err){
    if(err){
      console.error('GET::cannot connect to database at this moment...');
      return;
    } else {
      console.log('POST::conected to ' + config.dbconf.host + ':' + config.dbconf.database);
      // res.setHeader('Content-Type', 'application/json');
      // res.send({message: "error"});
      
    }
  });
  var elect_id = 1
  var voteobj = {"president":"nass1","v_president":"nass3","secretary":"nass5","a_sec":"nass8","f_secretary":"nass14","a_f_sec":"nass16","pro":"nass9","a_pro":"nass11"}
var c = 0;
    con.query("UPDATE test_can SET votes = (votes + 1) WHERE voter_id = ? AND elect_id = ? AND position = ?", [Object.keys(voteobj), elect_id, voteobj], function(error, result) {
        // repeat this query for all submitted values that are not empty...
        if(error){
            console.log(error);

            return;

        }
        console.log(result);
        console.log("voting for : ", c++);
    })