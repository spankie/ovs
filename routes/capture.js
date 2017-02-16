var express = require('express');
var spawn = require('child_process').spawn;
var router = express.Router();

/* Handle fingerprint capturing. */
router.get('/:id', function(req, res, next) {
    console.log("\ncapture: " + req.params.id + "\n")
    
    var child = spawn("java", ["-cp", "/home/spankie/fprint/:/home/spankie/fprint/dpuareu.jar:/home/spankie/fprint/mysql-connector-java-5.1.40-bin.jar", "UareUSampleJava", req.params.id]);
    
    child.on('close', function (exitCode) {
        if (exitCode !== 0) {
            console.error('Something went wrong!');
        }
    });

    child.on("data", function(data){
        process.stdout.write(data);
    });

    // end the program
    // control + c is an interrupt signal
    // child.kill('SIGINT');

//   res.render('page', { home: 'Online Voting System', title: 'Vote', page: 'vote' });
});

module.exports = router;
