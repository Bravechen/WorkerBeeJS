import WBPolyfill from '../polyfill/polyfill.js';
//===============================================
let nativeAssign = Object.assign || WBPolyfill.assign;
//===============================================
function clone(){

}

function plainClone(){

}
//===============================================
export default {
  clone,
  plainClone,
};