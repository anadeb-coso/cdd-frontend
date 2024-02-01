import { Level } from "./Level";
import { _Step } from "./_Step";

export class SubprojectStep extends _Step {
    subproject?: any;
    step?: any;
    begin?: Date;
    end?: Date;

    levels?: Array<Level>;
}