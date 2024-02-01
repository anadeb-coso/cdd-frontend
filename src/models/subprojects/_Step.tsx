import { BaseModel } from "../administrativelevels/BaseModel";
import { SubprojectFile } from "./SubprojectFile";

export class _Step extends BaseModel {
    wording?: string;
    percent?: number;
    description?: string;
    ranking?: number;
    amount_spent_at_this_step?: number;
    total_amount_spent?: number;

    files?: Array<SubprojectFile>;
}