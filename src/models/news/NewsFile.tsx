import { BaseModel } from "../administrativelevels/BaseModel";
import { News } from "./News";

export class NewsFile extends BaseModel {
    news?: News;
    name?: string;
    url?: string;
    order?: number;
    principal?: boolean;
    date_taken?: Date;
    file_type?: string;
    username?: string;
    user_email?: string;
}