import { BaseModel } from "../administrativelevels/BaseModel";
import { Category } from "./Category";
import { NewsFile } from "./NewsFile";
import { Tag } from "./Tag";

export class News extends BaseModel {
    category?: Category;
    title?: string;
    description?: string;
    publish?: boolean;
    tags?: Array<Tag>;
    projects?: any;
    administrative_levels?: any;

    files?: Array<NewsFile>;

    facilitator?: any;
    user?: any;
}