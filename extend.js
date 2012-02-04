// Based on yui2 yahoo Lang.js
Object.extend = function (subclass, superclass) {
    if (!superclass || !subclass) {
	throw new Error("extend failed, please check that all dependencies are included.");
    }
    var F = function () {};
    var i;
    F.prototype = superclass.prototype;
    subclass.prototype = new F();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype;
    if (superclass.prototype.constructor == Object.prototype.constructor) {
	superclass.prototype.constructor = superclass;
    }
};
