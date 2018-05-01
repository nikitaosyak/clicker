let env = require('dotenv').config()
const gulp = require('gulp')
const sequence = require('gulp-sequence')
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
    const rimraf = require('rimraf')
    if (fs.existsSync('build/')) {
        rimraf.sync('build')
    }

    if (fs.existsSync('inter/')) {
        rimraf.sync('inter')
    }

    if (fs.existsSync('src/lib/tweenlite-gen.lib.js')) {
        rimraf.sync('src/lib/tweenlite-gen.lib.js')
    }
    if (fs.existsSync('src/lib/tweenlite-gen.lib.min.js')) {
        rimraf.sync('src/lib/tweenlite-gen.lib.min.js')
    }

    // generate ENV
    let buff = 'export const ENV = {\n'
    if (process.env.MODE === 'production') {
        buff += '  init: () => { window.ENV = ENV; console.log = () => {} },\n'
    } else {
        buff += '  init: () => { window.ENV = ENV },\n'
    }
    Object.keys(env.parsed).forEach(k => {
        if (/\D/.test(env.parsed[k])) {
            buff += `  ${k} : '${env.parsed[k]}',\n`
        } else {
            buff += `  ${k} : ${env.parsed[k]},\n`
        }
    })
    fs.writeFileSync('./src/js/ENV.js', buff + '}')

    if (env.parsed.MODE !== 'development') {
        return gulp.src('src/js/**/*.js')
            .pipe(require('gulp-modify-file')((content, path) => {
                if (/.*debugManager\.js$/.test(path)) return '/*nothing to see here*/'
                return content.replace(/^.*debug.*$/gmi, '')
            }))
            .pipe(gulp.dest('inter/'))
    }
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

gulp.task('step3-process-images', ['step2-webpack'], () => {
    process.chdir('./assets')
    const fs = require('fs')
    let digest = []
    const iterateFolder = path => {
        fs.readdirSync(path).forEach(f => {
            if (fs.lstatSync(`${path}/${f}`).isDirectory()) {
                iterateFolder(`${path}/${f}`)
            } else {
                const relativePath = `${path}/${f}`.replace(process.cwd(), '').slice(1)
                const loadPath = `assets/${relativePath}`
                const alias = relativePath.replace('/', '_').replace(/(\.jpg$|\.png$)/, '')
                digest.push({alias: alias, path: loadPath})
            }
        })
    }
    iterateFolder(process.cwd())
    process.chdir('..')
    fs.mkdirSync('build/assets')
    fs.writeFileSync('build/assets/digest.json', JSON.stringify({images: digest}, null, 2))

    return gulp.src('assets/**/*').pipe(gulp.dest('build/assets'))
})

gulp.task('step4-process-tweenlite', ['step3-process-images'], () => {

    const stream = gulp.src(['src/lib/tween/TweenLite.js', 'src/lib/tween/plugins/*.js'])
    const concat = require('gulp-concat')

    if (process.env.MODE === 'development') {
        return stream
            .pipe(concat('tweenlite-gen.lib.js'))
            .pipe(gulp.dest('src/lib'))
    } else {
        return stream
            .pipe(concat('tweenlite-gen.lib.min.js'))
            .pipe(require('gulp-uglify')())
            .pipe(gulp.dest('src/lib'))
    }
})

gulp.task('finish-deploy', ['step4-process-tweenlite'], () => {

    require('fs').copyFileSync('src/index.html', 'build/index.html')

    //
    // concat and put libraries
    const concat = require('gulp-concat')
    if (process.env.MODE === 'development') {
        const sourcemaps = require('gulp-sourcemaps')
        return gulp.src([
            'src/lib/*.lib.js'
            // 'src/lib/fullscreen-api-polyfill.lib.js',
            // 'src/lib/stats.lib.js',
            // 'src/lib/tweenjs.lib.js',
            // 'src/lib/pixi.lib.js',
            // 'src/lib/fairygui.lib.js',
        ])
            .pipe(sourcemaps.init())
            .pipe(concat('libraries.js'))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('build'))
    } else {
        return gulp.src([
            'src/lib/*.lib.min.js'
            // 'src/lib/fullscreen-api-polyfill.lib.min.js',
            // 'src/lib/tweenjs.lib.min.js',
            // 'src/lib/pixi.lib.min.js',
            // 'src/lib/fairygui.lib.min.js'
        ])
            .pipe(concat('libraries.js'))
            .pipe(gulp.dest('build'))
    }
})

gulp.task('reload', () => {
    return gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => {
    gulp.watch(['src/js/**/*', 'assets/**/*'], e => {
        sequence('finish-deploy', 'reload')(e => {
            if (e) console.error(e)
        })
    })
})
gulp.task('default', () => {
    sequence('connect', 'finish-deploy', 'watch')(e => {
        if (e) console.error(e)
    })
})