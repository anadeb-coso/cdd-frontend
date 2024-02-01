import { BaseModel } from "./BaseModel";
import { CVD } from "./CVD";
import { GeographicalUnit } from "./GeographicalUnit";

export class AdministrativeLevel extends BaseModel {
    name?: string;
    parent?: this;
    geographical_unit?: GeographicalUnit;
    cvd?: CVD;
    type?: string;
    latitude?: number;
    longitude?: number;
    frontalier?: boolean;
    rural?: boolean;
    no_sql_db_id?: string;
    
    number_subprojects?: number;
    number_infrastructures?: number;
}