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
      coverEdition: '',
      audioUrl: '',
      audioPlaybackRange: [0, 1],
      audioWidth: 100,
      audioTimecodes: []
    };
  }

  validateContent(content) {
    const pageSchema = joi.object({
      key: joi.string().required(),
      type: joi.string().valid('image', 'text', 'image+text', 'abc').required(),
      image: joi.string().allow('').optional(),
      text: joi.string().allow('').optional(),
      markdown: joi.string().allow('').optional(),
      abcSize: joi.number().optional(),
      abcPosition: joi.string().optional(),
      imagePosition: joi.string().valid('none', 'left', 'right', 'top', 'bottom').optional(),
      imageSize: joi.number().optional()
    });

    const schema = joi.object({
      pages: joi.array().items(pageSchema).required(),
      width: joi.number().min(0).max(100).required(),
      height: joi.number().min(100).max(2000).optional(),
      showCover: joi.boolean().optional(),
      coverTitle: joi.string().allow('').optional(),
      coverSubtitle: joi.string().allow('').optional(),
      coverEdition: joi.string().allow('').optional(),
      audioUrl: joi.string().allow('').optional(),
      audioPlaybackRange: joi.array().items(joi.number()).length(2).optional(),
      audioWidth: joi.number().min(0).max(100).optional(),
      audioTimecodes: joi.array().items(joi.number().allow(null)).optional()
    });

    joi.attempt(content, schema, { abortEarly: false, convert: false, noDefaults: true, allowUnknown: true });
  }

  cloneContent(content) {
    return cloneDeep(content);
  }

  redactContent(content, targetRoomId) {
    const redactedContent = cloneDeep(content);
    const redact = url => couldAccessUrlFromRoom(url, targetRoomId) ? url : '';

    redactedContent.pages = redactedContent.pages.map(page => ({
      ...page,
      image: page.image && !couldAccessUrlFromRoom(page.image, targetRoomId) ? '' : page.image,
      text: this.gfm.redactCdnResources(page.text || '', redact),
      markdown: page.markdown ? this.gfm.redactCdnResources(page.markdown, redact) : page.markdown
    }));

    redactedContent.coverTitle = this.gfm.redactCdnResources(redactedContent.coverTitle || '', redact);
    redactedContent.coverSubtitle = this.gfm.redactCdnResources(redactedContent.coverSubtitle || '', redact);
    if (redactedContent.audioUrl && !couldAccessUrlFromRoom(redactedContent.audioUrl, targetRoomId)) {
      redactedContent.audioUrl = '';
    }

    return redactedContent;
  }

  getCdnResources(content) {
    const resources = [];

    for (const page of content.pages) {
      if (page.image) {
        resources.push(page.image);
      }
      if (page.text) {
        resources.push(...this.gfm.extractCdnResources(page.text));
      }
      if (page.markdown) {
        resources.push(...this.gfm.extractCdnResources(page.markdown));
      }
    }

    resources.push(...this.gfm.extractCdnResources(content.coverTitle || ''));
    resources.push(...this.gfm.extractCdnResources(content.coverSubtitle || ''));
    if (content.audioUrl) {
      resources.push(content.audioUrl);
    }

    return [...new Set(resources)].filter(Boolean);
  }
}

export default FlipbookInfo;
