import { AdministrativeLevel } from "./AdministrativeLevel";
import { BaseModel } from "./BaseModel";

export class GeographicalUnit extends BaseModel {
    canton?: AdministrativeLevel;
    attributed_number_in_canton?: number;
    unique_code?: string;
    description?: string;
}