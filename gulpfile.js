var gulp = require('gulp');
var concat = require('gulp-concat');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var fs = require('fs');
var minimist = require('minimist');
var path = require("path");
var es = require("event-stream");
var jsesc = require('jsesc');

var options = minimist(process.argv.slice(2));

var extensionDir = options.directory,
    extensionTarget = options.target;

gulp.task('default', [
    'concat-templates',
    'package:foreground',
    'package:background',
    'manifest-rewrite'
  ]);

gulp.task('concat-templates', function(){
  return gulp.src(extensionDir + '/templates/*.html')
    .pipe(minifyHtml({quotes: true}))
    .pipe((function() {
      return es.map(function(file, callback) {
        var name = path.basename(file.path);
        file.contents = new Buffer("BH.Templates['" + name + "'] = '" + jsesc(String(file.contents), {quotes: 'double'}) + "';");
        callback(null, file);
      });
    })())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest(extensionDir + '/scripts/views/'));
});

gulp.task('package:foreground', ['concat-templates'], function () {
  return gulp.src(extensionDir + '/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat'],
      js: []
    }))
    .pipe(gulp.dest(extensionTarget));
});

gulp.task('package:background', function() {
  var manifest = require('./' + extensionDir + '/manifest.json');
  var scripts = manifest.background.scripts.map(function(script) {
    return extensionDir + '/' + script;
  });

  return gulp.src(scripts)
    .pipe(concat('background.js'))
    .pipe(uglify())
    .pipe(gulp.dest(extensionTarget + '/scripts/'));
});

gulp.task('manifest-rewrite', function() {
  var manifest = require('./' + extensionDir + '/manifest.json');
  manifest.name = manifest.name.replace(' DEV', '');
  manifest.background.scripts = ['scripts/background.js'];

  fs.writeFile('build/manifest.json', JSON.stringify(manifest, null, 2), function(err) {
    if(err) {
      console.log(err);
    }
  });
});
