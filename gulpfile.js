const env = require('dotenv').config()
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

gulp.task('clean', () => {
    return gulp.src([
        'build/', 'src/js/ENV.js'
    ], {read: false})
        .pipe(require('gulp-clean')())
})

gulp.task('gen-env', ['clean'], () => {
    let buff = 'export const ENV = {\n'
        // '  init: () => {' +
        // (process.env.MODE === 'production' ? '\n    console.log = () => {}\n' : '') +
        // '  },\n'
    Object.keys(env.parsed).forEach(k => {
        if (/\D/.test(env.parsed[k])) {
            buff += `  ${k} : '${env.parsed[k]}',\n`
        } else {
            buff += `  ${k} : ${env.parsed[k]},\n`
        }
    })
    return require('fs').writeFileSync('./src/js/ENV.js', buff + '}')
})

gulp.task('pack', ['clean', 'gen-env'], () => {
    const stream = require('webpack-stream')
    const webpack2 = require('webpack')

    const config = {
        module: {
            rules: [
                {
                    test: /\.js$/,
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
    if (process.env.MODE === 'production') {
        config.module.rules[0].exclude = /.*\.debug\.js$/
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

gulp.task('reload', ['clean', 'pack', 'deploy-static'], () => {
    return gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => gulp.watch(['src/**/*.js'], ['reload']))
gulp.task('default', ['connect', 'reload', 'watch'])