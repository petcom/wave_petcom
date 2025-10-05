const {series, parallel, watch, src, dest} = require('gulp');
const pump = require('pump');
const fs = require('fs');
const order = require('ordered-read-streams');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const zip = require('gulp-zip');
const { execSync } = require('child_process'); // <— new

// postcss plugins
const easyimport = require('postcss-easy-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

function serve(done) {
    livereload.listen();
    done();
}

function handleError(done) {
    return function (err) {
        if (err) beeper();
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    pump([
        src('assets/css/screen.css', {sourcemaps: true}),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function getJsFiles(version) {
    const jsFiles = [
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/lib/**/*.js`),
        src(`node_modules/@tryghost/shared-theme-assets/assets/js/${version}/main.js`),
    ];

    if (fs.existsSync(`assets/js/lib`)) {
        jsFiles.push(src(`assets/js/lib/*.js`));
    }

    jsFiles.push(src(`assets/js/main.js`));

    return jsFiles;
}

function js(done) {
    pump([
        order(getJsFiles('v1'), {sourcemaps: true}),
        concat('main.min.js'),
        uglify(),
        dest('assets/built/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

// Optional: run gscan and fail on errors
function scan(done) {
    try {
        execSync('npx --yes gscan@latest .', { stdio: 'inherit' });
        done();
    } catch (e) {
        done(new Error('gscan reported errors — fix before zipping.'));
    }
}

function zipper(done) {
    const pkg = require('./package.json');
    const filename = `${pkg.name}${pkg.version ? `-${pkg.version}` : ''}.zip`;

    pump([
        src([
            '**/*',

            // exclude clutter & build artifacts
            '!node_modules/**',
            '!dist/**',
            '!.git/**',
            '!.github/**',
            '!.vscode/**',

            // exclude misc junk
            '!**/.DS_Store',
            '!**/*.log',
            '!**/*.zip',

            // exclude source maps from the final theme zip
            '!**/*.map',

            // exclude lockfiles & local metadata
            '!**/yarn.lock',
            '!**/pnpm-lock.yaml',
            '!**/package-lock.json',

            // if you keep helper scripts locally, exclude them:
            '!scripts/**'
        ], {
            dot: true,
            encoding: false
        }),

        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const cssWatcher = () => watch('assets/css/**/*.css', css);
const jsWatcher = () => watch('assets/js/**/*.js', js);
const watcher = parallel(hbsWatcher, cssWatcher, jsWatcher);
const build = series(css, js);

// Keep your existing exports, but now you have an optional scan step:
exports.build = build;
// Run scan before zip if you want it to block on gscan:
// exports.zip = series(build, scan, zipper);
exports.zip = series(build, zipper);
exports.scan = scan;
exports.default = series(build, serve, watcher);
