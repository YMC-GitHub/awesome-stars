// @ymc/extend-string
/* eslint-disable no-unused-vars,func-names */
// fix no-unused-vars test,expectString
/**
 *
 * @param {string} name
 * @param {()=>{}} handle
 */
 function extendStringPrototype(name, handle) {
    const tobeExtende = String.prototype
    if (!tobeExtende[name]) {
      // tobeExtende[name] = function(){return handle(this)}
      // function (...args){return padEndString(this,...args)}
      tobeExtende[name] = function (...args) {
        return handle(this, ...args)
      }
    }
    // String.prototype.humanize= function(){return humanize(this)}
  }
  
  /**
   *
   * @param {*} s
   * @returns {string}
   * @sample
   * ```
   * humanize('per_page')// Per page
   * humanize('per-page')// Per page
   * ```
   * @description
   * ```
   * ## idea
   * - [x] replace multi - or _ to one space
   * - [x] add space to the char that is uppercase and is not the first index
   * - [x] the first char to upper ,other lowercase
   * ```
   */
  function humanize(s) {
    return s
      .replace(/(?:^\w|[A-Z_-]|\b\w)/g, (word, index) => {
        let res = ''
        // log(word, index); //desc: for debug
        // feat: replace multi - or _ to one space
        res = word.replace(/[-_]+/g, ' ')
        // feat: add space to the char that is uppercase and is not the first index
        res = index !== 0 ? res.replace(/[A-Z]/, ' $&') : res
        // feat: the first char to upper ,other lowercase
        return index === 0 ? res.toUpperCase() : res.toLowerCase()
      })
      .replace(/\s+/g, ' ')
  }
  
  function slugify(s) {
    return humanize(s)
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toLowerCase())
      .replace(/\s+/g, '-')
  }
  
  function camelize(s) {
    return humanize(s)
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
      .replace(/\s+/g, '')
  }
  
  function underscoped(s) {
    return humanize(s)
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toLowerCase())
      .replace(/\s+/g, '_')
  }
  
  function classify(s) {
    return humanize(s)
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => word.toUpperCase())
      .replace(/\s+/g, '')
  }
  
  function swapCase(s) {
    return s.replace(/(?:^\w|[A-Z-a-z]|\b\w)/g, (word, index) => {
      if (/[A-Z]/.test(word)) {
        return word.toLowerCase()
      }
      return word.toUpperCase()
    })
  }
  
  /**
   * the first char to upper case (only the first word)
   * @param {*} s
   * @returns
   */
  function capitialize(s) {
    return s.replace(/(?:^\w|[A-Z-a-z]|\b\w)/g, (word, index) => (index === 0 ? word.toUpperCase() : word))
  }
  
  /**
   * make the firt char to upper (only the first word) , other lower
   * @param {*} s
   * @returns
   */
  function sentence(s) {
    return s.replace(/(?:^\w|[A-Z-a-z]|\b\w)/g, (word, index) => (index === 0 ? word.toUpperCase() : word.toLowerCase()))
  }
  
  /**
   * make the firt char to upper(for each word), other lower
   * @param {string|ctx} s
   * @returns
   */
  function titleize(s) {
    return s.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  }
  
  function padStartString(number, len = 0, prefix = ' ') {
    if (number.length >= len) {
      return String(number)
    }
    return padStartString(prefix + number, len, prefix)
  }
  
  function padEndString(number, len = 0, prefix = ' ') {
    if (number.length >= len) {
      return String(number)
    }
    return padEndString(number + prefix, len, prefix)
  }
  
  // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
  // https://www.zhangxinxu.com/wordpress/2018/07/js-padstart-padend/
  // function padEndString (s,targetLength, padString) {
  //     console.log(s,targetLength, padString)
  //     targetLength = targetLength >> 0;
  //     padString = String((typeof padString !== 'undefined' ? padString : ' '));
  //     if (s.length > targetLength || padString === '') {
  //         return String(s);
  //     }
  //     targetLength = targetLength - s.length;
  //     if (targetLength > padString.length) {
  //         padString += padString.repeat(targetLength / padString.length);
  //     }
  //     return String(s) + padString.slice(0, targetLength);
  // };
  // String.prototype.padEndString = function (...args){return padEndString(this,...args)}
  
  export {
    extendStringPrototype,
    humanize,
    slugify,
    slugify as dasherize,
    camelize,
    underscoped,
    classify,
    swapCase,
    capitialize,
    sentence,
    titleize,
    padStartString,
    padStartString as padStart,
    padEndString,
    padEndString as padEnd
  }
  
  // node lib/extend-string.js
  