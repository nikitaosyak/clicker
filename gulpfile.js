require('dotenv').config()
const gulp = require('gulp')
const connect = require('gulp-connect')

gulp.task('connect', () => {
    return connect.server({
        host: process.env.HOST,
        root: 'build/',
        port: process.env.PORT,
        livereload: true
    })
})

gulp.task('clean', () => gulp.src('build/', {read: false})
    .pipe(require('gulp-clean')()))

gulp.task('pack', ['clean'], () => {
    const stream = require('webpack-stream')
    const webpack2 = require('webpack')

    const config = {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|.*\.lib.*js$)/,
                    loader: 'babel-loader',
                    query: { presets: ['env']}
                }
            ]
        },
        output: { filename: 'bundle.js' },
        mode: process.env.MODE
    }
    if (process.env.MODE === 'development') {
        config.devtool = 'source-map'
    }

    return gulp.src('src/js/**/*.js')
        .pipe(stream(config, webpack2))
        .pipe(gulp.dest('build/'))
})

gulp.task('deploy-static', ['clean'], () => {
    gulp.src(['src/index.html']).pipe(gulp.dest('build'))

    const concat = require('gulp-concat')
    if (process.env.MODE === 'development') {
        const sourcemaps = require('gulp-sourcemaps')
        return gulp.src(['src/lib/**/*lib.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('libraries.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('build'))
    }
    if (process.env.MODE === 'production') {
        return gulp.src(['src/lib/**/*lib.min.js'])
            .pipe(concat('libraries.js'))
            .pipe(gulp.dest('build'))

    }
})

gulp.task('deploy', ['clean', 'pack', 'deploy-static'], () => {
    return gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => gulp.watch(['src/**/*'], ['deploy']))
gulp.task('default', ['connect', 'deploy', 'watch'])