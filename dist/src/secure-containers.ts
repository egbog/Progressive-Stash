import * as Constants from "./constants";

export class SecureContainersController {
    private secureContainers;
    constructor(config) {
        this.secureContainers = config.secure_containers;
    }

    createCraft = (itemId, requirements, productionTime) => {
        return {
            _id: `${itemId}_craft`,
            areaType: Constants.WORKBENCH_AREA,
            requirements: requirements.map((r) => r.type === "Item" ? { ...r, isFunctional: false } : r),
            productionTime: productionTime,
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
            const secureContainerId = Constants.SECURE_CONTAINERS[containerName];
            const secureContainer = this.secureContainers[containerName];
            const isCraftable = !secureContainer.not_craftable;
            if (isCraftable) {
                const requirements = secureContainer.requirements;
                const productionTime = secureContainer.production_time;
                const productionItem = this.createCraft(secureContainerId, requirements, productionTime);
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
            const secureContainerId = Constants.SECURE_CONTAINERS[containerName];
            const [horizontalSize, verticalSize] = this.secureContainers[containerName].dimensions;
            const item = tables.templates.items[secureContainerId];
            if (item) {
                const info = item._props;
                const props = info.Grids[0]._props;
                props.cellsH = horizontalSize;
                props.cellsV = verticalSize;
                info.sizeWidth = horizontalSize;
                info.sizeHeight = verticalSize;
                counter = counter + 1;
            }
        }
        return counter;
    }
}
