// Gulp
var gulp = require("gulp");
var del = require("del");
var gulpSequence = require('gulp-sequence');

// CSS related plugins
var sass         = require( 'gulp-sass' );
var sassGlob 	 = require( 'gulp-sass-glob' );
var concat 		 = require( 'gulp-concat' );
var autoprefixer = require( 'gulp-autoprefixer' );
var newer 		 = require("gulp-newer");
var cssnano 	 = require('gulp-cssnano');
var purgecss 	 = require('gulp-purgecss');

// Icon related plugins
var iconfont 	 = require('gulp-iconfont');
var	iconfontCss  = require('gulp-iconfont-css');
var	runTimestamp = Math.round(Date.now()/1000);
var fontName = 'Icons';

// Images related plugins
var imagemin 	 = require("gulp-imagemin");

// Sprites related plugins
var svgSprite    = require("gulp-svg-sprites");

// JS related plugins
var uglify       = require("gulp-uglify-es").default;
var order        = require("gulp-order");

// Browers related plugins
var browserSync  = require( 'browser-sync' ).create();

// Gulp task for browser sync
gulp.task("browsersync", function() {
	browserSync.init({
		//proxy: "INSERT YOUR URL PROXY"
	});
});

// Gulp task for reload page
gulp.task("reload", function(){
    browserSync.reload();
});

// Gulp task for build sass
gulp.task("build_sass", function() {
	return gulp
	.src("src/sass/**/*.scss")
	.pipe(sassGlob())
	.pipe(sass({ outputStyle: "compressed" })
	.on("error", sass.logError))
	.pipe(concat("main.css"))
	.pipe(gulp.dest("src/css/"))
});

// Gulp task for build css
gulp.task("build_css", function() {
	return gulp
	.src('src/css/*css')
	/*.pipe(purgecss({
		content: ['*.*'],
		css: ['src/css/bootstrap.min.css']
	}))*/
	.pipe(newer("style.min.css"))
	.pipe(concat("style.min.css"))
	.pipe(cssnano())
	.pipe(gulp.dest("dist/css/"))
});

// Gulp task for clean css
gulp.task("clean_css", function() {
    return del("dist/css/*.*")
});

// Gulp task for build svg sprites
gulp.task("build_sprites", function() {
    return gulp
    .src("src/images/sprites/*.svg")
	.pipe(svgSprite({
		svg: {
			sprite: "images/sprite.svg"
		},
		preview: false
	}))
	.pipe(gulp.dest("src"))
});

// Gulp task for clean images
gulp.task("clean_images", function() {
    return del("dist/images/*.*")
});

// Gulp task for build images
gulp.task("build_images", function() {
    return gulp
    .src("src/images/*.*")
	//.pipe(imagemin())
	.pipe(gulp.dest("dist/images"))
});

// Gulp Task for build JS
gulp.task("build_js", function() {
    return gulp
    .src('src/js/**/*.js')
	.pipe(order(["jquery*.js","popper*.js", "**/*.js"]))
	.pipe(concat("script.min.js"))
	.pipe(uglify())
	.on('error', swallowError)
	.pipe(gulp.dest("dist/js"))
});

// If you want details of the error in the console
function swallowError(error) {
  console.log(error.toString())
  this.emit('end')
}

// Gulp task for clean iconfont
gulp.task("clean_iconfont", function(){
	return del(["src/sass/partials/**/*.*", "dist/fonts/*.*"])
});

// Gulp task for generate iconfont based in SVG files
gulp.task('iconfont', ['clean_iconfont'], function(){
	return gulp.src(['src/icons/*.svg']) // Source folder containing the SVG images
	  .pipe(iconfontCss({
		fontName: fontName, // The name that the generated font will have
		path: 'src/sass/templates/_icons.scss', // The path to the template that will be used to create the SASS/LESS/CSS file
		targetPath: '../../../src/sass/partials/_icons.scss', // The path where the file will be generated
		fontPath: '../../dist/fonts/icons/', // The path to the icon font file
		cssClass: 'iconfont'
	  }))
	  .pipe(iconfont({
		prependUnicode: false, // Recommended option 
		fontName: fontName, // Name of the font
		formats: ['ttf', 'eot', 'woff'], // The font file formats that will be created
		normalize: true,
		//fontHeight: 10,
		timestamp: runTimestamp // Recommended to get consistent builds when watching files
	  }))
	  .pipe(gulp.dest('dist/fonts/icons/'));
  });

// Gulp task for watch files
gulp.task("watch_files", function() {
    gulp.watch("src/sass/**/*.scss*", ['build_sass']);
    gulp.watch("src/css/**/*.css*", ['clean_css', 'build_css', 'reload']);
    gulp.watch("src/js/**/*.js*", ['build_js', 'reload']);
    gulp.watch("src/images/*.*", ['clean_images', 'build_images', 'reload']);
    gulp.watch("src/images/sprites/*.*", ['build_sprites']);
	gulp.watch("*.php", ['reload']);
	gulp.watch("src/icons/*.svg*", ['iconfont', 'reload']);
});

// Gulp default task
gulp.task('default', gulpSequence('iconfont', 'clean_css', 'build_sass', 'build_css', 'build_sprites', 'clean_images', 'build_images', 'build_js', 'browsersync', 'watch_files'));
