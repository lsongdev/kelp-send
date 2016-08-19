'use strict';
const http = require('http');
const kelp = require('kelp');
const send = require('../');

const app = kelp(send);

app.use(function(req, res, next){
  var msg = '<h1>Kelp Send</h1>';
  //res.send(function(send){
  //   setTimeout(function(){
  //     send(msg); // async
  //   }, 3000);
  //   // return msg; // sync
  // });
  //
  // res.type('html').status(200).send(msg);
  // res.send(new Error(msg))
  // res.send([ 1,3,4, ]);
  // res.send({ name: 'kelp-send' });
});

http.createServer(app).listen(3000);
