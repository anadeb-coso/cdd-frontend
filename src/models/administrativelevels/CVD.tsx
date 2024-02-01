import { AdministrativeLevel } from "./AdministrativeLevel";
import { BaseModel } from "./BaseModel";
import { GeographicalUnit } from "./GeographicalUnit";

export class CVD extends BaseModel {
    name?: string;
    geographical_unit?: GeographicalUnit;
    headquarters_village?: any;
    attributed_number_in_canton?: number;
    unique_code?: string;
    president_name_of_the_cvd?: string;
    president_phone_of_the_cvd?: string;
    treasurer_name_of_the_cvd?: string;
    treasurer_phone_of_the_cvd?: string;
    secretary_name_of_the_cvd?: string;
    secretary_phone_of_the_cvd?: string;
    description?: string;

    administrativelevels?: Array<AdministrativeLevel>;
    number_subprojects?: number;
    number_infrastructures?: number;
}