import { CVD } from "../administrativelevels/CVD";
import { AdministrativeLevel } from "../administrativelevels/AdministrativeLevel";
import { BaseModel } from "../administrativelevels/BaseModel";
import { Component } from "./Component";
import { Financier } from "./Financier";
import { Project } from "./Project";
import { VillagePriority } from "./VillagePriority";

export class Subproject extends BaseModel {
    location_subproject_realized?: AdministrativeLevel;
    cvd?: CVD;
    list_of_beneficiary_villages?: Array<AdministrativeLevel>;
    canton?: AdministrativeLevel;
    list_of_villages_crossed_by_the_track_or_electrification?: Array<AdministrativeLevel>;
    link_to_subproject?: this;
    
    number?: number;
    joint_subproject_number?: number;
    intervention_unit?: number;
    facilitator_name?: string;
    wave?: string;
    lot?: string;
    subproject_sector?: string;
    type_of_subproject?: string;
    subproject_type_designation?: string;
    full_title_of_approved_subproject?: string;
    works_type?: string;
    estimated_cost?: number;
    exact_amount_spent?: number;
    level_of_achievement_donation_certificate?: string;
    approval_date_cora?: Date;
    date_of_signature_of_contract_for_construction_supervisors?: Date;
    amount_of_the_contract_for_construction_supervisors?: number;
    date_signature_contract_controllers_in_SES?: Date;
    amount_of_the_controllers_contract_in_SES?: number;
    convention?: string;
    contract_number_of_work_companies?: string;
    name_of_the_awarded_company_works_companies?: string;
    date_signature_contract_work_companies?: Date;
    contract_amount_work_companies?: number;
    name_of_company_awarded_efme?: string;
    date_signature_contract_efme?: Date;
    contract_companies_amount_for_efme?: Date;
    date_signature_contract_facilitator?: Date;
    amount_of_the_facilitator_contract?: number;
    launch_date_of_the_construction_site_in_the_village?: Date;
    current_level_of_physical_realization_of_the_work?: string;
    length_of_the_track?: number;
    depth_of_drilling?: number;
    drilling_flow_rate?: number;
    current_status_of_the_site?: string;
    expected_duration_of_the_work?: number;
    expected_end_date_of_the_contract?: Date;
    total_contract_amount_paid?: number;
    amount_of_the_care_and_maintenance_fund_expected_to_be_mobilized?: number;
    care_and_maintenance_amount_on_village_account?: number;
    existence_of_maintenance_and_upkeep_plan_developed_by_community?: boolean;
    date_of_technical_acceptance_of_work_contracts?: Date;
    technical_acceptance_date_for_efme_contracts?: Date;
    date_of_provisional_acceptance_of_work_contracts?: Date;
    provisional_acceptance_date_for_efme_contracts?: Date;
    official_handover_date_of_the_microproject_to_the_community?: Date;
    official_handover_date_of_the_microproject_to_the_sector?: Date;
    comments?: string;
    
    target_female_beneficiaries?: number;
    target_male_beneficiaries?: number;
    target_youth_beneficiaries?: number;

    population?: number;
    direct_beneficiaries_men?: number;
    direct_beneficiaries_women?: number;
    indirect_beneficiaries_men?: number;
    indirect_beneficiaries_women?: number;

    component?: Component;
    priorities?: Array<VillagePriority>;

    latitude?: number;
    longitude?: number;

    projects?: Array<Project>; //In Which projects that we finance the subproject
    financiers?: Array<Financier>; //Which Financiers finance this subproject (when its project is define, we don't need to specialize this attribute)

    //Whose choice this subproject?
    women_s_group?: boolean;
    youth_group?: boolean;
    breeders_farmers_group?: boolean;
    ethnic_minority_group?: boolean;


    subprojects_linked?: Array<this>;
    current_subproject_step_and_level?: string;

}