'use babel';



// Dependencies
import fs from 'fs';
import path from 'path';
import * as babel from 'babel-core';
import * as env from 'babel-preset-env';



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
 * Given a string, gets all instances of strings using single quotes,
 * strings using double quotes, single-line comments beginning with //,
 * or multiline comments for javascript.
 *
 * Updates the string by removing all coding comments and restoring quotes.
 */
module.exports.removeComments = function(input) {
  let instances = [];
  if(instances = input.match(/(".*?([^\\"]|\\.)*")|('.*?([^\\']|\\.)*')|(\/\*([\s\S]*?)\*\/)|(\/\/.*)/g)) {
    for (let i = 0; i < instances.length; i++) {
      // single-line comments
      if (instances[i].indexOf("//") == 0) {
        input = input.replace(instances[i], "");
      }
      // multiline comments
      else if (instances[i].indexOf("/*") == 0) {
        input = input.replace(instances[i], "");
      }
    }
  }

  return input;
}



/**
 * Given a CSS/JS string, returns minified CSS/JS.
 * First, remove all comments. Then replace all multiple consecutive
 * whitespace characters with a single whitespace character. Finally, remove
 * all whitespace characters not in quotes.
 *
 * Return the minified CSS/JS string.
 */
module.exports.minifyCode = function(code) {
  let min = this.removeComments(code);

  min = min.replace(/\s+/g, " ").replace(/\n /gm, " ");
  // min = min.replace(/\s*(?=([^"\\|']*(\\.|"([^"\\|']*\\.)*[^"\\|']*"))*[^"|']*$)/gm, "");

  return min;
}



/**
 * Given minified HTML and the root directory, finds all instances of inline
 * or external stylesheets, then minifies and inlines all stylesheets.
 *
 * Returns minified HTML with inline stylesheets.
 */
module.exports.inlineCSS = function(rootDir, min) {
  let encoding = atom.config.get('website-minifier.FileEncoding');
  // match:
  // 1. begins with "<link"
  // 2. ends with nearest ">"
  // 4. can span multiple lines
  // 5. can include any number of characters or white spaces
  let links = min.match(/<link[^>]*>/gim);

  let href = "", hrefRaw = [];

  if (links) {
    for (let i = 0; i < links.length; i++) {

      // match:
      // 1 - does not include "type=" and contains <link.....ref="stylesheet".....>
      // OR contains <link...type="text/css"....>
      var newLink = links[i].match(/(?!.*type=)<.*rel=['"]stylesheet['"].*>|<link.*type=['"]text\/css['"].*>/gim);

      if (newLink) {
        var link = newLink[0];

        // match:
        // 1 - begins with "href=" and ends with quotations
        hrefRaw = link.match(/href=['"].*?['"]/im);
        href = hrefRaw[0].substring(6, hrefRaw[0].length-1);

        if (href.substring(0,5) != 'https' && href.substring(0,4) != 'http') {
          let css = fs.readFileSync(rootDir + href, encoding);
          let cssMinified = this.minifyCode(css);

          min = min.replace(links[i], "<style>" + cssMinified + "</style>");
        }

      }

    }
  }

  // match:
  // 1. begins with "<style>"
  // 2. ends with "</style>"
  let styles = min.match(/<style>\s*.*?\s*<\/style>/gim);
  if (styles) {
    for (let j = 0; j < styles.length; j++) {
      let cssStyle = styles[j].substring(7, styles[j].length-8);
      let cssStyleMinified = this.minifyCode(cssStyle);

      min = min.replace(styles[j], "<style>" + cssStyleMinified + "</style>");
    }
  }

  return min;
}



/**
 * Given minified HTML and the root directory, finds all instances of inline
 * or external scripts, then minifies and inlines all scripts.
 *
 * Returns minified HTML with inline scripts.
 */
module.exports.inlineJS = function(rootDir, min) {
  let encoding = atom.config.get('website-minifier.FileEncoding');

  // match:
  // 1. begins with "<script"
  // 2. continue until a ">" is reached
  // 3. continue until before a "<" is reached
  // 5. ends with "</script>"
  let scripts = min.match(/<script[^>]*>[^<]*<\/script>/gim);
  let src = "", srcRaw = [];
  if (scripts) {
    for (let i = 0; i < scripts.length; i++) {

      // if external source exists
      if (scripts[i].indexOf("src") > -1) {
        srcRaw = scripts[i].match(/src=['"].*?['"]/im);
        src = srcRaw[0].substring(5, srcRaw[0].length-1);

        if (src.substring(0,5) != 'https' && src.substring(0,4) != 'http') {
          let js = fs.readFileSync(rootDir + src, encoding);
          let jsTranspiled = babel.transform(js, { presets: [env] } ).code;
          let jsMinified = this.minifyCode(jsTranspiled);

          min = min.replace(scripts[i], "<script>" + jsMinified + "</script>");
        }
      }
      // if no external source exists
      else {
        let jsScript = scripts[i].substring(scripts[i].indexOf(">")+1, scripts[i].length-9);

        let jsTranspiled = babel.transform(jsScript, { presets: [env] } ).code;
        let jsScriptMinified = this.minifyCode(jsTranspiled);

        min = min.replace(scripts[i], "<script>" + jsScriptMinified + "</script>");
      }
    }

  }

  return min;
}



/**
 * Given a root directory and an HTML string, returns minified HTML.
 */
module.exports.minifyHTML = function(rootDir, html) {
  let min = html;

  // if inline CSS
  if (atom.config.get('website-minifier.InlineCss')) {
    min = this.inlineCSS(rootDir, min);
  }

  // if inline JS
  if (atom.config.get('website-minifier.InlineJs')) {
    min = this.inlineJS(rootDir, min);
  }

  // replace:
  // 1. replace multiple consecutive white space characters
  //    with one single white space character
  // 2. remove white space between tag closings and beginnings
  min = min.replace(/\s+/g, " ").replace(/>\s+</g, "><");
  // 3. remove html comment tags and everything in between
  // min = min.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/<!--.*?-->/g, "");

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
  htmlString = this.stringifyFile(filePath);

  var htmlMinified = this.minifyHTML(splitPath[0], htmlString);
  fs.writeFile(minifyFilePath, htmlMinified, function(err, result) {
   callback(err, result);
  });
}

// END
