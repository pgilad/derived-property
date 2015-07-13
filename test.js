'use strict';

var expect = require('expect.js');
var derivedProperty = require('./index');

describe('derived', function () {
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
});

