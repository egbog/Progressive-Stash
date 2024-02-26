import { Utils } from "./utils";
import { Constants } from "./constants";

const EMPTY_STAGE = {
    improvements: [],
    requirements: [],
    bonuses: [],
    slots: 0,
    constructionTime: 600,
    description: "",
    autoUpgrade: false,
    displayInterface: true,
};
const EMPTY_STASH_BONUS = {
    value: 0,
    passive: true,
    production: false,
    visible: true,
    templateId: "",
    type: "StashSize",
};
const createStashItem = (id, size, protoId) => {
    return {
        _id: id,
        _name: `Progressive Stash 10x${size}`,
        _parent: "566abbb64bdc2d144c8b457d",
        _type: "Item",
        _props: {
            Name: `Progressive Stash 10x${size}`,
            ShortName: `Progressive Stash 10x${size}`,
            Description: `Progressive Stash 10x${size}\n`,
            Weight: 1,
            BackgroundColor: "blue",
            Width: 1,
            Height: 1,
            StackMaxSize: 1,
            ItemSound: "generic",
            Prefab: {
                path: "",
                rcid: "",
            },
            UsePrefab: {
                path: "",
                rcid: "",
            },
            StackObjectsCount: 1,
            NotShownInSlot: false,
            ExaminedByDefault: true,
            ExamineTime: 1,
            IsUndiscardable: false,
            IsUnsaleable: false,
            IsUnbuyable: false,
            IsUngivable: false,
            IsLockedafterEquip: false,
            QuestItem: false,
            LootExperience: 20,
            ExamineExperience: 10,
            HideEntrails: false,
            RepairCost: 0,
            RepairSpeed: 0,
            ExtraSizeLeft: 0,
            ExtraSizeRight: 0,
            ExtraSizeUp: 0,
            ExtraSizeDown: 0,
            ExtraSizeForceAdd: false,
            MergesWithChildren: false,
            CanSellOnRagfair: true,
            CanRequireOnRagfair: true,
            ConflictingItems: [],
            Unlootable: false,
            UnlootableFromSlot: "FirstPrimaryWeapon",
            UnlootableFromSide: [],
            AnimationVariantsNumber: 0,
            DiscardingBlock: false,
            RagFairCommissionModifier: 1,
            IsAlwaysAvailableForInsurance: false,
            DiscardLimit: -1,
            Grids: [
                {
                    _name: "hideout",
                    _id: `${id}_hideout_grid`,
                    _parent: id,
                    _props: {
                        filters: [],
                        cellsH: 10,
                        cellsV: size,
                        minCount: 0,
                        maxCount: 0,
                        maxWeight: 0,
                        isSortingTable: false,
                    },
                    _proto: "55d329c24bdc2d892f8b4567",
                },
            ],
            Slots: [],
            CanPutIntoDuringTheRaid: true,
            CantRemoveFromSlotsDuringRaid: [],
        },
        _proto: protoId,
    };
};
export class StashBuilder {
    private utils = new Utils;
    private _constants = new Constants;

    initialStashSize;
    stashUpgrades;
    constructor(config) {
        this.initialStashSize = config.initial_stash_size;
        this.stashUpgrades = config.stash_upgrades;
    }

    generateStashStages() {
        const stages = {};
        const nbStashes = this.stashUpgrades.length + 1;
        const nbStages = nbStashes + 1;

        //Array.from(Array(nbStages).keys()).forEach((index) => {
        //for (const index of Array.from(Array(nbStages).keys()))

        for (const index of Array.from(Array(nbStages).keys())) {
            const stageId = String(index);

            if (index === 0) {
                stages[stageId] = EMPTY_STAGE;
            }
            else if (index === 1) {
                const templateId = this.utils.getStashId(index);
                const id = this.utils.getStash(index);
                stages[stageId] = {
                    ...EMPTY_STAGE,
                    bonuses: [{ ...EMPTY_STASH_BONUS, id, templateId }],
                    requirements: [],
                };
            }
            else {
                const templateId = (this.utils.getStashId)(index);
                const id = (this.utils.getStash)(index);
                const upgrade = this.stashUpgrades[index - 2];
                stages[stageId] = {
                    ...EMPTY_STAGE,
                    bonuses: [{ ...EMPTY_STASH_BONUS, id, templateId }],
                    requirements: upgrade.requirements.map((r) => r.type === "Item" ? { ...r, isFunctional: false } : r),
                };
            }
        }
        
        return stages;
    }

    generateTemplateItems() {
        const nbStashes = this.stashUpgrades.length + 1;
        const stashIds = Array.from(Array(nbStashes).keys())
            .map((index) => index + 1)
            .map(this.utils.getStashId);
        let previousStashId;
        const items = stashIds.map((stashId, index) => {
            const protoId = previousStashId;
            previousStashId = stashId;
            if (index === 0) {
                return createStashItem(stashId, this.initialStashSize, protoId);
            }
            else {
                const size = this.stashUpgrades[index - 1].size;
                return createStashItem(stashId, size, protoId);
            }
        });
        return items;
    }
    setHideoutAreas(tables, stages) {
        tables.hideout.areas = tables.hideout.areas.map((area) => {
            if (area.type === this._constants.STASH_AREA) {
                return { ...area, stages };
            }
            return area;
        });
    }
    setTemplateItems(tables, items) {
        let counter = 0;

        for (const item of items) {
            if (!tables.templates.items[item._id]) {
                tables.templates.items[item._id] = item; // never executed
                counter = counter + 1;
            }
            else {
                // change the stash size
                const originalItem = tables.templates.items[item._id];
                originalItem._props.Grids[0]._props.cellsV =
                    item._props.Grids[0]._props.cellsV;
            }
        }
        return counter;
    }

    setStashLocales(tables, items) {
        let counter = 0;
        
        for (const localeName of Object.keys(tables.locales.global)) {
            const localeBase = tables.locales.global[localeName];
            const standardTemplate = localeBase[this._constants.STANDARD_STASH_ID];
            const x = 0;

            for (const { item, idx } of items.map((item, idx) => ({ item, idx}))) {
                const stage = idx + 1;
                const interfaceId = `hideout_area_3_stage_${stage}_description`;
                const size = item._props.Grids[0]._props.cellsV;
                localeBase[interfaceId] = `Progressive Stash (10x${size})`;
                // if locale template does not exists
                if (!localeBase[item._id]) {
                    // create locale template from standard template
                    localeBase[item._id] = standardTemplate;
                    counter = counter + 1;
                }
            }
        }
        return counter;
    }
    injectStashesToDb(db) {
        const tables = db.getTables();
        const stages = this.generateStashStages();
        const items = this.generateTemplateItems();
        this.setHideoutAreas(tables, stages);
        this.setTemplateItems(tables, items);
        this.setStashLocales(tables, items);
        return Object.keys(stages).length;
    }
}
