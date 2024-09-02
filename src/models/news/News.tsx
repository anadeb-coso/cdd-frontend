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

    total_men_present_over_35?: number;
    total_women_present_over_35?: number;
    total_people_present_over_35?: number;
    total_men_present_under_35?: number;
    total_women_present_under_35?: number;
    total_people_present_under_35?: number;
    total_people_present?: number;
    
    total_men_over_35_injured?: number;
    total_women_over_35_injured?: number;
    total_people_over_35_injured?: number;
    total_men_between_10_35_injured?: number;
    total_women_between_10_35_injured?: number;
    total_people_between_10_35_injured?: number;
    total_men_under_10_injured?: number;
    total_women_under_10_injured?: number;
    total_people_under_10_injured?: number;
    total_people_injured?: number;
    
    total_men_over_35_died?: number;
    total_women_over_35_died?: number;
    total_people_over_35_died?: number;
    total_men_between_10_35_died?: number;
    total_women_between_10_35_died?: number;
    total_people_between_10_35_died?: number;
    total_men_under_10_died?: number;
    total_women_under_10_died?: number;
    total_people_under_10_died?: number;
    total_people_died?: number;

    total_people_by_the_event?: number;

    publication_date?: Date;
    event_date?: Date;
    
    latitude?: number;
    longitude?: number;

    files?: Array<NewsFile>;

    facilitator?: any;
    user?: any;
}