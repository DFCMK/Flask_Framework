"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigUnset = void 0;
const color_1 = require("@heroku-cli/color");
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const _ = require("lodash");
class ConfigUnset extends command_1.Command {
    async run() {
        const parsed = await this.parse(ConfigUnset);
        const { flags } = parsed;
        const argv = parsed.argv;
        const lastRelease = async () => {
            const { body: releases } = await this.heroku.get(`/apps/${flags.app}/releases`, {
                partial: true,
                headers: { Range: 'version ..; order=desc,max=1' },
            });
            return releases[0];
        };
        if (argv.length === 0) {
            this.error('Usage: heroku config:unset KEY1 [KEY2 ...]\nMust specify KEY to unset.');
        }
        const vars = argv.map(v => color_1.default.configVar(v)).join(', ');
        core_1.ux.action.start(`Unsetting ${vars} and restarting ${color_1.default.app(flags.app)}`);
        await this.heroku.patch(`/apps/${flags.app}/config-vars`, {
            // body will be like {FOO: null, BAR: null}
            body: _.reduce(argv, (vars, v) => {
                vars[v] = null;
                return vars;
            }, {}),
        });
        const release = await lastRelease();
        core_1.ux.action.stop('done, ' + color_1.default.release(`v${release.version}`));
    }
}
exports.ConfigUnset = ConfigUnset;
ConfigUnset.aliases = [
    'config:remove',
];
ConfigUnset.description = 'unset one or more config vars';
ConfigUnset.examples = [
    `$ heroku config:unset RAILS_ENV
Unsetting RAILS_ENV and restarting example... done, v10`,
    `$ heroku config:unset RAILS_ENV RACK_ENV
Unsetting RAILS_ENV, RACK_ENV and restarting example... done, v10`,
];
ConfigUnset.strict = false;
ConfigUnset.flags = {
    app: command_1.flags.app({ char: 'a', required: true }),
    remote: command_1.flags.remote({ char: 'r' }),
};
