'use strict';

var cloneDeep = require('lodash.clonedeep');
var result = require('lodash.result');

function hasChanged(obj, options) {
  var dependencies = options.dependencies;
  var getMethod = options.getMethod;
  var compareMethod = options.compareMethod;
  var storedValues = options.storedValues;

  var len = dependencies.length;
  var i = 0;
  var changed = false;

  while (len--) {
    var dep = dependencies[i++];
    var value = getMethod(obj, dep);
    if (!compareMethod(storedValues[dep], value)) {
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

module.exports = function derivedProperty(options) {
  var obj = options.obj;
  // getter method for derived property
  var getter = options.getter;
  // watched dependencies
  var dependencies = options.dependencies || [];
  // should cache result
  var cache = options.cache === undefined ? Boolean(options.cache) : true;
  // getMethod method for getting dependency values
  var getMethod = options.getMethod || result;
  // compare method for dependencies' values
  var compareMethod = options.compareMethod || function (oldValue, newValue) {
    return oldValue === newValue;
  };
  if (typeof getter !== 'function') {
    throw new TypeError('Expected `getter` to be a function but got ' + typeof getter);
  }
  if (typeof obj !== 'object') {
    throw new TypeError('Expected `obj` to be an object');
  }
  if (typeof getMethod !== 'function') {
    throw new TypeError('Expected `getMethod` to be a function');
  }

  // clone dependency array
  dependencies = [].concat.apply([], dependencies);

  // contains the stored dependency values
  var storedValues = {};
  var computedOnce = false;
  var hasDeps = dependencies.length > 0;
  var changedOptions = {
    compareMethod: compareMethod,
    dependencies: dependencies,
    getMethod: getMethod,
    storedValues: storedValues,
  };
  var computedValue;

  return {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!cache || !computedOnce || (hasDeps && hasChanged(this, changedOptions))) {
        // recalculate and pass dependency values
        computedValue = getter.apply(this, getValues(storedValues, dependencies));
        computedOnce = true;
      }
      return computedValue;
    },
    set: function () {
      throw new TypeError("This is a derived property, it can't be set directly.");
    }
  };
};
