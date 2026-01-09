export const env = {};
export const platform = 'linux';
export const argv = [];
export const version = 'v20.0.0';
export const versions = { node: '20.0.0', modules: '100', openssl: '3.0.0' };
export const arch = 'x64';
export const cwd = () => '/';
export const nextTick = (cb, ...args) => setTimeout(cb, 0, ...args);
export const stdout = {
    write: (...args) => false,
    fd: 1
};
export const stderr = {
    write: (...args) => false,
    fd: 2
};
export const stdin = {
    read: () => null,
    fd: 0
};
export const pid = 1;
export const chdir = () => { };
export const exit = () => { };
export const kill = () => { };
export const title = 'node';

export default {
    env,
    platform,
    argv,
    version,
    versions,
    arch,
    cwd,
    nextTick,
    stdout,
    stderr,
    stdin,
    pid,
    chdir,
    exit,
    kill,
    title
};
