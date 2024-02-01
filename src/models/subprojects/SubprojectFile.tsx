import { BaseModel } from "../administrativelevels/BaseModel";
import { Level } from "./Level";
import { Subproject } from "./Subproject";
import { SubprojectStep } from "./SubprojectStep";

export class SubprojectFile extends BaseModel {
    subproject?: Subproject;
    subproject_step?: SubprojectStep;
    subproject_level?: Level;
    name?: string;
    url?: string;
    order?: number;
    principal?: boolean;
    date_taken?: Date;
    file_type?: string;
}