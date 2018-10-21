var gulp = require('gulp');

var paths = {
  baseScss: './projects/ng-sq-ui/src/lib/styles/*.scss',
  inputCoreLogic: './projects/ng-sq-ui/src/lib/shared/entities/',
  projects: {
    sqUi: {
      mainStylesheet: './projects/ng-sq-ui/src/lib/sq-ui-theme.scss',
      styles: './projects/ng-sq-ui/src/lib/styles/',
      destRoot: './dist/ng-sq-ui/',
      readMe: './projects/ng-sq-ui/src/README.md'
    },
    sqDatetime: {
      sharedLogic: './projects/ng-datetime-picker/src/lib/shared/',
      styles: './projects/ng-datetime-picker/src/lib/styles/',
      destRoot: './dist/ng-datetime-picker/',
      readMe: './projects/ng-datetime-picker/src/README.md'
    }
  }
};

function copyInputCoreLogicForDatetimeModule() {
  return gulp.src(paths.inputCoreLogic)
    .pipe(gulp.dest(paths.projects.sqDatetime.sharedLogic));
}

function copyMainStylesheetForForNgSqUiPackage() {
  return gulp.src(paths.projects.sqUi.mainStylesheet)
    .pipe(gulp.dest(paths.projects.sqUi.destRoot));
}

function copyReadmeForNgSqUiPackage() {
  return gulp.src(paths.projects.sqUi.readMe)
    .pipe(gulp.dest(paths.projects.sqUi.destRoot));
}

function copyReadmeForDatetimePackage() {
  return gulp.src(paths.projects.sqDatetime.readMe)
    .pipe(gulp.dest(paths.projects.sqDatetime.destRoot));
}

function copyStylesForDatetimePackage() {
  return gulp.src(paths.projects.sqDatetime.styles + '**/*')
    .pipe(gulp.dest(paths.projects.sqDatetime.destRoot + 'styles'));
}

function copyStylesForNgSqUiPackage() {
  return gulp.src(paths.projects.sqUi.styles + '**/*')
    .pipe(gulp.dest(paths.projects.sqUi.destRoot + 'styles'));
}

gulp.task('prepare-datetime', gulp.series(copyInputCoreLogicForDatetimeModule));
gulp.task('transfer-styles-to-dest', gulp.parallel(copyMainStylesheetForForNgSqUiPackage, copyStylesForNgSqUiPackage, copyStylesForDatetimePackage));
gulp.task('copy-readme-files', gulp.parallel(copyReadmeForNgSqUiPackage, copyReadmeForDatetimePackage));
gulp.task('copy-files-for-packages', gulp.parallel('copy-readme-files', 'transfer-styles-to-dest'));


