"use strict";

const gulp     = require('gulp');
const babel    = require('gulp-babel');
const del      = require('del').sync;
const execSync = require('child_process').execSync;
const sourcemaps = require('gulp-sourcemaps');

const srcFiles = ['index.js', 'code/**/*.js'];

const watchOpts = {
	debounceDelay: 2000
};

gulp.task('clean', () => {
	return del(['./build']);
});

gulp.task('src', () => {
	gulp.src(['index.js'])
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./build'));

	gulp.src('code/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./build/code'));
});

gulp.task('defs', () => {
	del(['./build/defs']);
	gulp.src('./defs/*.json5')
		.pipe(gulp.dest('./build/defs'));

});

gulp.task('samples', () => {
	del(['./build/defs']);

	let output = execSync('git ls-files defs', { encoding: 'utf8' }),
		files  = output
			.trim()
			.split("\n");

	gulp.src(files)
		.pipe(gulp.dest('./build/defs'));

});

gulp.task('infra', () => {
	gulp.src('./package.json')
		.pipe(gulp.dest('./build'));
});

gulp.task('default', ['src', 'defs', 'infra',], () => {
	gulp.watch(srcFiles, watchOpts, ['src']);
	gulp.watch('./defs/*.json5', watchOpts, ['defs']);
	gulp.watch('./package.json', watchOpts, ['infra']);
});

gulp.task('release', ['src', 'samples', 'infra'], () => {

});
