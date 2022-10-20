function renderTpl(tpl = "", menifest) {
    let res = tpl;
    let name;
    let suffix;
    Object.keys(menifest).forEach((key) => {
        const value = menifest[key];
        res = res.replace(new RegExp(`{${key}}`, "ig"), value);
    });
    return res;
}
/**
 *
 * @param {string} tpl
 * @param {{}} data
 * @returns {string|function({}):string}
 * @sample
 * ```
 * writeTpl('{method} repo/owner',{method:'POST'}) //POST repo/owner
 * ```
 */
function writeTpl(tpl, data) {
    if (data) {
        return renderTpl(tpl, data);
    }
    return (v) => renderTpl(tpl, v);
}

export {renderTpl,writeTpl}