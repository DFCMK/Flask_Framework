"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const completions_1 = require("@heroku-cli/command/lib/completions");
const core_1 = require("@oclif/core");
const fs = require("fs-extra");
const path = require("path");
const cache_1 = require("../lib/autocomplete/cache");
const create_1 = require("../commands/autocomplete/create");
const completions = async function ({ type, app }) {
    // autocomplete is now in core, skip windows
    if (this.config.windows)
        return;
    const logInOut = type === 'login' || type === 'logout';
    const completionsDir = path.join(this.config.cacheDir, 'autocomplete', 'completions');
    const rm = () => fs.emptyDir(completionsDir);
    const rmKey = (cacheKey) => fs.remove(path.join(completionsDir, cacheKey));
    if (type === 'app')
        return rmKey('app');
    if (type === 'addon' && app)
        return rmKey(`${app}_addons`);
    if (type === 'config' && app)
        return rmKey(`${app}_config_vars`);
    if (logInOut)
        return rm();
    const update = async (completion, cacheKey) => {
        const cachePath = path.join(completionsDir, cacheKey);
        const options = await completion.options({ config: this.config });
        await (0, cache_1.updateCache)(cachePath, options);
    };
    // if user is not logged in, exit
    try {
        const heroku = new command_1.APIClient(this.config);
        if (!heroku.auth)
            return;
        await heroku.get('/account', { retryAuth: false });
    }
    catch (error) {
        this.debug(error.message);
        return;
    }
    core_1.ux.action.start('Updating completions');
    await rm();
    await create_1.default.run([], this.config);
    try {
        await update(completions_1.AppCompletion, 'app');
        await update(completions_1.PipelineCompletion, 'pipeline');
        await update(completions_1.SpaceCompletion, 'space');
        await update(completions_1.TeamCompletion, 'team');
    }
    catch (error) {
        this.debug(error.message);
    }
    core_1.ux.action.stop();
};
exports.default = completions;
