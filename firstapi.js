const express=require("express");
const app=express();
//connect server file
let server = require('./server');
let middleware=require('./middleware');
let config=require('./config');
const response=require('express');
//mongo db
const MongoClient=require('mongodb').MongoClient;
//body parsers
const bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//connect to mongodb.
const url='mongodb://127.0.0.1:27017';
const dbname='hospitainventory';
let db

MongoClient.connect(url,{useUnifiedTopology:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`connected to MongoDB:${url}`);
    console.log(`Database: ${dbname}`);
})
//fetching hospital details;
app.get('/hositaldetails',middleware.checkToken,function(req,res){
    console.log("fetched data from hospital collections ");
    var hdata=db.collection('hospital').find().toArray().then(result => res.json(result));
    //console.log(hdata);
});
//fetching ventilaotors details
app.get('/ventilatordetails',middleware.checkToken,function(req,res){
    console.log("fetched data from ventilaotor collections ");
    var vdata=db.collection('ventilators').find().toArray().then(result => res.json(result));
   // console.log(vdata);
});
//search ventilator by status
app.post('/searchventthroughstat',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventdetails=db.collection('ventilators')
    .find({"status":status}).toArray().then(result=>res.json(result));
});
//search ventilator by hospital name
app.post('/searchbyhospname',middleware.checkToken,(req,res)=>{
    var name=req.query.hname;
    console.log(name);
    var ventidetails=db.collection('ventilators')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=> res.json(result));
});
//update ventilator details.
app.put('/updateventi',middleware.checkToken,(req,res)=>{
    var ventiid={hvno:req.body.hvno};
    console.log(ventiid);
    var newventid={ $set:{status:req.body.status}};
    db.collection("ventilators").updateOne(ventiid,newventid,function(err,result){
        res.json("document updated");
        if(err) throw err;

    });
});
//Add ventilator
app.post('/addventilators',middleware.checkToken,(req,res)=>{
    var hid=req.body.hid;
    var hvno=req.body.hvno;
    var hname=req.body.hname;
    var status=req.body.status;
    
    var item=
    {
        hid:hid, hvo:hvno, hname:hname, status:status

    };
    db.collection('ventilator').insertOne(item,function(err,result){
        res.json('new details inserted');
    });
});
//delete ventilator by id
app.delete('/delete',middleware.checkToken,(req,res)=>{
var myquery=req.query.hvno;
console.log(myquery);
var myqueryy={hvno:myquery};
db.collection('ventilators').deleteOne(myqueryy,function(err,obj){
    if (err) throw err;
    res.json("one document deleted");
});
});
app.listen(3000);
