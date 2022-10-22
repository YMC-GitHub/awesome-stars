// Parameters:
// Headers
// Path parameters
// Body  parameters
// response status codes:

/**
 * @typedef {object} donwloadOption
 * @property {string?} url - download from
 * @property {string?} targetFile
 * @property {boolean?} overideTargetFile
 * @property {()=>{}} cutomRequest
 */


 
/**
 * @typedef {object} showProgressOption
 * @property {boolean?} showProgress
 */

/**
 * @typedef {object} httpReqOption
 * @property {object?} data
 */

/**
 * @typedef {donwloadOption|showProgressOption|httpReqOption} donwloadFileOption
 */

/** @typedef {{url:string,file:string,name:string}} targetItem */
/** @typedef {targetItem[]} targets */
/** @typedef {string[]} urlmap */
/** @typedef  {string} targetFile*/


/** @typedef {{response:object,targetFile:string,stream?:object,resolve:Promise.resolve,data:string}} saveFileThroughStreamOption */
/** @typedef {{file:string,cur:number,len:number,total:number}} showProgressNextOption */

/** @typedef {[string,string][]} proxyDomainMap */

/** @typedef {{prefix:string}} urlToDesOption */

/** @typedef {{linkKeyAndVal:string,span:string}} pathParamTransferOption */

/** @typedef {{noAutoCamelize?:boolean,slim?:boolean,mode?:string,modeStyle:string}} getBuiltinFlagsOption */
/** @typedef {{noAutoCamelize?:boolean,slim?:boolean}} camelizeFlagsOption */

// [jsdoc:mport typedef from another file](https://github.com/jsdoc/jsdoc/issues/1537)
// [jsdoc:how to extend a typedef parameter](https://github.com/jsdoc/jsdoc/issues/1199)