import gulp from "gulp";
import watch from "gulp-watch";
import fileinclude from "gulp-file-include";
import { geral } from "./src/includes/geral.js";
import purgecss from "gulp-purgecss";
import concat from "gulp-concat";
import cleancss from "gulp-clean-css";
import imagemin, { mozjpeg } from "gulp-imagemin";
import webp from "gulp-webp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import htmlmin from "gulp-htmlmin";
import rename from "gulp-rename";
import replace from "gulp-replace";
import keywords from "./src/includes/keywords.json?type=json" assert { type: "json" };
const sass = gulpSass(dartSass);

const getFileLink = (title) => {
  const stopWords = [
    "e",
    "ou",
    "mas",
    "para",
    "em",
    "com",
    "de",
    "do",
    "da",
    "no",
    "na",
    "um",
    "uma",
    "os",
    "as",
    "um",
    "uma",
    "se",
    "que",
    "por",
  ];
  const regex = new RegExp(`\\b(${stopWords.join("|")})\\b`, "gi");

  return `${title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(regex, "")
    .replace(/\s+/g, "-")}`;
};

const fileincludeConfig = {
  prefix: "@@",
  basepath: "@file",
  context: {
    ...geral
  },
  ident: true,
};

gulp.task("html", function () {
  return gulp
    .src(["src/*.html","!src/blog.html"])
    .pipe(fileinclude(fileincludeConfig))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest("dist"));
});

gulp.task("robots", function () {
  return gulp
    .src(["src/robots.txt", "src/sitemap.xml", "src/CNAME"])
    .pipe(fileinclude(fileincludeConfig))
    .pipe(gulp.dest("dist"));
});

gulp.task("sass", function () {
  return gulp
    .src(["src/scss/*.scss"])
    .pipe(sass().on("error", sass.logError))
    .pipe(
      purgecss({
        content: ["src/**/*.html"],
        safelist: {
          deep: [/^col/, /^row/, /^container/, /^accordion/, /ˆtext/],
        },
      })
    )
    .pipe(concat("main.css"))
    .pipe(gulp.dest("dist/css"));
});

gulp.task("minify", function () {
  return gulp
    .src("dist/css/main.css")
    .pipe(
      cleancss({ compatibility: "ie8", level: { 1: { specialComments: 0 } } })
    )
    .pipe(gulp.dest("dist/css"));
});

gulp.task("images", function () {
  return gulp
    .src("src/images/*")
    .pipe(imagemin([mozjpeg({ quality: 90 })]))
    .pipe(gulp.dest("dist/images"));
});

gulp.task("webp-images", function () {
  return gulp
    .src("dist/images/*")
    .pipe(
      webp({
        quality: 90,
      })
    )
    .pipe(gulp.dest("dist/images/webp"));
});

gulp.task("keywords", function (done) {
  const getReadTime = (text) => {
    const wordsCount = text.split(/\s+/).length;
    const time = wordsCount / 200;
    return Math.round(time);
  };
  const tasks = keywords.map((keyword) => {
    return function keywordTask(cb) {
      const shuffledKeywords = keywords.sort((a,b) => 0.5 - Math.random());
      return gulp
        .src("src/_modelo/keyword.html")
        .pipe(
          fileinclude({
            ...fileincludeConfig,
            context: {
              ...geral,
              ...keyword,
              minutes: getReadTime(keyword.keywordcontent),
              keywords: shuffledKeywords.slice(0, 6)
            },
          })
        )
        .pipe(
          replace(/@@link\(.*\)/g, function (match) {
            return getFileLink(match.replace("@@link(", "").slice(0, -1));
          })
        )
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(rename(`${getFileLink(keyword.title)}.html`))
        .pipe(gulp.dest("dist"))
        .on("end", cb);
    };
  });

  return gulp.series(...tasks, function seriesCallback(seriesDone) {
    seriesDone();
    done();
  })();
});

gulp.task("blog-pagination", function (done) {
  const pagesLength = Array.from(Array(Math.round(keywords.length / 10)));
  const tasks = pagesLength.map((_, index) => {
    const partialKeywords = keywords.slice(index * 10, index * 10 + 10);
    
    return function blogPagination(cb) {
      return gulp
        .src("src/blog.html")
        .pipe(
          fileinclude({
            ...fileincludeConfig,
            context: {
              ...fileincludeConfig.context,
              keywords: partialKeywords,
              page: index + 1,
              pagesLength: pagesLength.length + 1,
              minPage: index - 2,
              maxPage: index + 4,
              prevPage: index > 0 ? index === 1 ? 'blog' : `blog-${index}` : null,
              nextPage: (index + 1) < (pagesLength.length) ? `blog-${index + 2}` : null
            },
          })
        )
        .pipe(
          replace(/@@link\(.*\)/g, function (match) {
            return getFileLink(match.replace("@@link(", "").slice(0, -1));
          })
        )
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(rename(`blog${index === 0 ? "" : "-" + (index + 1)}.html`))
        .pipe(gulp.dest("dist"))
        .on("end", cb);
    };
  });

  return gulp.series(...tasks, function seriesCallback(seriesDone) {
    seriesDone();
    done();
  })();
});

gulp.task("js", function () {
  return gulp.src("src/**/*.js").pipe(gulp.dest("dist"));
});

gulp.task("watch", function () {
  watch(
    ["src/**/*.js", "src/**/*.scss", "src/**/*.html"],
    gulp.series(
      gulp.parallel("sass", "js"),
      gulp.parallel("html", "keywords"),
      "blog-pagination"
    )
  );
  watch(["src/images/*"], gulp.series("images", "webp-images"));
});

gulp.task(
  "default",
  gulp.series(
    "sass",
    "minify",
    "images",
    "webp-images",
    "js",
    "html",
    "robots",
    "keywords",
    "blog-pagination"
  )
);
