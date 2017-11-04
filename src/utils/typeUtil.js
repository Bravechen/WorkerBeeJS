import WBPolyFill from '../polyfill/polyfill.js'
//==============================================
const typeList = "Array|Object|Function|Boolean|Symbol|RegExp|Date|Number|String|Null|Undefined".split('|');
const toString = Object.prototype.toString;
let classType = {};
typeList.forEach(function(item,index){
  classType[`[object ${item}]`] = item;
});

/**
 * 返回对象类型
 * @param {*} obj 
 */
function type(obj){
  return classType[toString.call(obj)];
}

//============================================
const nativeIsArray = Array.isArray();
let isArray = nativeIsArray || function(list){
  return type(list) === 'Array';
};
//============================================
let isNumberic = function(obj){
  return obj - parseFloat(obj) >= 0;
}
//============================================
let isFunction = function(fn){
  return type(fn) === 'Function';
}
//============================================
let isWindow = function(obj){
  let reg = /^\[object (?:Window|DOMWindow|global)\]$/;
  return reg.test(toString.call(obj));
}
//============================================
export default {
  type,
  isArray,
  isNumberic,
  isFunction,
  isWindow,
};
