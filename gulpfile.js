"use strict";

const gulp  = require('gulp');
const babel = require('gulp-babel');
const del = require('del');

const srcFiles = ['index.js', 'code/**/*.js'];

const watchOpts = {
	debounceDelay: 2000
};

gulp.task('clean', () => {
	return del(['./build']);
});

gulp.task('src', () => {
	gulp.src(['index.js'])
		.pipe(babel())
		.pipe(gulp.dest('./build'));

	gulp.src('code/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('./build/code'));

	gulp.watch(srcFiles, watchOpts, ['src']);
});

// 'code/**/*.js'

gulp.task('defs', () => {
	gulp.src('./defs/*.json5')
		.pipe(gulp.dest('./build/defs'));

	gulp.watch('./defs/*.json5', watchOpts, ['defs']);
});

gulp.task('infra', () => {
	gulp.src('./package.json')
		.pipe(gulp.dest('./build'));

	gulp.watch('./package.json', watchOpts, ['infra']);
});

gulp.task('default', ['src','defs','infra',], () => {
});
