"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTos = void 0;
const core_1 = require("@oclif/core");
const path = require("path");
const fs = require("fs-extra");
function checkTos(options) {
    const tosPath = path.join(options.config.cacheDir, 'terms-of-service');
    const viewedBanner = fs.pathExistsSync(tosPath);
    const message = 'Our terms of service have changed: https://dashboard.heroku.com/terms-of-service';
    if (!viewedBanner) {
        core_1.ux.warn(message);
        fs.createFile(tosPath);
    }
}
exports.checkTos = checkTos;
const hook = async function (options) {
    checkTos(options);
};
exports.default = hook;
