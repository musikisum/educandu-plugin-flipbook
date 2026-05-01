import React, { useEffect, useId, useRef, useState } from 'react';
import { Button, Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import Info from '@educandu/educandu/components/info.js';
import UrlInput from '@educandu/educandu/components/url-input.js';
import ItemPanel from '@educandu/educandu/components/item-panel.js';
import { FORM_ITEM_LAYOUT, SOURCE_TYPE } from '@educandu/educandu/domain/constants.js';
import MarkdownInput from '@educandu/educandu/components/markdown-input.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import ObjectWidthSlider from '@educandu/educandu/components/object-width-slider.js';
import DragAndDropContainer from '@educandu/educandu/components/drag-and-drop-container.js';
import { swapItemsAt, removeItemAt, moveItem } from '@educandu/educandu/utils/array-utils.js';
import FlipbookPageFlip from './flipbook-page-flip.js';

const PAGE_TYPES = ['image', 'text', 'image+text'];
const IMAGE_SOURCE_TYPES = [SOURCE_TYPE.mediaLibrary, SOURCE_TYPE.roomMedia, SOURCE_TYPE.external];

function createPage(type) {
  return { key: crypto.randomUUID(), type, image: '', text: '' };
}

export default function FlipbookEditor({ content, onContentChanged }) {
  const droppableIdRef = useRef(useId());
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');
  const { pages, width } = content;

  const [previewPages, setPreviewPages] = useState(pages);
  useEffect(() => {
    const timer = setTimeout(() => setPreviewPages(pages), 400);
    return () => clearTimeout(timer);
  }, [pages]);

  const updateContent = updates => onContentChanged({ ...content, ...updates });

  const handlePageChange = (key, changes) => {
    updateContent({ pages: pages.map(p => p.key === key ? { ...p, ...changes } : p) });
  };

  const handleAddPage = type => {
    updateContent({ pages: [...pages, createPage(type)] });
  };

  const handleDeletePage = index => {
    updateContent({ pages: removeItemAt(pages, index) });
  };

  const handleMoveUp = index => {
    updateContent({ pages: swapItemsAt(pages, index, index - 1) });
  };

  const handleMoveDown = index => {
    updateContent({ pages: swapItemsAt(pages, index, index + 1) });
  };

  const handleMovePage = (fromIndex, toIndex) => {
    updateContent({ pages: moveItem(pages, fromIndex, toIndex) });
  };

  const renderPageItemPanel = ({ page, index, dragHandleProps, isDragged, isOtherDragged }) => (
    <ItemPanel
      key={page.key}
      index={index}
      itemsCount={pages.length}
      isDragged={isDragged}
      isOtherDragged={isOtherDragged}
      dragHandleProps={dragHandleProps}
      header={`${t('page')} ${index + 1}`}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onDelete={handleDeletePage}
      >
      <Form.Item label={t('pageType')} {...FORM_ITEM_LAYOUT}>
        <Select
          value={page.type}
          options={PAGE_TYPES.map(pt => ({ value: pt, label: t(`pageType_${pt}`) }))}
          onChange={type => handlePageChange(page.key, { type })}
          />
      </Form.Item>

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
    </ItemPanel>
  );

  const dragAndDropPanelItems = pages.map((page, index) => ({
    key: page.key,
    render: ({ dragHandleProps, isDragged, isOtherDragged }) =>
      renderPageItemPanel({ page, index, dragHandleProps, isDragged, isOtherDragged })
  }));

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

      <div className="EP_Musikisum_Flipbook_EditorPreview">
        <div className="EP_Musikisum_Flipbook_EditorPreviewLabel">{t('preview')}</div>
        <div className="EP_Musikisum_Flipbook_EditorPreviewBook">
          {previewPages.length
            ? <FlipbookPageFlip pages={previewPages} />
            : <p className="EP_Musikisum_Flipbook_Empty">{t('noPages')}</p>}
        </div>
      </div>

      <DragAndDropContainer droppableId={droppableIdRef.current} items={dragAndDropPanelItems} onItemMove={handleMovePage} />

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
