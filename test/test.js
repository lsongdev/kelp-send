'use strict';
const send = require('../');

var res = {
  end: function(body){
    if(body && !(typeof body == 'string') && !(({}).toString.call(body) == '[object Uint8Array]')){
      throw new Error('only string or buffer allow, got ' + ({}).toString.call(body));
    }
    console.log('RESPONSE: %s', body);
  },
  setHeader: function(k, v){}
};

send({}, res, function(){});

res.send('hi');
