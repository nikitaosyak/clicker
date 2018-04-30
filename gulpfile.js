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

gulp.task('step1-prepare-files', () => {
    // clean build
    const fs = require('fs')
    if (fs.existsSync('build/')) {
        require('rimraf').sync('build')
    }

    if (fs.existsSync('inter/')) {
        require('rimraf').sync('inter')
    }

    // generate ENV
    let buff = 'export const ENV = {\n'
    if (process.env.MODE === 'production') {
        buff += '  init: () => { console.log = () => {} },\n'
    } else {
        buff += '  init: () => {},\n'
    }
    Object.keys(env.parsed).forEach(k => {
        if (/\D/.test(env.parsed[k])) {
            buff += `  ${k} : '${env.parsed[k]}',\n`
        } else {
            buff += `  ${k} : ${env.parsed[k]},\n`
        }
    })
    fs.writeFileSync('./src/js/ENV.js', buff + '}')

    const srcList = ['src/js/**/*.js']
    return gulp.src(srcList)
        .pipe(require('gulp-modify-file')((content, path) => {
            if (process.env.MODE !== 'development') {
                if (/.*debugManager\.js$/.test(path)) return '/*nothing to see here*/'
                return content.replace(/^.*debug.*$/gmi, '')
            }
            return content
        }))
        .pipe(gulp.dest('inter/'))
})

gulp.task('step2-webpack', ['step1-prepare-files'], () => {
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
        mode: 'development'
    }

    if (process.env.MODE === 'development') {
        config.devtool = 'source-map'
    }

    return gulp.src(process.env.mode === 'development' ? 'src/js/**/*' : 'inter/**/*')
        .pipe(stream(config, webpack2))
        .pipe(gulp.dest('build/'))
})

gulp.task('finish-deploy', ['step2-webpack'], () => {

    //
    // copy static assets
    const fs = require('fs')
    fs.copyFileSync('src/index.html', 'build/index.html')
    fs.mkdirSync('build/assets')
    fs.readdirSync('assets/').forEach(f => {
        fs.copyFileSync(`assets/${f}`, `build/assets/${f}`)
    })

    //
    // concat and put libraries
    const concat = require('gulp-concat')
    if (process.env.MODE === 'development') {
        const sourcemaps = require('gulp-sourcemaps')
        return gulp.src(['src/lib/**/*lib.js'])
            .pipe(sourcemaps.init())
            .pipe(concat('libraries.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('build'))
    } else {
        return gulp.src(['src/lib/**/*lib.min.js'])
            .pipe(concat('libraries.js'))
            .pipe(gulp.dest('build'))
    }
})

gulp.task('reload', ['finish-deploy'], () => {
    return gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => {
    gulp.watch(['src/**/*'], ['reload'])
})
gulp.task('default', ['connect', 'finish-deploy', 'watch'])