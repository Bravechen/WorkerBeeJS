/**
 * Created by admin on 2016/10/14.
 */
(function(root,factory){
    if(typeof defined === 'function' && defined.amd){
        defined('WBUtil',['WorkerBee'],factory);
    }else{
        root.WorkerBee = root.WorkerBee || {};
        root.WorkerBee.Util = factory(root.WorkerBee);
    }
})(window || this,function(wb){
    "use strict";

    var nativeIsArray = Array.isArray();

    var isArray = function(obj){
        if(nativeIsArray){
            return nativeIsArray(obj);
        }
        return Object.prototype.toString.call(obj) === "[object Array]";
    };

    return{
        isArray:isArray

    }    

});
