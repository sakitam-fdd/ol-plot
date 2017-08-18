var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var cssnano = require('gulp-cssnano');
var umd = require('gulp-umd');
var name_ = 'ol-plot';
gulp.task('compact-js', function () {
  return gulp.src([
    './src/index.js',
    './src/Constants.js',
    './src/util/Utils.js',
    './src/util/DomUtils.js',
    './src/event/Event.js',
    './src/event/Observable.js',
    './src/PlotTypes.js',
    './src/PlotUtils.js',
    './src/plot/Plot.js',
    './src/plot/Marker.js',
    './src/plot/Arc.js',
    './src/plot/AttackArrow.js',
    './src/plot/SquadCombat.js',
    './src/plot/TailedAttackArrow.js',
    './src/plot/TailedSquadCombat.js',
    './src/plot/Circle.js',
    './src/plot/Measure.js',
    './src/plot/ClosedCurve.js',
    './src/plot/Curve.js',
    './src/plot/DoubleArrow.js',
    './src/plot/Ellipse.js',
    './src/plot/FineArrow.js',
    './src/plot/AssaultDirection.js',
    './src/plot/GatheringPlace.js',
    './src/plot/Lune.js',
    './src/plot/Sector.js',
    './src/plot/StraightArrow.js',
    './src/plot/Polyline.js',
    './src/plot/Rectangle.js',
    './src/plot/FreehandLine.js',
    './src/plot/Polygon.js',
    './src/plot/FreehandPolygon.js',
    './src/PlotFactory.js',
    './src/tool/PlotDraw.js',
    './src/tool/PlotEdit.js'])
    .pipe(concat(name_ + '.js'))
    .pipe(umd({
      exports: function(file) {
        return 'olPlot';
      },
      namespace: function(file) {
        return 'olPlot';
      }
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(concat(name_ + '.min.js'))
    .pipe(gulp.dest('./dist/'))
});


gulp.task('compact-css', function () {
  return gulp.src('src/**/*.css')
    .pipe(concat(name_ + '.css'))
    .pipe(gulp.dest('./dist/'))
    .pipe(cssnano())
    .pipe(concat(name_ + '.min.css'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', function () {
  var jsWatch = gulp.watch('./src/**/*.js', ['compact-js']);
  jsWatch.on('change', function (e) {
    console.log('File ' + e.path + ' was ' + e.type + ', running compact js ...');
  });
  var cssWatch = gulp.watch('./src/**/*.css', ['compact-css']);
  jsWatch.on('change', function (e) {
    console.log('File ' + e.path + ' was ' + e.type + ', running compact css ...');
  });
});