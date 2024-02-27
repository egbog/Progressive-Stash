import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { SecureContainersController } from "./secure-containers";
import * as Constants from "./constants";
import { StashBuilder } from "./stash-builder";
import { Utils } from "./utils";


const uglyClone = (data) => {
    return JSON.parse(JSON.stringify(data));
};

class ProfileTemplateBuilder{
    setStashLevelOne(usecOrBear) {
        const character = usecOrBear.character;
        const hideout = character.Hideout;
        const inventory = character.Inventory;

        // 1. set stash area to level 1
        hideout.Areas = hideout.Areas.map((area) => {
            if (area.type === Constants.STASH_AREA) {
                return { ...area, level: 1 };
            }
            return area;
        });
        // 2. set bonuses StashSize to Standard stash
        character.Bonuses = [
            {
                id: Constants.STANDARD_STASH_ID,
                templateId: Constants.STANDARD_STASH_TEMPLATEID,
                type: "StashSize",
            },
        ];
        // 3. set encyclopedia entry
        character.Encyclopedia[Constants.STANDARD_STASH_ID] = false;
        let id = "";
        // 4. add stash instance
        inventory.items = inventory.items.map((item) => {
            if (item._tpl === Constants.EDGE_OF_DARKNESS_STASH_TEMPLATEID) {
                id = item._id;
                return { ...item, _tpl: Constants.STANDARD_STASH_TEMPLATEID };
            }
            return item;
        });
        // 5. set current stash inventory
        if (id) {
            inventory.stash = id;
            return true;
        }
        return false;
    }
    setPouchAsSecureContainer(usecOrBear) {
        const inventory = usecOrBear.character.Inventory;
        inventory.items = inventory.items.map((item) => {
            if (item.slotId === "SecuredContainer") {
                return { ...item, _tpl: Constants.WAIST_POUCH_ID };
            }
            return item;
        });
    }
    buildStashProfileTemplate(db) {
        const profiles = db.getTables().templates.profiles;
        const profile = uglyClone(profiles["Edge Of Darkness"]);
        if (!profile) {
            return false;
        }
        this.setStashLevelOne(profile.usec);
        this.setStashLevelOne(profile.bear);
        this.setPouchAsSecureContainer(profile.usec);
        this.setPouchAsSecureContainer(profile.bear);
        profiles[Constants.PROFILE_TEMPLATE_NAME] = profile;
        return true;
    }
}

class Mod implements IPreAkiLoadMod, IPostAkiLoadMod, IPostDBLoadMod {
    private logger: ILogger;
    private utils = new Utils;

    private config = this.utils.readJsonFile(Constants.configJsonLocation);

    public preAkiLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");

        const debug = this.config.debug
            ? (data) => this.logger.debug(`[${(this.utils.getModDisplayName)(false)}]: ${data}`, true)
            : this.utils.noop;
        if (this.config.debug) {
            debug("debug mode enabled");
        }
        if (this.config.disabled) {
            debug("disabled in config.json file.");
            return;
        }
        this.logger.info(`===> Loading [${(this.utils.getModDisplayName)(true)}]`);
    }

    public postDBLoad(container: DependencyContainer): void {
        const db = container.resolve<DatabaseServer>("DatabaseServer");
        if (this.config.remove_trades_from_peacekeeper) {
            const PKID = "5935c25fb3acc3127c3d8cd9";
            const assort = db.getTables().traders[PKID].assort.items;
            const toDelete = [];
            for (let entry = 0; entry < assort.length; entry++) {
                if (assort[entry]._tpl === "544a11ac4bdc2d470e8b456a" || assort[entry]._tpl === "5857a8b324597729ab0a0e7d") {
                    toDelete.push(entry);
                }
            }
            this.logger.info(`Size before: ${assort.length}`);
            let deleteCount = 0;
            for (const target of toDelete) {
                assort.splice(target - deleteCount, 1);
                deleteCount++;
            }
            this.logger.info(`Size after: ${assort.length}`);
        }
    }

    public postAkiLoad(container: DependencyContainer): void {
        if (this.config.disabled) {
            return;
        }

        this.logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer");

        const stashBuilder = new StashBuilder(this.config);
        const secureContainersController = new SecureContainersController(this.config);
        const profileTemplateBuilder = new ProfileTemplateBuilder();

        const nbStagesCreated = stashBuilder.injectStashesToDb(db);

        const debug = this.config.debug
        ? (data) => this.logger.debug(`[${(this.utils.getModDisplayName)(false)}]: ${data}`, true)
        : this.utils.noop;

        if (nbStagesCreated > 0) {
            debug(`injected ${nbStagesCreated} stages into database.hideout.areas`);
        }
        const nbCreatedCrafts = secureContainersController.injectCraftsToDb(db);
        if (nbCreatedCrafts > 0) {
            debug(`injected ${nbCreatedCrafts} new workbench crafts into database.hideout.production`);
        }
        const nbContainerTweaked = secureContainersController.tweakContainerDimensions(db);
        if (nbContainerTweaked > 0) {
            debug(`${nbContainerTweaked} secure containers dimensions updated`);
        }
        if (profileTemplateBuilder.buildStashProfileTemplate(db)) {
            debug(`created "${Constants.PROFILE_TEMPLATE_NAME}" profile template`);
        }
        debug(`Initial stash size: ${(this.config.initial_stash_size)}`);
        this.logger.success(`===> Successfully loaded ${(this.utils.getModDisplayName)(true)}`);
    }
}
module.exports = { mod: new Mod() };
