import gulp from 'gulp';
import watch from 'gulp-watch';
import fileinclude from 'gulp-file-include';
import {geral} from './src/includes/geral.js';
import purgecss from 'gulp-purgecss';
import concat from 'gulp-concat';
import cleancss from 'gulp-clean-css';
import imagemin, {mozjpeg} from 'gulp-imagemin';
import webp from 'gulp-webp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import htmlmin from 'gulp-htmlmin';
const sass = gulpSass(dartSass);

gulp.task('html', function () {
    return gulp.src(['src/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            context: geral
        }))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest('dist'));
});

gulp.task('robots', function() {
    return gulp.src(['src/robots.txt'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            context: geral
        }))
        .pipe(gulp.dest('dist'));
})

gulp.task('sass', function () {
    return gulp.src(['src/scss/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(purgecss({
        content: ['src/**/*.html'],
        safelist: {
            deep: [/^col/, /^row/, /^container/, /^accordion/, /ˆtext/]
        }
    }))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('minify', function () {
    return gulp.src('dist/css/main.css')
    .pipe(cleancss({ compatibility: 'ie8', level: { 1: { specialComments: 0 } } }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('images', function () {
    return gulp.src('src/images/*')
    .pipe(imagemin([
        mozjpeg({ quality: 90 })
    ]))
    .pipe(gulp.dest('dist/images'))
})

gulp.task('webp-images', function () {
    return gulp.src('dist/images/*')
    .pipe(webp({
        quality: 90
    }))
    .pipe(gulp.dest('dist/images/webp'));
})

gulp.task('js', function () {
    return gulp.src('src/**/*.js')
    .pipe(gulp.dest('dist'));
})

gulp.task('watch', function () {
    watch(['src/**/*.js', 'src/**/*.scss', 'src/**/*.html'], gulp.series('sass', 'js', 'html'));
    watch(['src/images/*'], gulp.series('images', 'webp-images'));
});

gulp.task('default', gulp.series('sass', 'minify', 'images', 'webp-images', 'js', 'html', 'robots'));