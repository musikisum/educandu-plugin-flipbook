import joi from 'joi';
import React from 'react';
import { BookOutlined } from '@ant-design/icons';
import cloneDeep from '@educandu/educandu/utils/clone-deep.js';
import { PLUGIN_GROUP } from '@educandu/educandu/domain/constants.js';
import { couldAccessUrlFromRoom } from '@educandu/educandu/utils/source-utils.js';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';

class FlipbookInfo {
  static dependencies = [GithubFlavoredMarkdown];

  static typeName = 'musikisum/educandu-plugin-flipbook';

  allowsInput = false;

  constructor(gfm) {
    this.gfm = gfm;
  }

  getDisplayName(t) {
    return t('musikisum/educandu-plugin-flipbook:name');
  }

  getIcon() {
    return <BookOutlined />;
  }

  getGroups() {
    return [PLUGIN_GROUP.textImage];
  }

  async resolveDisplayComponent() {
    return (await import('./flipbook-display.js')).default;
  }

  async resolveEditorComponent() {
    return (await import('./flipbook-editor.js')).default;
  }

  getDefaultContent() {
    return {
      pages: [],
      width: 100,
      height: 550,
      showCover: false,
      coverTitle: '',
      coverSubtitle: '',
      coverEdition: ''
    };
  }

  validateContent(content) {
    const pageSchema = joi.object({
      key: joi.string().required(),
      type: joi.string().valid('image', 'text', 'image+text').required(),
      image: joi.string().allow('').optional(),
      text: joi.string().allow('').optional()
    });

    const schema = joi.object({
      pages: joi.array().items(pageSchema).required(),
      width: joi.number().min(0).max(100).required(),
      height: joi.number().min(100).max(2000).optional(),
      showCover: joi.boolean().optional(),
      coverTitle: joi.string().allow('').optional(),
      coverSubtitle: joi.string().allow('').optional(),
      coverEdition: joi.string().allow('').optional()
    });

    joi.attempt(content, schema, { abortEarly: false, convert: false, noDefaults: true, allowUnknown: true });
  }

  cloneContent(content) {
    return cloneDeep(content);
  }

  redactContent(content, targetRoomId) {
    const redactedContent = cloneDeep(content);

    redactedContent.pages = redactedContent.pages.map(page => {
      if (!page.image) {
        return page;
      }
      return {
        ...page,
        image: couldAccessUrlFromRoom(page.image, targetRoomId) ? page.image : ''
      };
    });

    return redactedContent;
  }

  getCdnResources(content) {
    return content.pages.flatMap(page => page.image ? [page.image] : []);
  }
}

export default FlipbookInfo;
