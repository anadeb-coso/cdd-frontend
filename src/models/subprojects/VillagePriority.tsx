import { Component } from "./Component";
import { BaseModel } from "../administrativelevels/BaseModel";

export class VillagePriority extends BaseModel {
    administrative_level?: any;
    component?: Component;
    name?: string;
    proposed_men?: number;
    proposed_women?: number;
    estimated_cost?: number;
    estimated_beneficiaries?: number;
    climate_changing_contribution?: string;
    eligibility ?: boolean;
    sector?: string;
    parent?: this;
    meeting?: any;
    ranking: number = 0;
}