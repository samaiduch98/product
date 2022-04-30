const express = require('express');
const router = express.Router();
var multer = require('multer');
const {removeImage_} =require('../utils/index');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,file_upload_path+"/products")
    },
    filename: function (req, file, cb) {
          let date = Date.now();
          let name = "images"+date
          cb(null, name+file.originalname);
          req.body[file.fieldname] = name+file.originalname  
          req.body[file.fieldname+'type'] = file.mimetype.replace('image/','');
    }
})
const fileFilter = (req,file,cb) => {
    if(file.mimetype === "image/jpg"  || 
       file.mimetype ==="image/jpeg"  || 
       file.mimetype ===  "image/png"){
    cb(null, true);
    }else{
      cb(new Error("Image uploaded is not of type jpg/jpeg  or png"),false);
    }
}
const upload = multer({storage: storage, fileFilter : fileFilter});

///////
router.get('/list', (req, res, next) => {
    var userID = req.userDataFromToken['userID'];
    console.log(userID);
    var sql_ = `SELECT proID AS id, proName AS productName, proImage AS image, proPrice AS price, proUserID as userID FROM tblproducts WHERE proUserID =${userID}`;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(400).json({
                error: err,
            });
        } else {
            connection.query(sql_, function (error, results, fields) {
                if (error) {
                    res.status(400).json({
                        error: error,
                    });
                } else {
                    if (results.length > 0) {
                        res.status(200).json({
                            message: 'success',
                            data: results,
                        });
                    }else {
                        res.status(400).json({
                            message: "Don't have permission",
                            data: results
                        });
                    }

                }
            });
            
        }
    });
});
router.get('/:id', (req, res, next) => {
    var id = req.params.id;
    var userID=req.userDataFromToken['userID'];
    var sql_ = `SELECT proID AS id, proName AS productName, proImage AS image, proPrice AS price, proUserID as userID FROM tblproducts WHERE proUserID =${userID} AND  proID=${id}`;
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(400).json({
                err: err,
            });
        } else {
            connection.query(sql_, function (error, results, fields) {
                if (error) {
                    res.status(400).json({
                        error: error,
                    });
                } else {
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
///////

router.post('/insert',upload.fields([{name:'imageFile',maxCount:1}]), (req, res, next) => {
    var imageFile = req.body.imageFile;
    var name = req.body.name || 1;
    var price = req.body.price;
    var userID=req.userDataFromToken['userID'];
    var sql = "INSERT INTO tblproducts(proName,proImage,proPrice, proUserID) VALUES (?,?,?,?)";
    var dataSql = [name, imageFile,price, userID]
    pool.getConnection(function(err, connection) {
        if(err){
            res.status(400).json({
                err: err,
            });
        }else{
            connection.query(sql, dataSql, function (error, results, fields) {
            connection.release();
                if(error){
                    res.status(400).json({
                        error: error,
                    });
                }else{
                    if(results.insertId){
                        res.status(200).json({
                            message: 'success',
                        });
                    }else{
                        res.status(400).json({
                            message: 'err_insert',
                        });
                    }
                }
            });
        }
    });
});

router.post('/update',upload.fields([{name:'imageFile',maxCount:1}]),(req, res, next) => {
    var fileName=req.body.fileName;
    var imageFile = req.body.imageFile;
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var userId=req.userDataFromToken['userID'];
    var sql = "UPDATE tblproducts SET proName=?,proImage=?,proPrice=? WHERE proID=?";
    var sql_ = `SELECT proID AS id, proName AS productName, proImage AS image, proPrice AS price, proUserID as userID FROM tblproducts WHERE proUserID =${userId} AND  proID=${id}`;
    var dataSql = [name, imageFile, price,id]
    if(id){
        pool.getConnection(function(err, connection) {
            if(err){
                res.status(400).json({
                    err: err,
                });
            }else{
                connection.query(sql_, function (error, results, fields) {
                    if (error) {
                        res.status(400).json({
                            error: error,
                        });
                    } else {
                        if (results.length > 0) {
                            connection.query(sql, dataSql, function (error, results_, fields) {
                                connection.release();
                                if(error){
                                    res.status(400).json({
                                        error: error,
                                    });
                                }else{
                                    if(results_.affectedRows){
                                        if(fileName){
                                            removeImage_(`${file_upload_path+"/products/"+fileName}`,(rs)=>{
                                                if(rs.status===200){
                                                    res.status(200).json({
                                                        message: 'success',
                                                    }); 
                                                }else{
                                                    res.status(200).json({
                                                        message: 'success',
                                                    }); 
                                                }
                                            })
                                        }else{
                                            res.status(200).json({
                                                message: 'success',
                                            });
                                        }
                                    }else{
                                        res.status(400).json({
                                            message: 'err_update',
                                        });
                                    }
                                }
                            });
                        } else {
                            res.status(400).json({
                                message: "Data not fount.",
                                data: results
                            });
                        }
    
                    }
                });
               
            }
        });
    }else{
        res.status(400).json({
            message: 'err_update',
        });
    }
});

router.delete('/delete',(req, res)=>{
    console.log(req.body);
    var id = req.body.id;
    var fileName=req.body.fileName;
    var userId=req.userDataFromToken['userID'];
    var sql = `DELETE FROM tblproducts WHERE proID=${id}`;
    var sql_ = `SELECT proID AS id, proName AS productName, proImage AS image, proPrice AS price, proUserID as userID FROM tblproducts WHERE proUserID =${userId} AND  proID=${id}`;
    // var sqlData = [id]
    pool.getConnection((error, connection)=>{
          if(error){
                res.status(400).json({
                    error
                });
          }else{
            connection.query(sql_, function (error, results, fields) {
                if (error) {
                    res.status(400).json({
                        error: error,
                    });
                } else {
                    if (results.length > 0) {
                        connection.query(sql, (err, results)=>{
                            connection.release();
                            if(err){
                                res.status(400).json({
                                    error:err
                                });
                            }else{
                                if(results.affectedRows > 0){
                                    if(fileName){
                                        removeImage_(`${file_upload_path+"/products/"+fileName}`,(st)=>{
                                            if(st.status===200){
                                                res.status(200).json({
                                                    message: 'success',
                                                }); 
                                            }else{
                                                res.status(200).json({
                                                    message: 'success',
                                                }); 
                                            }
                                        })
                                    }else{
                                        res.status(200).json({
                                            message: 'success'
                                        });
                                    }
                                }else{
                                    res.status(400).json({
                                        error: 'error_delete',
                                        sqlDataa:req.body
                                    });
                                }
                            }
                        });
                    } else {
                        res.status(400).json({
                            message: "Don't have permission",
                            data: results
                        });
                    }

                }
            });
        }
    });
});

module.exports = router;
