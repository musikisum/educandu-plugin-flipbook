import React from 'react';
import { Button, Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import Info from '@educandu/educandu/components/info.js';
import UrlInput from '@educandu/educandu/components/url-input.js';
import { FORM_ITEM_LAYOUT, SOURCE_TYPE } from '@educandu/educandu/domain/constants.js';
import MarkdownInput from '@educandu/educandu/components/markdown-input.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import ObjectWidthSlider from '@educandu/educandu/components/object-width-slider.js';

const PAGE_TYPES = ['image', 'text', 'image+text'];
const IMAGE_SOURCE_TYPES = [SOURCE_TYPE.mediaLibrary, SOURCE_TYPE.roomMedia, SOURCE_TYPE.external];

function createPage(type) {
  return { key: crypto.randomUUID(), type, image: '', text: '' };
}

export default function FlipbookEditor({ content, onContentChanged }) {
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');
  const { pages, width } = content;

  const updateContent = updates => onContentChanged({ ...content, ...updates });

  const handlePageChange = (key, changes) => {
    updateContent({ pages: pages.map(p => p.key === key ? { ...p, ...changes } : p) });
  };

  const handleAddPage = type => {
    updateContent({ pages: [...pages, createPage(type)] });
  };

  const handleDeletePage = key => {
    updateContent({ pages: pages.filter(p => p.key !== key) });
  };

  const handleMoveUp = key => {
    const i = pages.findIndex(p => p.key === key);
    if (i <= 0) return;
    const next = [...pages];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    updateContent({ pages: next });
  };

  const handleMoveDown = key => {
    const i = pages.findIndex(p => p.key === key);
    if (i >= pages.length - 1) return;
    const next = [...pages];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    updateContent({ pages: next });
  };

  return (
    <div className="EP_Musikisum_Flipbook_Editor">
      <Form labelAlign="left">
        <Form.Item
          label={<Info tooltip={t('common:widthInfo')}>{t('common:width')}</Info>}
          {...FORM_ITEM_LAYOUT}
          >
          <ObjectWidthSlider value={width} onChange={value => updateContent({ width: value })} />
        </Form.Item>
      </Form>

      <div className="EP_Musikisum_Flipbook_PageList">
        {pages.map((page, index) => (
          <div key={page.key} className="EP_Musikisum_Flipbook_PageItem">
            <div className="EP_Musikisum_Flipbook_PageItemHeader">
              <span className="EP_Musikisum_Flipbook_PageNumber">{t('page')} {index + 1}</span>
              <Select
                value={page.type}
                options={PAGE_TYPES.map(pt => ({ value: pt, label: t(`pageType_${pt}`) }))}
                onChange={type => handlePageChange(page.key, { type })}
                />
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => handleMoveUp(page.key)}
                />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === pages.length - 1}
                onClick={() => handleMoveDown(page.key)}
                />
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeletePage(page.key)}
                />
            </div>

            {(page.type === 'image' || page.type === 'image+text') && (
              <Form.Item label={t('image')} {...FORM_ITEM_LAYOUT}>
                <UrlInput
                  value={page.image}
                  allowedSourceTypes={IMAGE_SOURCE_TYPES}
                  onChange={url => handlePageChange(page.key, { image: url })}
                  />
              </Form.Item>
            )}

            {(page.type === 'text' || page.type === 'image+text') && (
              <Form.Item label={t('text')} {...FORM_ITEM_LAYOUT}>
                <MarkdownInput
                  value={page.text}
                  renderAnchors
                  onChange={e => handlePageChange(page.key, { text: e.target.value })}
                  />
              </Form.Item>
            )}
          </div>
        ))}
      </div>

      <div className="EP_Musikisum_Flipbook_AddButtons">
        {PAGE_TYPES.map(type => (
          <Button key={type} icon={<PlusOutlined />} onClick={() => handleAddPage(type)}>
            {t(`addPage_${type}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}

FlipbookEditor.propTypes = {
  ...sectionEditorProps
};
