'use babel';

// Dependencies
import { CompositeDisposable } from 'atom';

import Minifier from './minifier';



export default {

  subscriptions: null,



  config: {
    MinifyOnSave: {
      title: "Minify on Save",
      description: "Toggle HTML files to generate minified counterparts on save",
      type: 'boolean',
      default: false,
      order: 1
    },
    GeneratedFileExtension: {
      title: "Generated File Extension",
      description: "Generates un-minified files with the format .ext.html",
      type: 'string',
      default: "max",
      order: 2
    },
    FileEncoding: {
      title: "File Encoding",
      description: "Specifies the file encoding used in all HTML files, scripts, and attached stylesheets",
      type: 'string',
      default: "utf8",
      order: 3
    },
    InlineCss: {
      title: "Inline CSS",
      description: "Inlines and minifies any external stylesheets into the HTML file",
      type: 'boolean',
      default: true,
      order: 4
    },
    InlineJs: {
      title: "Inline JS",
      description: "Inlines and minifies any external scripts into the HTML file",
      type: 'boolean',
      default: true,
      order: 5
    },
    DisplayNonHtmlWarnings: {
      title: "Display Non-HTML File Warnings",
      description: "If enabled, a warning will display every time this package \
      is run on a non-HTML file.",
      type: 'boolean',
      default: false,
      order: 6
    }

  },



  activate(state) {

    // Register events to subscriptions for easy diposal
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'website-minifier:minify': () => this.minify()
    }));

  },



  deactivate() {
    this.subscriptions.dispose();
  },



  minify() {

    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      let currentPath = editor.getPath();
      // if HTML file
      if (currentPath.substring(currentPath.length-5) == ".html") {

        Minifier.genFiles(currentPath, function(err, result) {
          if (err) throw err;
          else atom.notifications.addSuccess("website-minify: Minify succeeded.");
        });

      }
      else {
        // Non-HTML file
        if (atom.config.get('website-minifier.DisplayNonHtmlWarnings'))
          atom.notifications.addWarning("website-minify: Attempt to minify a \
          non-HTML file.");
      }

    }
    // if ActiveTextEditor is invalid
    else atom.notifications.addError("website-minify: Attempt to minify a \
    non-file window.");

  }

};
