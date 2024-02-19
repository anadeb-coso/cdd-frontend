import { BaseModel } from "../administrativelevels/BaseModel";
import { Subject } from "./Subject";

export class Lesson extends BaseModel {
    subject?: Subject;
    name?: string;
    rank?: number;
    image?: string;
    description?: string;

    supportingmaterials?: Array<this>;
}