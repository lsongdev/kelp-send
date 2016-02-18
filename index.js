'use strict';
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

    switch(type){
      case 'string':
      case 'uint8array':
        res.end(body);
        break;
      case 'number':
        res.writeHead(body);
        res.end(STATUS[ body ]);
        break;
      case 'function':
        res.send(body(res.send));
        break;
      case 'error':
        res.end(body.stack);
        break;
      case 'promise':
        body.then(res.send, res.send);
        break;
      case 'stream':
        body.pipe(res);
        break;
      case 'object':
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(body));
        break;
      default:
        res.end();
        break;
    }
  };
  next();
};
