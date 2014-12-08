var gulp = require('gulp');
var concat = require('gulp-concat');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');

var path = require("path");
var es = require("event-stream");

gulp.task('default', function() {});

gulp.task('usemin', function () {
  return gulp.src('better-history/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat'],
      js: [uglify()]
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('templatify', function(){
  gulp.src('better-history/templates/*.html')
    .pipe(minifyHtml())
    .pipe((function() {
      return es.map(function(file, callback) {
        var name = path.basename(file.path);
        file.contents = new Buffer("BH.Templates['" + name + "'] = \"" + String(file.contents) + '"');
        callback(null, file);
      });
    })())
    .pipe(concat('template.js'))
    .pipe(gulp.dest('build/scripts'));
});
