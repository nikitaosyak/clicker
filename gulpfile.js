let env = require('dotenv').config()
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

const prepend = () => {
    // clean build
    const fs = require('fs')
    if (fs.existsSync('build/')) {
        require('rimraf').sync('build')
    }

    // generate ENV
    let buff = 'export const ENV = {\n'
    Object.keys(env.parsed).forEach(k => {
        if (/\D/.test(env.parsed[k])) {
            buff += `  ${k} : '${env.parsed[k]}',\n`
        } else {
            buff += `  ${k} : ${env.parsed[k]},\n`
        }
    })
    fs.writeFileSync('./src/js/ENV.js', buff + '}')
}
gulp.task('pack', () => {
    prepend()

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

gulp.task('deploy', ['pack'], () => {
    require('fs').copyFileSync('src/index.html', 'build/index.html')

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

gulp.task('reload', ['deploy'], () => {
    return gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => {
    gulp.watch(['src/**/*'], ['reload'])
})
gulp.task('default', ['connect', 'deploy', 'watch'])