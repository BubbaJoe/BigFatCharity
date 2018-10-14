'use strict';

const mongoose = require('mongoose');
const http = require('http');
const nconf = require('nconf');
const express = require('express');


var app = express()
// Read in keys and secrets. Using nconf use can set secrets via
// environment variables, command-line arguments, or a keys.json file.
nconf.argv().env().file('keys.json');

// Connect to a MongoDB server provisioned over at
// MongoLab.  See the README for more info.

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');

let uri = `mongodb://${host}:${port}`;
if (nconf.get('mongoDatabase')) {
  uri = `${uri}/${nconf.get('mongoDatabase')}`;
}
var db, ips, chrt, state_data, rank;
mongoose.connect(uri, function(err) {
    if(err) throw err;
    else console.log("connected to",uri)
    // Set db instance
    db = mongoose.connection;

    // Set the global promise (probably not needed but hey..)
    mongoose.Promise = global.Promise;
    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    // init collections
    ips = db.collection('IPs');
    chrt = db.collection('charities');
    state_data = db.collection('state_data');
    rank = db.collection('rank');
});
// Get Mongoose to use the global promise library
app.get("/get/:state_type",function(req, res) {
    let op = {_id: false, state: true};
    op[req.params.state_type] = true;
    state_data.find({}, op,  function(err, data) {
        if (err) {
            res.status(500);
            res.send('Im sorry bruh! we fkd up');
        } else {
            var r = data.toArray().then((d) => {
                res.status(200)
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(d))
                res.end()
            });
        }
    })
})

app.get("/get/state_id/:state",function(req, res) {
    chrt.find({state:req.params.state.toUpperCase()}, function(err, data) {
        if (err) {
            res.status(500);
            res.send('Im sorry bruh! we fkd up');
        } else {
            var r = data.toArray().then((d) => {
                res.status(200)
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(d))
                res.end()
            });
        }
    })
})

app.post("/", function(req, res) {

})

app.get("/get/ranking",function(req, res) {
    rank.find({}, function(err, data) {
        if (err) {
            res.status(500);
            res.send('Im sorry bruh! we fkd up');
        } else {
            var r = data.toArray().then((d) => {
                res.status(200)
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(d))
                res.end()
            });
        }
    })
})

app.get("/get/state_acc",function(req, res) {
    var a = chrt.find({},{ "_id":0, "accountability_score":1, "state":1}).toArray().then((d) => {
        res.status(200)
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(d))
        res.end()
    });
    /* .then(function(err, data) {
        if (err) {
            res.status(500);
            res.send('Im sorry bruh! we fkd up');
        } else {
            var r = data.toArray().then((d) => {
                res.status(200)
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(d))
                res.end()
            });
        }
    })*/
})

app.get("/get/states",function(req, res) {
    chrt.find({}, function(err, data) {
        if (err) {
            res.status(500);
            res.send('Im sorry bruh! we fkd up');
        } else {
            var r = data.toArray().then((d) => {
                res.status(200)
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(d))
                res.end()
            });
        }
    })
})

// app.use("/",function(req,res,next) {
//     // Track every IP that has visited this site (TEST)
//     const ip = {
//     address: req.connection.remoteAddress
//     };

//     ips.insert(ip, (err) => {
//     if (err) {
//         console.log("DB ERROR", err);
//         return
//     } else {
//         console.log("IP Data logged successfully")
//     }

//     // push out a range
//     let iplist = '';
//     ips.find().toArray((err, data) => {
//         if (err) {
//         throw err;
//         }
//         data.forEach((ip) => {
//         iplist += `${ip.address}; `;
//         });

//         // Do nothing for now
//     })
//     })
//     next()
// })

app.use(express.static('public'));

app.listen(8080,function(err) {
    if (err) throw err;
})