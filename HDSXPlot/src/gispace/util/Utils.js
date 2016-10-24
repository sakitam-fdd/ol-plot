
P.Utils = {
    _stampId: 0
};

P.Utils.trim = function(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

P.Utils.stamp = function(obj) {
    var key = '_p_id_';
    obj[key] = obj[key] || this._stampId++;
    return obj[key];
};
