import { Constants } from './constants';
import fs from 'fs';
import path from 'path';

export class Utils {
    private _constants = new Constants;

    noop() {};

    readJsonFile = (config: string) => {
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, config), 'utf8'));
    }

    packageJson = this.readJsonFile("../package.json");

    getModDisplayName = (withVersion = false) => {
        if (withVersion) {
            return `${this.packageJson.displayName} v${this.packageJson.version}`;
        }
        return `${this.packageJson.displayName}`;
    }

    getStashId = (index) => {
        switch (index) {
            case 1:
                return this._constants.STANDARD_STASH_ID;
            case 2:
                return this._constants.LEFT_BEHIND_STASH_ID;
            case 3:
                return this._constants.PREPARE_FOR_ESCAPE_STASH_ID;
            case 4:
                return this._constants.EDGE_OF_DARKNESS_STASH_ID;
            default:
                return `${this._constants.PROGRESSIVE_STASH_PREFIX_ID}_${index}`;
        }
    }

    getStash = (index) =>{
        switch (index) {
            case 1:
                return this._constants.STANDARD_STASH;
            case 2:
                return this._constants.LEFT_BEHIND_STASH;
            case 3:
                return this._constants.PREPARE_FOR_ESCAPE_STASH;
            case 4:
                return this._constants.EDGE_OF_DARKNESS_STASH;
        }
    }
}
