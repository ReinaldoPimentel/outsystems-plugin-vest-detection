var exec = require('cordova/exec');

var VestDetection = {
  detectBase64: function(imageBase64, success, error) {
    exec(success, error, 'VestDetection', 'detectBase64', [imageBase64]);
  },
  warmup: function(success, error) {
    exec(success, error, 'VestDetection', 'warmup', []);
  },
  test: function(success, error) {
    exec(success, error, 'VestDetection', 'test', []);
  }
};

module.exports = VestDetection;


