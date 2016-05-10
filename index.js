'use strict';
const Stream = require('stream');
const STATUS = require('./status');
/**
 * [function description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports = function(req, res, next){
  /**
   * [send description]
   * @param  {[type]} body [description]
   * @return {[type]}      [description]
   */
  res.send = function send(body){
    var type = ({})
      .toString
      .call(body)
      .match(/^\[object (\w+)\]$/)[1]
      .toLowerCase();

    if(type == 'object' && body.then)
      type = 'promise';
      
    if(type == 'object' && (body instanceof Stream))
      type = 'stream';
      
    switch(type){
      case 'number':
        res.writeHead(body);
        res.send(STATUS[ body ]);
        break;
      case 'function':
        res.send(body(res.send));
        break;
      case 'error':
        res.send(body.stack);
        break;
      case 'promise':
        body.then(res.send, res.send);
        break;
      case 'stream':
        body.pipe(res);
        break;
      case 'array':
      case 'object':
        var type = 'application/json; charset=utf-8';
        res.setHeader('Content-Type', type);
        res.send(JSON.stringify(body));
        break;
      case 'string':
      case 'uint8array':
        res.end(body);
        break;
      default:
        res.end();
        break;
    }
  };
  next();
};
