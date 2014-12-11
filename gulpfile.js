var gulp = require('gulp');
var concat = require('gulp-concat');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');

var path = require("path");
var es = require("event-stream");

gulp.task('default', ['copy', 'templatify', 'usemin', 'sloppyCopy']);

gulp.task('copy', function(){
  // We must ditch the git repo due to issues when usemin runs. It was not picking up a updated file in the git submodule for some reason.
  gulp.src(['./better-history/**/*'])
  .pipe(gulp.dest('temp'));

  gulp.src([
    './temp/_locales/**/*',
    './temp/manifest.json',
    './temp/images/**/*'
  ], {base: './temp'})
  .pipe(gulp.dest('build'));

  gulp.src(['./scripts/config.js'])
  .pipe(gulp.dest('temp/scripts'));
});

gulp.task('templatify', function(cb){
  gulp.src('temp/templates/*.html')
    .pipe(minifyHtml())
    .pipe((function() {
      return es.map(function(file, callback) {
        var name = path.basename(file.path);
        file.contents = new Buffer("BH.Templates['" + name + "'] = '" + String(file.contents) + "';");
        callback(null, file);
      });
    })())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('temp/scripts/views/'));
    cb();
});

gulp.task('usemin', ['templatify'], function (cb) {
  gulp.src('temp/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat'],
     js: []
    }))
    .pipe(gulp.dest('build/'));
    cb();
});

// This is the solution to making sure background scripts are present. Sloppy copy all scripts into the release. Sucks...
gulp.task('sloppyCopy', ['usemin'], function(){
  gulp.src(['./temp/scripts/**/*'], {base: './temp'})
  .pipe(gulp.dest('build'));

  gulp.src(['./temp/bower_components/**/*'], {base: './temp'})
  .pipe(gulp.dest('build'));
});

