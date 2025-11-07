"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehicleSizeLabel = exports.isVehicleSizeAllowed = exports.getVehicleSizeIndex = void 0;
const vehicleSizeOrder = ["small", "medium", "large"];
const getVehicleSizeIndex = (size) => vehicleSizeOrder.indexOf(size);
exports.getVehicleSizeIndex = getVehicleSizeIndex;
const isVehicleSizeAllowed = (requested, max) => (0, exports.getVehicleSizeIndex)(requested) <= (0, exports.getVehicleSizeIndex)(max);
exports.isVehicleSizeAllowed = isVehicleSizeAllowed;
const getVehicleSizeLabel = (size) => {
    switch (size) {
        case "small":
            return "Small (up to 18 ft)";
        case "medium":
            return "Medium (19-26 ft)";
        case "large":
        default:
            return "Large (27+ ft)";
    }
};
exports.getVehicleSizeLabel = getVehicleSizeLabel;
//# sourceMappingURL=vehicleSize.js.map