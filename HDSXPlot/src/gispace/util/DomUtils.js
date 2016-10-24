
P.DomUtils = {};

P.DomUtils.create = function(tagName, className, parent, id) {
    var element = document.createElement(tagName);
    element.className = className || '';
    if(id){
        element.id = id;
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
};

P.DomUtils.createHidden = function(tagName, parent, id) {
    var element = document.createElement(tagName);
    element.style.display = 'none';
    if(id){
        element.id = id;
    }
    if(parent){
        parent.appendChild(element);
    }
    return element;
};

P.DomUtils.remove = function(element, parent) {
    if (parent && element) {
        parent.removeChild(element);
    }
};

P.DomUtils.get = function(id) {
    return document.getElementById(id);
};

P.DomUtils.getStyle = function(element, name) {
    var value = element.style[name];
    return value === 'auto' ? null : value;
};

P.DomUtils.hasClass = function(element, name) {
    return (element.className.length > 0) &&
        new RegExp('(^|\\s)' + name + '(\\s|$)').test(element.className);
};

P.DomUtils.addClass = function(element, name) {
    if (this.hasClass(element, name)) {
        return;
    }
    if (element.className) {
        element.className += ' ';
    }
    element.className += name;
};

P.DomUtils.removeClass = function(element, name) {
    element.className = P.Utils.trim((' ' + element.className + ' ').replace(' ' + name + ' ', ' '));
};

P.DomUtils.getDomEventKey = function(type, fn, context) {
    return '_p_dom_event_' + type + '_' + P.Utils.stamp(fn) + (context ? '_' + P.Utils.stamp(context) : '');
};

P.DomUtils.addListener = function(element, type, fn, context) {
    var self = this,
        eventKey = P.DomUtils.getDomEventKey(type, fn, context),
        handler = element[eventKey];

    if (handler) {
        return self;
    }

    handler = function(e) {
        return fn.call(context || element, e);
    };

    if ('addEventListener' in element) {
        element.addEventListener(type, handler, false);
    } else if ('attachEvent' in element) {
        element.attachEvent('on' + type, handler);
    }

    element[eventKey] = handler;
    return self;
};

P.DomUtils.removeListener = function(element, type, fn, context) {
    var self = this,
        eventKey = P.DomUtils.getDomEventKey(type, fn, context),
        handler = element[eventKey];

    if (!handler) {
        return self;
    }

    if ('removeEventListener' in element) {
        element.removeEventListener(type, handler, false);
    } else if ('detachEvent' in element) {
        element.detachEvent('on' + type, handler);
    }

    element[eventKey] = null;

    return self;
};