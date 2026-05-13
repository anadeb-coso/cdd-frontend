import { BaseModel } from "../administrativelevels/BaseModel";
import { SubprojectFile } from "./SubprojectFile";

export class FileComment extends BaseModel {
    file?: SubprojectFile;
    comment?: string;
    type?: string;
    comment_read?: boolean;
    user?: any;
}