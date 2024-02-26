import { Constants } from "./constants";

export class SecureContainersController {
    private constants_1 = new Constants;
    secureContainers;
    constructor(config) {
        this.secureContainers = config.secure_containers;
    }

    createCraft = (itemId, requirements) => {
        return {
            _id: `${itemId}_craft`,
            areaType: this.constants_1.WORKBENCH_AREA,
            requirements: requirements.map((r) => r.type === "Item" ? { ...r, isFunctional: false } : r),
            productionTime: 300,
            endProduct: itemId,
            continuous: false,
            count: 1,
            productionLimitCount: 1,
            isEncoded: false,
            locked: false,
            needFuelForAllProductionTime: false,
        };
    };
    
    injectCraftsToDb(db) {
        let counter = 0;
        const tables = db.getTables();

        for (const containerName of Object.keys(this.secureContainers)){
            const secureContainerId = this.constants_1.SECURE_CONTAINERS[containerName];
            const secureContainer = this.secureContainers[containerName];
            const isCraftable = !secureContainer.not_craftable;
            if (isCraftable) {
                const requirements = secureContainer.requirements;
                const productionItem = this.createCraft(secureContainerId, requirements);
                tables.hideout.production.push(productionItem);
                counter = counter + 1;
            }
        }
        return counter;
    }

    tweakContainerDimensions(db) {
        let counter = 0;
        const tables = db.getTables();

        for (const containerName of Object.keys(this.secureContainers)) {
            const secureContainerId = this.constants_1.SECURE_CONTAINERS[containerName];
            const [horizontalSize, verticalSize] = this.secureContainers[containerName].dimensions;
            const item = tables.templates.items[secureContainerId];
            if (item) {
                const props = item._props.Grids[0]._props;
                props.cellsH = horizontalSize;
                props.cellsV = verticalSize;
                counter = counter + 1;
            }
        }
        return counter;
    }
}
