import WBPolyFill from '../polyfill/polyfill.js'
//==============================================
let nativeIsArray = Array.isArray();


//============================================
let isArray = nativeIsArray || WBPolyFill.isArray;
//============================================

export default {
  isArray,
};
