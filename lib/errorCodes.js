var Q = require('q');
var _ = require('underscore');
var a = {
  parsing: "parsing",
  notHandling: "notHandling"
};

_.each(_.keys(a), function(item) {
  a['reject_' + item]  = Q.reject(a[item]);
});


module.exports = a;
