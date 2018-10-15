'use babel';



// Dependencies
import fs from 'fs';
import path from 'path';



/**
 * Given a full path to a file, returns a two-element array containing the
 * directory path and the name of the file separately.
 */
module.exports.splitPath = function(filePath) {
  let fileName = path.basename(filePath);
  let fileLoc = filePath.indexOf(fileName);

  return [filePath.substring(0, fileLoc), fileName];
}



/**
 * Returns the contents of a file as a string.
 */
module.exports.stringifyFile = function(filePath) {
  let encoding = atom.config.get('website-minifier.FileEncoding');
  let data = fs.readFileSync(filePath, encoding);
  return data.toString();
}



/**
 * Given a CSS string, returns minified CSS.
 */
module.exports.minifyCSS = function(css) {
  let min = "";

  return min;
}



/**
 * Given a JS string, returns minified Javascript.
 */
module.exports.minifyJS = function(js) {
  let min = "";

  return min;
}



/**
 * Given an HTML string, returns minified HTML.
 */
module.exports.minifyHTML = function(html) {
  let min = "";

  min = "minified contents go here";

  return min;
}



/**
 * Given a path to an HTML file and a callback function, generates a
 * .ext.html file (if not already created) and starts the minify process.
 */
module.exports.genFiles = function(filePath, callback) {
  let minifyFilePath = "";
  let splitPath = this.splitPath(filePath);
  let ext = atom.config.get('website-minifier.GeneratedFileExtension');

  // if .ext.html
  if (splitPath[1].indexOf(
    "." + atom.config.get('website-minifier.GeneratedFileExtension') + ".html"
  ) > -1) {


    let minFile = splitPath[1].substring(
      0,
      splitPath[1].length-(1 + ext.length + 5)
    ) + ".html";

    let minPath = splitPath[0] + minFile;
    minifyFilePath = minPath;

  }
  // if .html
  else {
    // generate max file
    var maxData = this.stringifyFile(filePath);
    var maxFile = filePath.substring(0, filePath.length-4) + ext + ".html";
    fs.writeFileSync(maxFile, maxData);

    minifyFilePath = filePath;
  }

  // begin minifying
  var htmlMinified = this.minifyHTML(this.stringifyFile(filePath));
  fs.writeFile(minifyFilePath, htmlMinified, function(err, result) {
   callback(err, result);
  });
}

// END
