var exec = require('cordova/exec');

var VestDetection = {
  detectBase64: function(imageBase64, success, error) {
    console.log('VestDetection.detectBase64 called with image length:', imageBase64 ? imageBase64.length : 0);
    
    // Enhanced logging for debugging
    console.log('Calling exec with success callback:', typeof success);
    console.log('Calling exec with error callback:', typeof error);
    
    exec(
      function(result) {
        console.log('VestDetection.detectBase64 SUCCESS callback received');
        console.log('Result:', JSON.stringify(result));
        if (success && typeof success === 'function') {
          success(result);
        }
      },
      function(err) {
        console.error('VestDetection.detectBase64 ERROR callback received');
        console.error('Error:', JSON.stringify(err));
        if (error && typeof error === 'function') {
          error(err);
        }
      },
      'VestDetection',
      'detectBase64',
      [imageBase64]
    );
  },
  warmup: function(success, error) {
    exec(success, error, 'VestDetection', 'warmup', []);
  },
  test: function(success, error) {
    exec(success, error, 'VestDetection', 'test', []);
  }
};

module.exports = VestDetection;


