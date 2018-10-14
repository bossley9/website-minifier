# website-minifier

This plugin aims to reduce webpage loading speeds by minifying HTML, CSS, and JS files.

Given any HTML file, when activated, the plugin will replace the HTML with
a minified duplicate of the code. It then will generate a .max.html file with
the original un-minified document's contents.

The plugin can then be used on the .max.html file to update the original HTML file.

The website-minifier plugin can be activated by selecting
"Packages > website-minifier > minify" in the menu, or by pressing CTRL+ALT+M.
