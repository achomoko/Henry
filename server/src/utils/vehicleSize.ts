import { VehicleSize } from "../types";

const vehicleSizeOrder: VehicleSize[] = ["small", "medium", "large"];

export const getVehicleSizeIndex = (size: VehicleSize): number =>
  vehicleSizeOrder.indexOf(size);

export const isVehicleSizeAllowed = (
  requested: VehicleSize,
  max: VehicleSize,
): boolean => getVehicleSizeIndex(requested) <= getVehicleSizeIndex(max);

export const getVehicleSizeLabel = (size: VehicleSize): string => {
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

