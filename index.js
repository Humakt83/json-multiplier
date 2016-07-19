var jsonfile = require('jsonfile');
var _ = require('lodash');
var argv = require('yargs')
    .usage('Usage: node $0 --times=[num] --file=[string]')
    .demand(['times','file'])
    .argv;

function multiplyJson(times, file) {
    read(file, times, multiply);
}

function read(file, times, done) {
    console.log('reading file %s', file);
    jsonfile.readFile(file, function(err, obj) {
        console.dir(obj);
        done(times, obj);
    });
}

function multiply(times, jsonObj) {
    console.log('Multiplying by %d', times);
    for (var propertyName in jsonObj) {
      var propertyValues = jsonObj[propertyName];
      if (Array.isArray(propertyValues) && propertyValues.length > 0 && propertyValues[0].id) {
          propertyValues = multiplyArray(times, propertyValues);
      }
      jsonObj[propertyName] = propertyValues;
    }
    console.dir(jsonObj);
    write(jsonObj);
}

function multiplyArray(times, arr) {
    var currentId = 1;
    var idFields = {};
    var multipliedArray = [];
    for (var j = 0; j < times; j++) {
        for (var i = 0; i < arr.length; i++) {
            var copiedObj = {};            
            var propertyValue = arr[i];
            for (var propName in propertyValue) {
                if (propName.indexOf('Id') > -1) {
                    if (idFields[propName]) {
                        idFields[propName] += 1;
                    } else {
                        idFields[propName] = propertyValue[propName];
                    }
                    copiedObj[propName] = idFields[propName];
                } else {
                    copiedObj[propName] = propertyValue[propName]; 
                }                
            }            
            copiedObj.id = currentId;            
            multipliedArray.push(copiedObj);
            currentId += 1;
        }
    }
    return multipliedArray;
}

function write(jsonObj) {
    var fileName = 'multiplied.json';
    console.log('Writing json to file %s', fileName);
    jsonfile.writeFile(fileName, jsonObj, function (err) {
        console.error(err)
    });
}

multiplyJson(argv.times, argv.file);
