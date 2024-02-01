import { BaseModel } from "../administrativelevels/BaseModel";

export class StoreApp extends BaseModel {
    project?: any;
    version_code?: number;
    app_version?: string;
    apk?: string;
    apk_aws_s3_url?: string;
    app_code?: string;
    description?: string;
}