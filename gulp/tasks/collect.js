var gulp   = require('gulp');
var glob   = require('glob');
var path   = require('path');
var fs     = require('fs');
var gutil  = require('gulp-util');
var config = require('../config');
var chalk  = require('chalk');


/**
 * Collect extensions styles looking in modules with name matching mozaik-ext-*
 */
gulp.task('collect:styles', function (done) {
    gutil.log(chalk.green('Collecting extensions styles'));

    var files = glob.sync(config.root + 'node_modules/mozaik-ext-*/styl/index.styl');

    glob.sync(config.src + '/styl/index.styl').forEach( function(file){
    	files.push( file );
	});

    var lines = [
        '/**',
        ' * This file is generated by gulp collect:styl task, do not edit',
        ' */'
    ];

    files.forEach(function (file) {
        lines.push('@require "' + path.relative(config.mozaikSrc + 'ext', file) + '";');
    });

    fs.writeFile(config.mozaikSrc + 'ext/collected.styl', lines.join('\n'), function (err) {
        if (err) {
            throw err;
        }
    });

    done();
});