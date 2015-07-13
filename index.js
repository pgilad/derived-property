'use strict';

var cloneDeep = require('lodash.clonedeep');
var result = require('lodash.result');

function hasChanged(params) {
  var dependencies = params.dependencies;
  var access = params.access;
  var comparison = params.comparison;
  var obj = params.obj;
  var storedValues = params.storedValues;

  var len = dependencies.length;
  var i = 0;
  var changed = false;

  while (len--) {
    var dep = dependencies[i++];
    var value = access(obj, dep);
    if (!comparison(storedValues[dep], value)) {
      changed = true;
      // update with new value
      storedValues[dep] = cloneDeep(value);
    }
  }
  return changed;
}

function getValues(storedValues, dependencies) {
  return dependencies.map(function (dep) {
    return storedValues[dep];
  });
}

module.exports = function derivedProperty(params) {
  var obj = params.obj;
  if (!obj) {
    throw new TypeError('Expected `obj` to be an object');
  }
  // derived property name
  var property = params.property;
  if (!property || typeof property !== 'string') {
    throw new TypeError('Expected `property` to be a string');
  }
  // getter method for derived property
  var getter = params.getter;
  if (typeof getter !== 'function') {
    throw new TypeError('Expected `getter` to be a function but got ' + typeof getter);
  }
  // watched dependencies
  var dependencies = params.dependencies || [];
  // should cache result
  var cache = params.cache === undefined ? Boolean(params.cache) : true;
  // access method for getting dependency values
  var access = params.access || result;
  // compare method for dependency difference
  var comparison = params.comparison || function (oldValue, newValue) {
    return oldValue === newValue;
  };

  dependencies = [].concat.apply([], dependencies);

  var storedValues = {};
  var computedOnce = false;
  var hasDeps = dependencies.length > 0;
  var computedValue;

  return {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!cache || !computedOnce || (hasDeps && hasChanged({
        access: access,
        comparison: comparison,
        dependencies: dependencies,
        obj: this,
        storedValues: storedValues,
      }))) {
        var values = getValues(storedValues, dependencies);
        computedValue = getter.apply(this, values);
        computedOnce = true;
      }
      return computedValue;
    },
    set: function () {
      throw new TypeError("`" + property + "` is a derived property, it can't be set directly.");
    }
  };
};
