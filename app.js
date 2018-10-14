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
var db, charities, contributions, rankings, overall_score, quality_rank;
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
    charities = db.collection('charities');
    contributions = db.collection('contributions');
    overall_score = db.collection('overall_score');
    rankings = db.collection('rankings');
    quality_rank = db.collection('quality_rank')    
});
//charities
app.get("/get/charities",function(req, res) {
    let search = req.query.organization_type,
    op = (search)?{organization_type : {$regex : ".*"+search+".*", $options : 'i'}}:{};
    charities.find(op, function(err, data) {
        if (err) {
            res.status(500);
            res.send('Im sorry bruh! we fkd up');
        } else {
            var r = data.limit(20).toArray().then((d) => {
                res.status(200)
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(d))
                res.end()
            });
        }
    })
})
app.get("/get/quality/:type",function(req, res) {
    let op = {_id: false, state: true};
    op[req.params.type] = true;
    quality_rank.find({}, op, function(err, data) {
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
app.get("/get/rankings/:type",function(req, res) {
    let op = {_id: false, state: true};
    op[req.params.type] = true;
    rankings.find({}, op, function(err, data) {
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
app.get("/get/overall_score/:type",function(req, res) {
    let op = {_id: false, state: true};
    op[req.params.type] = true;
    overall_score.find({}, op, function(err, data) {
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
// Get Mongoose to use the global promise library
app.get("/get/:state_type",function(req, res) {
    let op = {_id: false, state: true};
    op[req.params.state_type] = true;
    contributions.find({}, op,  function(err, data) {
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
    charities.find({state:req.params.state.toUpperCase()}, function(err, data) {
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

app.get("/get/state_acc",function(req, res) {
    var a = charities.find({},{ "_id":0, "accountability_score":1, "state":1}).toArray().then((d) => {
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
    charities.find({}, function(err, data) {
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