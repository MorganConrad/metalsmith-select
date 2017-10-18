
module.exports = select;



function select(options) {

   var selectFn = computeSelectFn(options);

   return function(files, metalsmith, realDone) {

      var accepted = {};
      var rejected = {};

      try {
         Object.keys(files).forEach(function(filePath) {
            var fileData = files[filePath];
            fileData.__filename__ = filePath;
            var subset = selectFn(fileData, metalsmith) ? accepted : rejected;
            subset[filePath] = fileData;
         });

         return {
            thenUse: function thenUse(plugin) {
               doUse(accepted, plugin);
               return this;
            },
            elseUse: function elseUse(plugin) {
               doUse(rejected, plugin);
               return this;
            },
            done: function done(err) {
               realDone(err);
            }
         }

         function doUse(files, plugin) {
            try {
               plugin(files, metalsmith, function fakeDone(err) { if (err) realDone(err); });
            } catch(err) {
               realDone(err);
            }
         }
      }

      catch(e) {
         realDone(e);
      }
   };
}



   /* calculate file filter function */
   function computeSelectFn(options) {
      options = options || {};  // null options will pass, since [].every(anyFn) returns true;

      if (options instanceof Function) {
         return function(fileData, metalsmith) { return options(fileData, metalsmith) };
      }
      else if (options instanceof Object) {
         tests = [];
         Object.keys(options).forEach(function(key) {
            tests.push(computeTestFn(key, options[key]))
         });
         return function(fileData, metalsmith) {
            return tests.every(function (testFn) { return testFn(fileData, metalsmith); });
         };
      }
      else {
         throw new Error('invalid options');
      }
   }


   function computeTestFn(key, testCriterion) {
      if (typeof testCriterion === 'string') {
         testCriterion = new RegExp(testCriterion);
      }  // fall thru

      if (testCriterion instanceof RegExp) {
         return function(fileData, metalsmith) { return testCriterion.test(fileData[key]); }
      }
      else if (typeof testCriterion === "boolean") {
         return function(fileData, metalsmith) { return (!!fileData[key] === testCriterion); }
      }
      else if (testCriterion instanceof Function) {
         return function(fileData, metalsmith) { return testCriterion(fileData[key], metalsmith); }
      }
      else {
         throw new Error('Invalid testCriterion for key = ' + key);
      }
   }
