const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

router.post('/', (req, res, next) => {
    var user = {};
    // var email = req.body.email;
    var email = 'test@gamil.com';
    var password = req.body.password;
    var sql_ = `SELECT userID, username, userEmail as  email, userPassword as password FROM tblusers WHERE userEmail = ?`;
    var dataSql_ = [email];
    pool.getConnection(function(err, connection) {
        if(err){
            res.status(400).json({
                err: err,
            });
        }else{
            connection.query(sql_, dataSql_, function (error, getResults, fields) {
                if(error){
                    res.status(400).json({
                        error: error,
                    });
                }else{
                    var andminUser = getResults[0]
                    if (andminUser && bcrypt.compareSync(password, andminUser.password)) {
                         const token = jwt.sign(
                                        {data:andminUser}, andminUser.email,{expiresIn:"2h"}
                                      );
                        res.status(200).json({
                            message: 'success',
                            token: token
                        });
//                         jwt.sign({data:andminUser}, andminUser.email, (err, token) => {
//                             res.status(200).json({
//                                 message: 'success',
//                                 token: token
//                             });
//                         });
                      } else {
                        res.status(400).json({ message: "Invalid Credentials" });
                      }
                    
                }
            });
            
        }
    });
});

module.exports = router;
