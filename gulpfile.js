var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var cssnano = require('gulp-cssnano');

gulp.task('compact-js', function () {
   return gulp.src(['./lib/goog/base.js',
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
       './src/gispace/GISpace.js',
       './src/gispace/Constants.js',
       './src/gispace/util/Utils.js',
       './src/gispace/util/DomUtils.js',
       './src/gispace/PlotTypes.js',
       './src/gispace/PlotUtils.js',
       './src/gispace/event/Event.js',
       './src/gispace/event/PlotDrawEvent.js',
       './src/gispace/plot/Plot.js',
       './src/gispace/plot/Arc.js',
       './src/gispace/plot/AttackArrow.js',
       './src/gispace/plot/SquadCombat.js',
       './src/gispace/plot/TailedAttackArrow.js',
       './src/gispace/plot/TailedSquadCombat.js',
       './src/gispace/plot/Circle.js',
       './src/gispace/plot/ClosedCurve.js',
       './src/gispace/plot/Curve.js',
       './src/gispace/plot/DoubleArrow.js',
       './src/gispace/plot/Ellipse.js',
       './src/gispace/plot/FineArrow.js',
       './src/gispace/plot/AssaultDirection.js',
       './src/gispace/plot/GatheringPlace.js',
       './src/gispace/plot/Lune.js',
       './src/gispace/plot/Sector.js',
       './src/gispace/plot/StraightArrow.js',
       './src/gispace/plot/Polyline.js',
       './src/gispace/plot/FreehandLine.js',
       './src/gispace/plot/Polygon.js',
       './src/gispace/plot/Marker.js',
       './src/gispace/plot/Rectangle.js',
       './src/gispace/plot/FreehandPolygon.js',
       './src/gispace/PlotFactory.js',
       './src/gispace/tool/PlotDraw.js',
       './src/gispace/tool/PlotEdit.js'])
       .pipe(concat('p-ol3.min.js'))
       .pipe(uglify())
       .pipe(gulp.dest('./build/'));
});

gulp.task('compact-js-debug', function () {
    return gulp.src(['./src/gispace/GISpace.js',
            './src/gispace/Constants.js',
            './src/gispace/util/Utils.js',
            './src/gispace/util/DomUtils.js',
            './src/gispace/PlotTypes.js',
            './src/gispace/PlotUtils.js',
            './src/gispace/event/Event.js',
            './src/gispace/event/PlotDrawEvent.js',
            './src/gispace/plot/Plot.js',
            './src/gispace/plot/Arc.js',
            './src/gispace/plot/AttackArrow.js',
            './src/gispace/plot/SquadCombat.js',
            './src/gispace/plot/TailedAttackArrow.js',
            './src/gispace/plot/TailedSquadCombat.js',
            './src/gispace/plot/Circle.js',
            './src/gispace/plot/ClosedCurve.js',
            './src/gispace/plot/Curve.js',
            './src/gispace/plot/DoubleArrow.js',
            './src/gispace/plot/Ellipse.js',
            './src/gispace/plot/FineArrow.js',
            './src/gispace/plot/AssaultDirection.js',
            './src/gispace/plot/GatheringPlace.js',
            './src/gispace/plot/Lune.js',
            './src/gispace/plot/Sector.js',
            './src/gispace/plot/StraightArrow.js',
            './src/gispace/plot/Polyline.js',
            './src/gispace/plot/FreehandLine.js',
            './src/gispace/plot/Polygon.js',
            './src/gispace/plot/Marker.js',
            './src/gispace/plot/Rectangle.js',
            './src/gispace/plot/FreehandPolygon.js',
            './src/gispace/PlotFactory.js',
            './src/gispace/tool/PlotDraw.js',
            './src/gispace/tool/PlotEdit.js'])
        .pipe(concat('p-ol3.debug.js'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('compact-css', function(){
    return gulp.src('src/*.css')
        .pipe(concat('p-ol3.min.css'))
        .pipe(gulp.dest('./build/'))
        .pipe(gulp.dest('./sample/'))
        .pipe(cssnano());
});

gulp.task('default', function () {
    var jsWatch = gulp.watch('./src/**/*.js', ['compact-js', 'compact-js-debug']);
    jsWatch.on('change', function (e) {
        console.log('File ' + e.path + ' was ' + e.type + ', running compact js ...');
    });
    var cssWatch = gulp.watch('./src/*.css', ['compact-css']);
    jsWatch.on('change', function (e) {
        console.log('File ' + e.path + ' was ' + e.type + ', running compact css ...');
    });
});