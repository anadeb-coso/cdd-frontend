import { BaseModel } from "../administrativelevels/BaseModel";
import { Lesson } from "./Lesson";

export class Subject extends BaseModel {
    name?: string;
    rank?: number;
    image?: string;
    description?: string;

    subjects?: Array<this>;
    lessons?: Array<Lesson>;
}