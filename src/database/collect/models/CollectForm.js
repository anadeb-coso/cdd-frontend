import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, json } from '@nozbe/watermelondb/decorators';

const asArray = (raw) => (Array.isArray(raw) ? raw : []);
const asObject = (raw) => (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {});

export default class CollectForm extends Model {
  static table = 'collect_forms';

  @field('owner_key') ownerKey;
  @field('server_id') serverId;
  @field('uid') uid;
  @text('title') title;
  @text('description') description;
  @field('version') version;
  @field('status') status;
  @text('close_message') closeMessage;
  @field('single_submission') singleSubmission;
  @json('form_json', asArray) form;
  @json('title_template_json', asObject) titleTemplate;
  @field('published_at') publishedAt;
  @field('downloaded_at') downloadedAt;
  @field('last_synced_at') lastSyncedAt;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  get isOpen() {
    return this.status === 'published';
  }
}
