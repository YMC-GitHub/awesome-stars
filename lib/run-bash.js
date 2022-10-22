import { exec } from 'node:child_process';

/**
 * opt to str-format
 * @description
 * ```
 * arr to str
 * ```
 * @param {string|string[]} cmdOptStr some cmd opt str-format or arr-format
 * @param {string} [splitChar=' '] some string
 * @returns {string}
 */
const cmdOptArr2cmdOptStr = (cmdOptStr, splitChar = ' ') => (Array.isArray(cmdOptStr) ? cmdOptStr.join(splitChar) : cmdOptStr);

/**
 *
 * @param {{decode:function}} iconv
 * @param {{}} execOpts
 * @sample
 * ```
 * import iconv from "iconv-lite";
 * setExecOptsForIconv(iconv,execOpts)
 * await exec(`dir`, execOpts);
 * ```
 */
const setExecOptsForIconv = (iconv, execOpts) => {
  // std 1.1 set execOpts.encoding as 'binary' || 'buffer'
  execOpts.encoding = 'buffer'; // binary || buffer
  // std 1.2 def fixUnreadbleCode(code,desencoding,srcencoding)
  execOpts.iconvDesEncoding = 'cp936';
  execOpts.iconvSrcEncoding = 'binary';
  // execOpts.fixUnreadbleCode = fixUnreadbleCode;
  execOpts.fixUnreadbleCode = defFixUnreadbleCode(iconv);
  // res = await exec(`dir`, execOpts);
};

/**
 *
 * @param {{decode:function}} iconv
 * @returns {function}
 * @sample
 * ```
 *  import iconv from "iconv-lite";
 *  let fixUnreadbleCode = defFixUnreadbleCode(iconv)
 *  execOpts.encoding = "buffer";
 *  execOpts.fixUnreadbleCode = fixUnreadbleCode;
 *  execOpts.iconvDesEncoding="cp936"
 *  execOpts.iconvSrcEncoding="binary"
 *  await exec(`dir`, execOpts);
 * ```
 */
const defFixUnreadbleCode = (iconv) => (code, encoding = 'cp936', binaryEncoding = 'binary') => {
  iconv.skipDecodeWarning = true;
  return iconv.decode(Buffer.from(code, binaryEncoding), encoding);
};

function trimstdout(stdout) {
  return stdout
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => v)
    .join('\n');
}
/**
 * exec wraper
 * @param {string} cmd some cmd
 * @param {object} cmdOpts some cmd opts
 * @param {object} execOpts some exec opts
 * @returns {Promise}
 * @sample
 * ```js
 * await exec(`git`,`--version`,execOpts) //correct
 * await exec(`git`,[`--version`],execOpts) //correct
 * await exec(`git --version`,execOpts) //correct
 * ```
 */
const execWraper = (cmd, cmdOpts, execOpts) => new Promise((resolve, reject) => {
  // desc: for exec(`git --version`],execOpts)
  if (!execOpts) {
    execOpts = cmdOpts;
    cmdOpts = cmd;
    cmd = '';
  }

  const option = cmdOptArr2cmdOptStr(cmdOpts); // desc: other yuyi to string
  // let { exec } = execOpts //eg:{exec}=require("child_process");
  // fix: exec is optional in execOpts
  const run = execOpts.exec ? execOpts.exec : exec;
  cmd = cmd ? `${cmd} ${option}` : `${option}`;
  // cmd=`${cmd} ${option}`.trimStart()

  // delete execOpts.exec; //desc:clean some property to keep execOpts as native

  // support exe opt : exec(cmd,execOpts,callback)
  // https://stackoverflow.com/questions/18894433/nodejs-child-process-working-directory
  run(`${cmd}`, execOpts, (e, stdout, stderr) => {
    // feat:fix unreadable zh code\with option.fixUnreadbleCode
    const { fixUnreadbleCode } = execOpts;
    if (fixUnreadbleCode) {
      const { iconvDesEncoding, iconvSrcEncoding } = execOpts;
      // fix: convert unreadble code only with code
      // fixUnreadbleCode=(code,charset="cp936")=>{return iconv.decode(err, charset)})
      // if (e) e = fixUnreadbleCode(e, iconvDesEncoding, iconvSrcEncoding)//del
      if (stdout) stdout = fixUnreadbleCode(stdout, iconvDesEncoding, iconvSrcEncoding);
      if (stderr) stderr = fixUnreadbleCode(stderr, iconvDesEncoding, iconvSrcEncoding);
      // console.log(e, stdout, stderr)
    }

    // feat: set reject err to be optional\nwhen execOpts.exitWhenErr=true
    if (e && execOpts.exitWhenErr) {
      reject(e);
    }
    // feat(core): trim stdout and stderr \ndo not trim when execOpts.noTrimOut=true
    if (!execOpts.noTrimOut) {
      stdout = trimstdout(stdout);
      stderr = trimstdout(stderr);
    }

    // case:reject std err and resolve std res
    // feat(core): set reject stderr to be optional in execOpts\nreject when execOpts.rejectStderr=true
    if (execOpts.rejectStderr) {
      if (stderr) {
        reject(e);
      }
      resolve(stdout);
    }
    // case:resolve std err and res
    resolve({ stdout, stderr });
  });
});

const execOpts = {
  exec,
};

export {
  defFixUnreadbleCode, execWraper as exec, execOpts, setExecOptsForIconv,
};
