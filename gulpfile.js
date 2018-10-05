var gulp = require('gulp');

var paths = {
  baseScss: './projects/ng-sq-ui/src/lib/styles/*.scss',
  inputCoreLogic: './projects/ng-sq-ui/src/lib/shared/entities/*.ts',
  projects: {
    sqUi: {
      mainStylesheet: './projects/ng-sq-ui/src/lib/sq-ui-theme.scss',
      styles: './projects/ng-sq-ui/src/lib/styles/',
      destRoot: './dist/ng-sq-ui/'
    },
    sqDatetime: {
      sharedLogic: './projects/ng-datetime-picker/src/lib/shared/',
      styles: './projects/ng-datetime-picker/src/lib/styles/',
      destRoot: './dist/ng-datetime-picker/'
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


