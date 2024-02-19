import { BaseModel } from "../administrativelevels/BaseModel";
import { Lesson } from "./Lesson";
import { Subject } from "./Subject";

export class SupportingMaterial extends BaseModel {
    subject?: Subject;
    lesson?: Lesson;
    name?: string;
    rank?: number;
    file?: string;
    file_aws_s3_url?: string;
    description?: string;
}