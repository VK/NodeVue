//prepare all files of the  Vue.js app for the ESP8266WebServer

const glob = require("glob")
const fs = require('fs')
const path = require('path')
const rimraf = require("rimraf");

//cleanup old output folder
rimraf.sync("../data");

//holds the 
var outputArray = [];

//files are numbered in the ESP8266 fs, since some names might get too long
let fileCount = 0;

function parseFile(fileName, contentType, upload = false) {
    let msg = ""
    let filePath = ""
    if (upload) {

        //if upload mode is chosen the files are copied to the data folder
        //of the app. Note: The filename is replaced by a number, since
        //the filesystem has a very short pathlength restriction
        let targetFile = path.normalize("../data/" + fileName)
        let targetPath = path.dirname(targetFile)
        fileCount += 1;
        targetFile = path.join(targetPath , fileCount + path.extname(fileName))

        //create target folder if needed
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        //copy file
        fs.copyFileSync(fileName, targetFile);
        //get the filepath on the NodeMUC
        filePath = targetFile.replace("..\\data", "").replace(/\\/g, "/");

    } else {
        //if the file should be directly added to the code
        msg = fs.readFileSync(fileName).toString()
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').replace(/\n/g, ' ');
    }
    let funcName = "handle_" + fileName.replace(/[\\ -\/\.\,]/g, '_');
    let webPath = fileName.replace("dist", "").replace("index.html", "");
    
    //fill the output array with the important information for code generation
    outputArray.push({
        funcName: funcName,
        webPath: webPath,
        filePath: filePath,
        res: 200,
        type: contentType,
        msg: msg,
        upload: upload
    });
}


//compute the c code used in the Arduino 
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
#include <FS.h>
\n`
    source += "\n//register callbacks\n";
    source += "void reg_callbacks(ESP8266WebServer &webServer) {";
    outputArray.forEach(e => {

        if (e.upload) {

            source += "\n  webServer.serveStatic(\""+ e.webPath+ "\", SPIFFS, \"" + e.filePath + "\");";

        } else {
            source += "\n  webServer.on(\"" + e.webPath + "\", [&]() {\n" +
                "    static const char msg[] PROGMEM  = \"" + e.msg + "\";\n" +
                "    webServer.send_P(" + e.res + ", \"" + e.type + "\", msg ";

            source += "  );\n" +
                "  });"

        }
    });
    source += "\n}";

    return source;
}


//include all html files directly to code
glob.sync("dist/**/*.html").forEach(file => {
    parseFile(file, "text/html");
});

//include all json files directly to code
glob.sync("dist/**/*.json").forEach(file => {
    parseFile(file, "application/json");
});

//add all js files as static files
glob.sync("dist/**/*.js").forEach(file => {
    parseFile(file, "application/javascript", true);
});

//add all css files as static files
glob.sync("dist/**/*.css").forEach(file => {
    parseFile(file, "text/css", true);
});

//add all png files as static files
glob.sync("dist/**/*.png").forEach(file => {
    parseFile(file, "image/png", true);
});

//add all ico files as static files
glob.sync("dist/**/*.ico").forEach(file => {
    parseFile(file, "image/x-icon", true);
});


//generate c-code file
let contentFile = getCcode();

//create folder for the c output in the Arduino app
if (!fs.existsSync("../src/vue/")) {
    fs.mkdirSync("../src/vue/");
}

//write the file content.h file
fs.writeFile("../src/vue/content.h", contentFile, function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("New vue content file generated.");
}); 
