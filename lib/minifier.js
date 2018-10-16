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
  // replace:
  // 1. replace multiple consecutive white space characters
  //    with one single white space character
  // 2. remove all /* */ multiline comments not in quotes
  //    idea: https://stackoverflow.com/questions/6462578/alternative-to-regex-match-all-instances-not-inside-quotes
  // 3. remove all white space not in quotes
  min = css.replace(/\s+/g, " ").replace(/\/\*.*?\*\/(?=([^"\\|']*(\\.|"([^"\\|']*\\.)*[^"\\|']*"))*[^"|']*$)/gm, "");
  min = min.replace(/\s*(?=([^"\\|']*(\\.|"([^"\\|']*\\.)*[^"\\|']*"))*[^"|']*$)/gm, "");

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
 * Given a root directory and an HTML string, returns minified HTML.
 */
module.exports.minifyHTML = function(rootDir, html) {
  let encoding = atom.config.get('website-minifier.FileEncoding');
  // replace:
  // 1. replace multiple consecutive white space characters
  //    with one single white space character
  // 2. remove white space between tag closings and beginnings
  // 3. remove html comment tags and everything in between
  let min = html.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/<!--.*?-->/g, "");

  // if inline CSS
  if (atom.config.get('website-minifier.InlineCss')) {
    // match:
    // 1. begins with "<link"
    // 2. ends with nearest "/>"
    // 3. either does not contain "type=", or contains "type=" followed by "text/css"
    // 4. can span multiple lines
    // 5. can include any number of characters or white spaces
    let links = min.match(/(?!.*type=)<link\s*.*?\s*\/>|<link\s*.*?type=['"]text\/css['"].*?\s*\/>/gim);
    let href = "", hrefRaw = [];

    for (let i = 0; i < links.length; i++) {
      // match:
      // 1 - begins with "href=" and ends with quotations
      hrefRaw = links[i].match(/href=['"].*?['"]/im);
      href = hrefRaw[0].substring(6, hrefRaw[0].length-1);

      let css = fs.readFileSync(rootDir + href, encoding);
      let cssMinified = this.minifyCSS(css);

      //atom.notifications.addSuccess(min.indexOf(links[i]).toString());

      //var linkRegex = new RegExp(links[i]);
      min = min.replace(links[i], "<style>" + cssMinified + "</style>");

      //atom.notifications.addSuccess("got one link");

    }


  }

  // if inline JS
  if (atom.config.get('website-minifier.InlineJs')) {
    //atom.notifications.addInfo("inline js");
  }


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
  var htmlMinified = this.minifyHTML(splitPath[0], this.stringifyFile(filePath));
  fs.writeFile(minifyFilePath, htmlMinified, function(err, result) {
   callback(err, result);
  });
}

// END
