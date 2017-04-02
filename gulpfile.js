var gulp = require('gulp');
var gulp_jspm = require('gulp-jspm');
var uglify = require('gulp-uglifyjs');
var gzip = require('gulp-gzip');
var swig = require('gulp-swig');
var data = require('gulp-data');
var fs = require('fs');
var rename = require('gulp-rename');
var bump = require('gulp-bump');

gulp.task('release', function () {
  return gulp.src('./*.json')
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});
gulp.task('bundle', ['release'], function () {
  return gulp.src('src/Hydra.js')
    .pipe(gulp_jspm({selfExecutingBundle: true, fileName: 'hydra', format: 'global', globalName: 'Hydra'}))
    .pipe(gulp.dest('versions/'));
});
gulp.task('add-version-to-source-code', ['bundle'], function () {
  var config = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src('versions/hydra.js')
    .pipe(data(config))
    .pipe(swig())
    .pipe(rename('hydra.js'))
    .pipe(gulp.dest('versions/'));
});
gulp.task('bundle-minify', ['add-version-to-source-code'], function () {
  return gulp.src('versions/hydra.js')
    .pipe(uglify('hydra.min.js', {
      outSourceMap: true
    }))
    .pipe(gulp.dest('versions/'));
});
gulp.task('bundle-minify-gzip', ['bundle-minify'], function () {
  return gulp.src('versions/hydra.js')
    .pipe(uglify('hydra.min.js'))
    .pipe(gzip())
    .pipe(gulp.dest('versions/'));
});
gulp.task('default', ['bundle-minify-gzip'], function () {
  var config = JSON.parse(fs.readFileSync('./package.json'));
  return gulp.src('templates/README.tpl')
    .pipe(data(config))
    .pipe(swig())
    .pipe(rename('README.md'))
    .pipe(gulp.dest('./'));
});
