var path = require('path');

var mainConfig = require( path.resolve(process.cwd(), 'config.js' ));
module.exports = {
    root:       path.resolve(process.cwd()) + path.sep,
    mozaikRoot: path.resolve(path.join(__dirname, '..')) + path.sep,
    src:        path.resolve(path.join(process.cwd(), mainConfig.src || 'src')) + path.sep,
    mozaikSrc:  path.resolve(path.join(__dirname, '..', 'src')) + path.sep,
    dest:       path.resolve(path.join(process.cwd(), 'build')) + path.sep
};