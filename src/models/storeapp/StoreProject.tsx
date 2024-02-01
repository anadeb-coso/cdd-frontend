import { BaseModel } from "../administrativelevels/BaseModel";
import { StoreApp } from "./StoreApp";

export class StoreProject extends BaseModel {
    name?: string;
    image?: string;
    package?: string;
    description?: string;

    apps?: Array<StoreApp>;
    app?: StoreApp;
}