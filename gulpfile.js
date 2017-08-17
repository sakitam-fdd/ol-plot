var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var cssnano = require('gulp-cssnano');
var name_ = 'ol-plot';
gulp.task('compact-js', function () {
  return gulp.src([
    './lib/goog/base.js',
    './lib/goog/idisposable.js',
    './lib/goog/disposable.js',
    './lib/goog/eventid.js',
    './lib/goog/event.js',
    './lib/goog/error.js',
    './lib/goog/nodetype.js',
    './lib/goog/string.js',
    './lib/goog/asserts.js',
    './lib/goog/array.js',
    './lib/goog/object.js',
    './lib/goog/util.js',
    './lib/goog/browser.js',
    './lib/goog/engine.js',
    './lib/goog/reflect.js',
    './lib/goog/useragent.js',
    './lib/goog/eventtype.js',
    './lib/goog/browserfeature.js',
    './lib/goog/browserevent.js',
    './lib/goog/entrypointregistry.js',
    './lib/goog/listenable.js',
    './lib/goog/listener.js',
    './lib/goog/listenermap.js',
    './lib/goog/events.js',
    './src/GISpace.js',
    './src/Constants.js',
    './src/util/Utils.js',
    './src/util/DomUtils.js',
    './src/PlotTypes.js',
    './src/PlotUtils.js',
    './src/event/Event.js',
    './src/event/PlotDrawEvent.js',
    './src/event/PlotEditEvent.js',
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
    .pipe(gulp.dest('./dist/'))
    // .pipe(uglify())
    .pipe(concat(name_ + '.min.js'))
    .pipe(gulp.dest('./dist/'))
});


gulp.task('compact-css', function () {
  return gulp.src('src/**/*.css')
    .pipe(concat(name_ + '.min.css'))
    .pipe(gulp.dest('./dist/'))
    .pipe(cssnano());
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