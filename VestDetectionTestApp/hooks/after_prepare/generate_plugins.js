#!/usr/bin/env node

// Cordova hook to generate cordova_plugins.js
var fs = require('fs');
var path = require('path');

module.exports = function(context) {
    var platform = context.opts.cordova.platforms[0];
    
    if (platform !== 'android' && platform !== 'ios') {
        return;
    }
    
    var pluginsConfig = [
        {
            "id": "outsystems-plugin-vest-detection",
            "file": "plugins/outsystems-plugin-vest-detection/www/VestDetection.js",
            "pluginId": "outsystems-plugin-vest-detection",
            "clobbers": ["VestDetection"]
        }
    ];
    
    var metadata = { "outsystems-plugin-vest-detection": "1.0.0" };
    
    var output = "cordova.define('cordova/plugin_list', function(require, exports, module) {\n";
    output += "module.exports = " + JSON.stringify(pluginsConfig, null, 2) + ";\n";
    output += "module.exports.metadata = \n// TOP OF METADATA\n";
    output += JSON.stringify(metadata, null, 2) + ";\n";
    output += "// BOTTOM OF METADATA\n";
    output += "});\n";
    
    var wwwPath = path.join('platforms', platform, 'www', 'cordova_plugins.js');
    fs.writeFileSync(wwwPath, output);
    console.log('Generated cordova_plugins.js');
};

