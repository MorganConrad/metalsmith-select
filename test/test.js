var test = require('tape');
var select = require('../select.js');

const mockMetalsmith = { version: 1.2, count: 0 };

// setup - need to recreate these each time
function createFiles() {
   mockMetalsmith.count = 0;
   return {
      "file1" : {
         title: "title of file1",
         property1: "foo1",
         property2: "bar1",
         propertyOnlyIn1: true,
         version: 1.2
      },
      "file2" : {
         title: "title of file2",
         property1: "foo2",
         property2: "bar2",
         version: 3.4
      }
   }
};



// need this
function done(err) { if (err) throw err; }

function addAProperty(key, value) {
   return function(passed, metalsmith, done) {
      Object.keys(passed).forEach(function(file) {
         var filedata = passed[file];
         filedata[key || 'newKey'] = value || true;
      });
      done();
   };
}


test('test all ', function(t) {
   var files = createFiles();
   select()(files, mockMetalsmith, done)
     .thenUse(addAProperty())
     .done();

   t.true(files.file1.newKey);
   t.true(files.file2.newKey);

   t.end();
});

test('test truthy ', function(t) {
   var files = createFiles();
   select({
      propertyOnlyIn1: true,
      propertyNotThere: false
   })(files, mockMetalsmith, done)
     .thenUse(addAProperty())
     .done();

   t.true(files.file1.newKey);
   t.false(files.file2.newKey);

   t.end();
});

test('test string & regex ', function(t) {
   var files = createFiles();
   select({
      property1: /foo.*/,  // passes all
      property2: "bar1"    // only file 1
   })(files, mockMetalsmith, done)
     .thenUse(addAProperty())
     .done();

   t.true(files.file1.newKey);
   t.false(files.file2.newKey);
   t.end();
});


test('test inner fn and metalsmith', function(t) {
   var files = createFiles();
   select({
      version: function(value, metalsmith) {  return value === metalsmith.version; }
   })(files, mockMetalsmith, done)
     .thenUse(addAProperty())
     .done();

     t.true(files.file1.newKey);
     t.false(files.file2.newKey);

   t.end();
});

test('test outer fn and metalsmith', function(t) {
   var files = createFiles();
   select(
      function(filedata, metalsmith) {  return filedata.version === metalsmith.version; }
   )(files, mockMetalsmith, done)
     .thenUse(addAProperty())
     .done();

     t.true(files.file1.newKey);
     t.false(files.file2.newKey);

   t.end();
});

test('test multi', function(t) {
   var files = createFiles();
   select(
      function(filedata, metalsmith) {  return filedata.version === metalsmith.version; }
   )(files, mockMetalsmith, done)
     .thenUse(addAProperty('x', 'xx'))
     .thenUse(addAProperty('y', 'yy'))
     .elseUse(addAProperty('z', 'zz'))
     .done();

   t.equal(files.file1.x, 'xx');
   t.equal(files.file1.y, 'yy');
   t.false(files.file2.x);
   t.true(files.file2.z);
   t.end();
});

test('filename', function(t) {
   var files = createFiles();
   select({
      __filename__: /.*1/
   })(files, mockMetalsmith, done)
     .thenUse(addAProperty())
     .done();

   t.true(files.file1.newKey);
   t.false(files.file2.newKey);
   t.end();
});


test('test error', function(t) {
   var files = createFiles();

   var shouldThrowError = function() {
      select()(files, mockMetalsmith, done)
        .thenUse(function() { throw "test error1";} )
        .done();
   };

   t.throws(
      shouldThrowError, /test error1/
   );

   var shouldDoneWithError = function() {
      select()(files, mockMetalsmith, done)
        .thenUse(function(fileData, ms, done) { done("test error2");} )
        .done();
   }

   t.throws(
      shouldDoneWithError, /test error2/
   );

   t.end();
});
