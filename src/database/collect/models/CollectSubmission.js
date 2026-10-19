import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, json } from '@nozbe/watermelondb/decorators';

const asArray = (raw) => (Array.isArray(raw) ? raw : []);

export default class CollectSubmission extends Model {
  static table = 'collect_submissions';

  @field('owner_key') ownerKey;
  @field('uuid') uuid;
  @field('form_server_id') formServerId;
  @field('form_version') formVersion;
  @json('data_json', asArray) data;
  @field('status') status;
  @text('title') title;
  @field('editable') editable;
  @field('dirty') dirty;
  @field('sync_error_code') syncErrorCode;
  @field('sync_error') syncError;
  @field('created_at_local') createdAtLocal;
  @field('submitted_at_local') submittedAtLocal;
  @field('server_updated_at') serverUpdatedAt;
  @field('current_page') currentPage;
  @field('source') source;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  /** Envoyée et non rouverte : consultable seulement. */
  get isLocked() {
    return this.status === 'submitted' && !this.editable;
  }
}
