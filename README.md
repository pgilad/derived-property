# derived-property

[![Build Status](https://travis-ci.org/pgilad/derived-property.svg?branch=master)](https://travis-ci.org/pgilad/derived-property)
[![Coverage Status](https://coveralls.io/repos/pgilad/derived-property/badge.svg?branch=master&service=github)](https://coveralls.io/github/pgilad/derived-property?branch=master)

> Create a derived property for an object

* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contributing](#contributing)
* [Run tests](#run-tests)
* [Related](#related)
* [License](#license)

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm install derived-property --save
```

## Usage

```js
var derivedProperty = require('derived-property');

var obj = {
  first: 'Gilad',
  last: 'Peleg'
}

var displayName = derivedProperty({
  dependencies: ['first', 'last'],
  getter: function (first, last) {
    return first + ' ' + last;
  }
});

// apply the derived property
Object.defineProperty(obj, 'displayName', displayName);

console.log(obj.displayName);
// => 'Gilad Peleg'

// later on..
obj.first = 'John';
console.log(obj.displayName);
// => 'John Peleg'
```

## API

### [derivedProperty](index.js#L44)

`derivedProperty(options)`

Create a derived property. Returns a `response` that should be applied using `Object.defineProperty(obj, 'property', response)`

**options**

* `getter` **{Function}**: Getter function to do the calculation. Gets the values of dependencies as arguments.
* `dependencies` **{Array}**: Optional list of properties to depend on.
* `cache` **{Boolean}**: Whether to use the cached result if dependencies haven't changed. Defaults to `true`. Set off for non-pure derived properties (i.e - relies on `Date.now()`).
* `getMethod` **{Function}**: Optional getter method to access the dependencies on the object. Defaults to `lodash.result`.
* `compareMethod` **{Function}**: Optional compare method to check if the dependency has changed. Defaults to `===`.

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/pgilad/derived-property/issues)

## Run tests

```sh
$ npm test
```

## Related

- [computed-property](https://github.com/doowb/computed-property)

## License

MIT ©[Gilad Peleg](http://giladpeleg.com)
