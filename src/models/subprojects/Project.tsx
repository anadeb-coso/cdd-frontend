import { Financier } from "./Financier";
import { BaseModel } from "../administrativelevels/BaseModel";

export class Project extends BaseModel {
    name?: string;
    description?: string;
    financier?: Financier;
}