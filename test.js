'use strict';

var expect = require('expect.js');
var derivedProperty = require('./index');

describe('derived property', function () {
  it('should throw on missing required params', function () {
    expect(derivedProperty).to.throwError(/missing/i);

    expect(derivedProperty).withArgs({}).to.throwError(/getter/);

    expect(derivedProperty).withArgs({
      getter: ''
    }).to.throwError(/getter/);

    expect(derivedProperty).withArgs({
      getter: function () {}
    }).to.throwError(/obj/);

    expect(derivedProperty).withArgs({
      getter: function () {},
      obj: ''
    }).to.throwError(/obj/);

    expect(derivedProperty).withArgs({
      getter: function () {},
      obj: {}
    }).to.not.throwError();

    expect(derivedProperty).withArgs({
      getter: function () {},
      obj: {},
      getMethod: 1
    }).to.throwError(/getMethod/);

    expect(derivedProperty).withArgs({
      getter: function () {},
      obj: {},
      getMethod: function () {}
    }).to.not.throwError();
  });

  it('should work without dependencies with cache', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: 'views'
    };

    var called = 0;

    var derived = derivedProperty({
      obj: obj,
      getter: function () {
        called++;
        return this.dirname + '/' + this.name + this.ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);

    expect(obj.path).to.eql('views/home.hbs');
    obj.dirname = '_gh_pages';
    obj.ext = '.html';
    // cache is true and there are no dependencies
    expect(obj.path).to.equal('views/home.hbs');
    expect(called).to.equal(1);
  });

  it('should work without dependencies without cache', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: 'views'
    };

    var called = 0;

    var derived = derivedProperty({
      obj: obj,
      cache: false,
      getter: function () {
        called++;
        return this.dirname + '/' + this.name + this.ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);

    expect(obj.path).to.eql('views/home.hbs');
    obj.dirname = '_gh_pages';
    obj.ext = '.html';
    // cache is true and there are no dependencies
    expect(obj.path).to.equal('_gh_pages/home.html');
    expect(called).to.equal(2);
  });

  it('should work with dependencies and cache', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: 'views'
    };

    var called = 0;
    var derived = derivedProperty({
      obj: obj,
      cache: true,
      dependencies: ['dirname'],
      getter: function () {
        called++;
        return this.dirname + '/' + this.name + this.ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);

    expect(obj.path).to.eql('views/home.hbs');
    obj.dirname = '_gh_pages';
    obj.ext = '.html';
    // cache is true and there are no dependencies
    expect(obj.path).to.equal('_gh_pages/home.html');
    expect(called).to.equal(2);
  });

  it('should work with dependencies and without cache', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: 'views'
    };

    var called = 0;
    var derived = derivedProperty({
      obj: obj,
      cache: false,
      dependencies: ['dirname'],
      getter: function () {
        called++;
        return this.dirname + '/' + this.name + this.ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);

    expect(obj.path).to.eql('views/home.hbs');
    obj.dirname = '_gh_pages';
    obj.ext = '.html';
    // cache is true and there are no dependencies
    expect(obj.path).to.equal('_gh_pages/home.html');
    expect(called).to.equal(2);
  });

  it('should work with changed function dependencies', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: function () {
        return 'views';
      }
    };

    var called = 0;
    var derived = derivedProperty({
      obj: obj,
      dependencies: ['dirname'],
      getter: function () {
        called++;
        return this.dirname() + '/' + this.name + this.ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);

    expect(obj.path).to.eql('views/home.hbs');
    obj.dirname = function () {
      return 'views2';
    };
    obj.ext = '.html';
    // cache is true and there are no dependencies
    expect(obj.path).to.equal('views2/home.html');
    expect(called).to.equal(2);
  });

  it('should work with unchanged function dependencies', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: function () {
        return 'views';
      }
    };

    var called = 0;
    var derived = derivedProperty({
      obj: obj,
      dependencies: ['dirname'],
      getter: function () {
        called++;
        return this.dirname() + '/' + this.name + this.ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);

    expect(obj.path).to.eql('views/home.hbs');
    obj.ext = '.html';
    // cache is true and dependency hasn't changed
    expect(obj.path).to.equal('views/home.hbs');
    expect(called).to.equal(1);
  });

  it('should pass dependency values in getter', function () {
    var obj = {
      name: 'home',
      ext: '.hbs',
      dirname: 'views'
    };

    var derived = derivedProperty({
      obj: obj,
      dependencies: ['dirname', 'ext'],
      getter: function (dirname, ext) {
        expect(dirname).to.eql(obj.dirname);
        expect(ext).to.eql(obj.ext);
        return dirname + '/' + this.name + ext;
      }
    });

    Object.defineProperty(obj, 'path', derived);
    expect(obj.path).to.eql('views/home.hbs');
  });

  it('should work with deep dependencies', function () {
    var obj = {
      name: {
        first: 'Gilad',
        last: 'Peleg'
      }
    };

    var called = 0;
    var derived = derivedProperty({
      obj: obj,
      dependencies: ['name.first'],
      getter: function () {
        called++;
        return this.name.first + ' ' + this.name.last;
      }
    });

    Object.defineProperty(obj, 'displayName', derived);

    expect(obj.displayName).to.eql('Gilad Peleg');
    obj.name.first = 'John';
    expect(obj.displayName).to.eql('John Peleg');
    obj.name.last = 'Doe';
    // last name is not a dependency
    expect(obj.displayName).to.eql('John Peleg');
    expect(called).to.equal(2);
  });

  describe('custom overrides', function () {
    it('should work with a custom getMethod', function () {
      var obj = {
        first: 'Gilad',
        last: 'Peleg'
      };

      var called = 0;
      var derived = derivedProperty({
        obj: obj,
        dependencies: ['first', 'last'],
        getMethod: function (obj, dep) {
          return obj[dep] + '1';
        },
        getter: function (first, last) {
          called++;
          return first + ' ' + last;
        }
      });

      Object.defineProperty(obj, 'displayName', derived);

      expect(obj.displayName).to.eql('Gilad1 Peleg1');
      obj.first = 'John';
      expect(obj.displayName).to.eql('John1 Peleg1');
      obj.last = 'Doe';
      expect(obj.displayName).to.eql('John1 Doe1');
      expect(called).to.equal(3);
    });

    it('should work with a custom compareMethod', function () {
      var obj = {
        nested1: {
          value: 1
        },
        nested2: {
          value: 1
        }
      };

      var called = 0;
      var derived = derivedProperty({
        obj: obj,
        dependencies: ['nested1', 'nested2'],
        compareMethod: function (oldValue, newValue) {
          return newValue.value === oldValue.value + 1;
        },
        getter: function (nested1, nested2) {
          called++;
          return nested1.value + nested2.value;
        }
      });

      Object.defineProperty(obj, 'sum', derived);

      expect(obj.sum).to.eql(2);
      obj.nested1.value = 2;
      obj.nested2.value = 2;
      expect(obj.sum).to.eql(2);
      obj.nested2.value = 3;
      // obj.nested1.value has presumably not changed
      expect(obj.sum).to.eql(4);
    });
  });
});

