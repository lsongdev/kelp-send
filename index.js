'use strict';
const Stream = require('stream');
const Response = require('./response');
const { STATUS_CODES } = require('http');

/**
 * [short-hands]
 * @type {Object}
 */
const CONTENT_TYPES = {
  text : 'text/plain'           ,
  html : 'text/html'            ,
  xml  : 'application/xml'      ,
  xhtml: 'application/xhtml+xml',
  json : 'application/json'     ,
  png  : 'image/png'            ,
  mpeg : 'video/mpeg'           ,
  webp : 'image/webp'           ,
};

/**
 * [function description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function send(req, res, next){
  /**
   * [type description]
   * @param  {[type]} type    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  res.type = function(type, options){
    type = CONTENT_TYPES[ type ] || type;
    options = Object.keys(options || {}).map(function(name){
      return [ name, options[ name ] ].join('=');
    }).join('; ');
    res.setHeader('Content-Type', type + (options ? ('; ' + options) : ''));
    return res;
  };
  /**
   * [header description]
   * @param  {[type]} name  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  res.header = function(name, value){
    res.setHeader(name, value);
    return res;
  };
  
  /**
   * [status description]
   * @param  {[type]} code [description]
   * @return {[type]}      [description]
   */
  res.status = function(code){
    this.statusCode = code;
    return res;
  };

  /**
   * [redirect description]
   * @param  {[type]} url     [description]
   * @param  {[type]} code    [description]
   * @param  {[type]} headers [description]
   * @return {[type]}         [description]
   */
  res.redirect = function(url, code){
    this.status(code || 302);
    this.header('Location', url);
    return res.end();
  };
  
  /**
   * [send description]
   * @param  {[type]} body [description]
   * @return {[type]}      [description]
   */
  res.send = body => {
    var type = ({})
      .toString
      .call(body)
      .match(/^\[object (\w+)\]$/)[1]
      .toLowerCase();

    if(type === 'object' && body.then)
      type = 'promise';
      
    if(type === 'object' && (body instanceof Stream))
      type = 'stream';
    
    if(type === 'object' && (body instanceof Buffer))
      type = 'buffer';

    if(type === 'object' && (body instanceof Response))
      type = 'response';
      
    switch(type){
      case 'number':
        res.status(body);
        res.send(STATUS_CODES[body]);
        break;
      case 'function':
        body = body(req, res);
        body && res.send(body);
        break;
      case 'error':
        res.send(body.stack);
        break;
      case 'promise':
        body.then(res.send, next);
        break;
      case 'stream':
        body.pipe(res);
        break;
      case 'array':
      case 'object':
        res.type('json');
        res.send(JSON.stringify(body));
        break;
      case 'string':
      case 'buffer':
      case 'uint8array':
        res.end(body);
        break;
      case 'response':
        body.respond(req, res);
        break;
      default:
        res.end();
        break;
    }
    return res;
  };
  return next();
};

module.exports = send;