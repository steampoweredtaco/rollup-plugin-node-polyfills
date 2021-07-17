// @ts-ignore
import inject from 'rollup-plugin-inject';
import { builtinsResolver } from './modules';
import { dirname, relative } from 'path';
import { randomBytes } from 'crypto';
export default function (opts = {}) {
    const injectPlugin = inject({
        include: opts.include === undefined ? 'node_modules/**/*.js' : undefined,
        exclude: opts.exclude,
        sourceMap: opts.sourceMap,
        modules: {
            'process': 'process',
            'Buffer': ['buffer', 'Buffer'],
            'global': GLOBAL_PATH,
            '__filename': FILENAME_PATH,
            '__dirname': DIRNAME_PATH,
        }
    });
    const basedir = opts.baseDir || '/';
    const dirs = new Map();
    const resolver = builtinsResolver(opts);
    return {
        name: 'node-polyfills',
        resolveId(importee, importer) {
            if (importee === DIRNAME_PATH) {
                const id = getRandomId();
                dirs.set(id, dirname('/' + relative(basedir, importer)));
                return { id, moduleSideEffects: false };
            }
            if (importee === FILENAME_PATH) {
                const id = getRandomId();
                dirs.set(id, dirname('/' + relative(basedir, importer)));
                return { id, moduleSideEffects: false };
            }
            return resolver(importee);
        },
        load(id) {
            if (dirs.has(id)) {
                return `export default '${dirs.get(id)}'`;
            }
        },
        transform(code, id) {
            return injectPlugin.transform.call(this, code, id);
        }
    };
}
function getRandomId() {
    return randomBytes(15).toString('hex');
}
const GLOBAL_PATH = require.resolve('../polyfills/global.js');
const DIRNAME_PATH = '\0node-polyfills:dirname';
const FILENAME_PATH = '\0node-polyfills:filename';
