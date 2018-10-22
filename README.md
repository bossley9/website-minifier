# website-minifier #

This plugin aims to reduce webpage loading speeds by minifying HTML, CSS, and JS files.

Given any HTML file, when activated, the plugin will replace the HTML with
a minified duplicate of the code. It then will generate a .max.html file with
the original un-minified document's contents.

When minifying, the plugin removes all HTML, CSS, and JS commented code, then
removes all white space (keeping track of any strings in single or double quotes).

The plugin can then be used on the .max.html file to update the original HTML file.

index.max.html:
```html
<section>
  <!-- title -->
  <h2>Sushi:</h2>
  <p>Great with soy sauce!</p>
  <!-- end of section -->
</section>
<script>
  /* Mine is the Frozen Sunbeam from Dragon King's Daughter! */
  alert('What\'s your favorite sushi roll?');
</script>
```

index.html:
```html
<section><h2>Sushi:</h2><p>Great with soy sauce!</p></section><script>alert('What\'s your favorite sushi roll?');</script>
```

The website-minifier plugin can be activated by selecting
"Packages > website-minifier > minify" in the menu, or by pressing CTRL+ALT+M.

## New Features: ##

### Babel/ES6 support now added! ###
If inline Javacript is enabled, website-minifier will inline all scripts,
including scripts containing ECMAScript 2015 specifications.

Any ECMAScript 2015+ script:
```javascript
const random = (x) => {
  return x + 7;
}
```
Will be converted to ES5 JS:
```javascript
var random = function(x) {
  return x + 7;
}
```

## Suggestions? ##

If there are any suggestions for new features you would like to see added,
please let me know and I will consider implementing them in future versions.

Good luck in your coding :)
