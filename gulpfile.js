const gulp = require('gulp'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    del = require('gulp-clean'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    scss = require('gulp-sass'),
    uglify = require('gulp-uglify-es').default,
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch');

scss.compiler = require('node-sass');

/* Start DEV version */

const browser = () => {
    browserSync.init({
		server: {
			baseDir: `./build`,
		},
		notify: false
    });
};

const cacheClear = () => {
    cache.clearAll();
};

const libsJs = (cb) => {
    return gulp.src('app/libs/libs.js')
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(concat('libs.min.js'))
		.pipe(gulp.dest('build/js/'))
		.pipe(browserSync.reload({
			stream: true
        }));
    cb();
};

const mainJs = (cb) => {
    return gulp.src('app/js/common.js')
        .pipe(plumber())
        .pipe(rename('common.js'))
        .pipe(gulp.dest('build/js/'))
		.pipe(browserSync.reload({
			stream: true
        }));
    cb();
};

const libsCss = (cb) => {
    return gulp.src('app/libs/libs.scss')
        .pipe(plumber())
        .pipe(scss().on('error', scss.logError))
        .pipe(concat('libs.min.css'))
        .pipe(gulp.dest('build/css/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const mainCssDev = (cb) => {
    return gulp.src('app/scss/index.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(scss().on('error', scss.logError))
    .pipe(autoprefixer('last 5 versions'))
    .pipe(sourcemaps.write())
    .pipe(rename('style.css'))
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.reload({
        stream: true
    }));
    cb();
};

const htmlDev = (cb) => {
    return gulp.src('app/*.html')
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const copyImg = (cb) => {
    return gulp.src('app/img/**/*.*', {nodir: false})
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const copySupport = (cb) => {
    return gulp.src(['.htaccess', 'manifest.json', 'browserconfig.xml'])
        .pipe(gulp.dest('build/'));
    cb();
};

const copyVideo = (cb) => {
    return gulp.src('app/video/**/*.*')
        .pipe(gulp.dest('build/video/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const copyFonts = (cb) => {
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    cb();
};

const watcher = () => {
    watch('app/img/**/*.*', gulp.series(copyImg, cacheClear));
    watch('app/video/**/*.*', gulp.series(copyVideo, cacheClear));
    watch('app/fonts/**/*.*', gulp.series(copyFonts, cacheClear));
    watch('app/libs/**/*.*', gulp.series(libsCss, libsJs, cacheClear));
    watch('app/js/**/*.*', gulp.series(mainJs, cacheClear));
    watch('app/scss/**/*.*', gulp.series(mainCssDev, cacheClear));
    watch('app/parts/*.html', gulp.series(htmlDev, cacheClear));
    watch('app/*.html', gulp.series(htmlDev, cacheClear));
};

exports.default =  gulp.series(gulp.parallel(copyImg, copySupport, copyVideo, copyFonts, libsCss, libsJs, mainJs, mainCssDev, htmlDev), gulp.parallel(browser, watcher));

/* End DEV version */

/* Start Production */

const mainJsBuild = (cb) => {
    return gulp.src('build/js/common.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(concat('common.min.js'))
        .pipe(gulp.dest('build/js/'));
    cb();
};

const mainCssBuild = (cb) => {
    return gulp.src('build/css/style.css')
        .pipe(plumber())
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('build/css/'));
    cb();
};

const removeModules = (cb) => {
    return gulp.src('node_modules', {read: false})
        .pipe(del());
    cb();
};

const replaceJs = (cb) => {
    return gulp.src('build/*.html')
        .pipe(replace('common.js', 'common.min.js'))
        .pipe(replace('style.css', 'style.min.css'))
        .pipe(gulp.dest('build/'));
    cb();
};

exports.production = gulp.series(mainJsBuild, mainCssBuild, replaceJs, removeModules);
/* End Production */