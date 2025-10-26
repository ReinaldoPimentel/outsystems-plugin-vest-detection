(function() {
    // Wrap in IIFE to avoid require errors
    var exec = window.cordova && window.cordova.exec;
    
    if (!exec) {
        console.error('Cordova exec not available');
        return;
    }
    
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
                function(error) {
                    console.error('VestDetection.detectBase64 ERROR callback received');
                    console.error('Error:', JSON.stringify(error));
                    if (error && typeof error === 'function') {
                        error(error);
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
    
    // Expose to global scope for Cordova plugin system
    window.VestDetection = VestDetection;
    
    // Register with Cordova PluginManager if available
    if (window.cordova && window.cordova.plugins) {
        window.cordova.plugins.VestDetection = VestDetection;
    }
    
    // Register with exec directly to bypass PluginManager
    if (window.cordova && window.cordova.exec) {
        // Force registration by calling exec with a test
        try {
            window.cordova.exec(
                function() {}, 
                function() {}, 
                'VestDetection', 
                'test', 
                []
            );
        } catch(e) {
            console.log('Plugin registration test call failed:', e);
        }
    }
    
    console.log('VestDetection plugin loaded and registered');
})();


