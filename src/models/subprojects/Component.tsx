import { BaseModel } from "../administrativelevels/BaseModel";

export class Component extends BaseModel {
    name?: string;
    parent?: this;
    description?: string;
}