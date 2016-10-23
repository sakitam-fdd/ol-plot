
var P = {
    version: "1.0.0"
};

function expose() {
    var old = window.P;

    P.noConflict = function () {
        window.P = old;
        return this;
    };

    window.P = P;
}

// define P for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = P;

// define P as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(P);
}

// define gispace as a global P variable, saving the original P to restore later if needed
if (typeof window !== 'undefined') {
    expose();
}