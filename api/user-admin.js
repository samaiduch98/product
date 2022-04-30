const express = require('express');
const router = express.Router();
var bcrypt = require('bcrypt');
router.get('/list', (req, res, next) => {
    var sql = `SELECT userID AS id, username AS userName, userEmail AS email, userPassword AS password FROM tblusers ORDER BY userID DESC`;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(400).json({
                error: err,
            });
        } else {
            connection.query(sql, function (error, results, fields) {
                connection.release();
                if (error) {
                    res.status(400).json({
                        error: error,
                    });
                } else {
                    if (results.length > 0) {
                        res.status(200).json({
                            message: 'success',
                            data: results
                        });
                    } else {
                        res.status(400).json({
                            message: 'no_user',
                        });
                    }
                }
            });
        }
    });
});
router.get('/:id', (req, res, next) => {
    var id = req.params.id;
    var sql = `SELECT userID AS id, username, userEmail AS email, userPassword AS password FROM tblusers WHERE userID = ${id}`;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(400).json({
                err: err,
            });
        } else {
            connection.query(sql, function (error, results, fields) {
                connection.release();
                if (error) {
                    res.status(400).json({
                        error: error,
                    });
                } else {
                    console.log('count', results.length);
                    if (results.length > 0) {
                        res.status(200).json({
                            message: 'Success',
                            data: results
                        });
                    } else {
                        res.status(404).json({
                            message: 'Data not fount',
                            data: results
                        });
                    }

                }
            });
        }
    });
});
router.post('/register', (req, res, next) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = bcrypt.hashSync(req.body.password, 10);
    var sql = `INSERT INTO tblusers(username, userEmail, userPassword) VALUES ('${name}','${email}','${password}')`;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(400).json({
                err: err,
            });
        } else {
            connection.query(sql, function (error, results, fields) {
                connection.release();
                if (error) {
                    res.status(400).json({
                        error: error,
                    });
                } else {
                    if (results.insertId) {
                        res.status(200).json({
                            message: 'success',
                        });
                    } else {
                        res.status(400).json({
                            message: 'no_user',
                        });
                    }
                }
            });
        }
    });
});
router.put('/update', (req, res, next) => {
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var sql = "UPDATE `tblusers` SET `username`= ?,`userEmail`=?,`userPassword`=? WHERE `userID` = ?";
    var sql_ = `SELECT userID, username, userEmail as  email, userPassword as password FROM tblusers WHERE userID = ?`;
    var dataSql_ = [id];
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(400).json({
                err: err,
            });
        } else {
            connection.query(sql_, dataSql_, function (error, getResults, fields) {
                if(error){
                    res.status(400).json({
                        error: error,
                    });
                }else{
                    if(getResults.length> 0){
                        if(getResults[0].password !== password){
                            password = bcrypt.hashSync(req.body.password, 10);
                        }
                        var dataSql = [name, email, password, id];
                        connection.query(sql, dataSql, function (error, results, fields) {
                            connection.release();
                            if (error) {
                                res.status(400).json({
                                    error: error,
                                });
                            } else {
                                if (results.affectedRows) {
                                    res.status(200).json({
                                        message: 'success',
                                    });
                                } else {
                                    res.status(400).json({
                                        message: 'no_user',
                                    });
                                }
                            }
                        });
                    }else{

                    }
                    
                }
            });
            
        }
    });
});

router.delete('/delete', (req, res, next) => {
    var id = req.body.id
    if (!id) {
        res.status(400).json({
            message: 'invalid_user',
        });
    } else {
        var sql = "DELETE FROM `tblusers` WHERE `userID` = ?";
        var dataSql = [id]
        pool.getConnection(function (err, connection) {
            if (err) {
                res.status(400).json({
                    error: err,
                });
            } else {
                connection.query(sql, dataSql, function (error, results, fields) {
                    connection.release();
                    if (error) {
                        res.status(400).json({
                            error: error,
                        });
                    } else {
                        if (results.affectedRows > 0) {
                            res.status(200).json({
                                message: 'success'
                            });
                        } else {
                            res.status(400).json({
                                message: 'no_user',
                            });
                        }
                    }
                });
            }
        });
    }
});

module.exports = router;