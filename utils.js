
var beautifyJS = require('js-beautify').js

function camelize(text) {
    return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();        
    });
}

function beautify(data){
    return beautifyJS(data, {  brace_style:"collapse-preserve-inline"})
}

module.exports = {
    camelize,
    beautify
}

