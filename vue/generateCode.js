//copy all Javascript files to the ESP8266WebServer

var glob = require("glob")
const fs = require('fs')

var outputArray = [];

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

function parseFile(fileName, contentType, binary = false) {
    if (binary) {
        buffer = str2ab(fs.readFileSync(fileName).toString());

        console.log(buffer.byteLength);
        console.log(buffer[10]);
        for(var i = 0; i < 100; i++)
        {
            console.log(buffer);
        }

        

    } else {
        msg = fs.readFileSync(fileName).toString()
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').replace(/\n/g, ' ');
    }
    let funcName = "handle_" + fileName.replace(/[\\ -\/\.\,]/g, '_');
    let path = fileName.replace("dist", "").replace("index.html", "");

    outputArray.push({
        funcName: funcName,
        path: path,
        res: 200,
        type: contentType,
        msg: msg,
        binary: binary
    });
}

function getCcode() {
    let source = `//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Edit the vue source code, if you want to edit the webpage.
// </auto-generated>
//------------------------------------------------------------------------------

#include <ESP8266WebServer.h>
#include "Arduino.h"
\n\n`


    source += "\n\n//register callbacks\n";
    source += "void reg_callbacks(ESP8266WebServer &webServer) { \n";
    outputArray.forEach(e => {

        source += "\n  webServer.on(\"" + e.path + "\", [&]() {\n" +
            "    static const char msg[] PROGMEM  = \"" + e.msg + "\";\n" +
            "    webServer.send_P(" + e.res + ", \"" + e.type + "\", msg ";

        //create big string out of small chuncks
        //source += "    \"" + splitString(e.msg, 100).join("\"+\n    \"") + "\"\n";
        //source += "      \"HaLlO\"\n";
        //source += "      \"" + e.msg + "\"\n";

        source += "  );\n" +
            "  });"
    });
    source += "\n}";

    return source;
}


//include all html files
glob.sync("dist/**/*.html").forEach(file => {
    parseFile(file, "text/html");
});

//include all js files
glob.sync("dist/**/*.js").forEach(file => {
    parseFile(file, "application/javascript");
});

//include all css files
glob.sync("dist/**/*.css").forEach(file => {
    parseFile(file, "text/css");
});

//include all png files
glob.sync("dist/**/*.png").forEach(file => {
    parseFile(file, "image/png;base64", true);
});

//include all ico files
glob.sync("dist/**/*.ico").forEach(file => {
    parseFile(file, "image/x-icon;base64", true);
});



let contentFile = getCcode();
fs.writeFile("../src/vue/content.h", contentFile, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("New vue content file generated.");
}); 