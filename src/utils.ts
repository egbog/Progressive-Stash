import * as Constants from './constants';
import fs from 'fs';
import path from 'path';

export class Utils {
    noop() {};

    readJsonFile = (config: string) => {
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, config), 'utf8'));
    }

    private packageJson = this.readJsonFile(Constants.packageJsonLocation);

    getModDisplayName = (withVersion = false) => {
        if (withVersion) {
            return `${this.packageJson.displayName} v${this.packageJson.version}`;
        }
        return `${this.packageJson.displayName}`;
    }

    getStashId = (index) => {
        switch (index) {
            case 1:
                return Constants.STANDARD_STASH_ID;
            case 2:
                return Constants.LEFT_BEHIND_STASH_ID;
            case 3:
                return Constants.PREPARE_FOR_ESCAPE_STASH_ID;
            case 4:
                return Constants.EDGE_OF_DARKNESS_STASH_ID;
            default:
                return `${Constants.PROGRESSIVE_STASH_PREFIX_ID}_${index}`;
        }
    }

    getStashTemplateId = (index) =>{
        switch (index) {
            case 1:
                return Constants.STANDARD_STASH_TEMPLATEID;
            case 2:
                return Constants.LEFT_BEHIND_STASH_TEMPLATEID;
            case 3:
                return Constants.PREPARE_FOR_ESCAPE_STASH_TEMPLATEID;
            case 4:
                return Constants.EDGE_OF_DARKNESS_STASH_TEMPLATEID;
        }
    }
}
