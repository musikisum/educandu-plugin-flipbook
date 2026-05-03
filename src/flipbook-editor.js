import React, { useId, useRef } from 'react';
import { Button, Checkbox, Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import Info from '@educandu/educandu/components/info.js';
import UrlInput from '@educandu/educandu/components/url-input.js';
import ItemPanel from '@educandu/educandu/components/item-panel.js';
import StepSlider from '@educandu/educandu/components/step-slider.js';
import { FORM_ITEM_LAYOUT, SOURCE_TYPE } from '@educandu/educandu/domain/constants.js';
import AbcInput from '@educandu/educandu/components/abc-input.js';
import MarkdownInput from '@educandu/educandu/components/markdown-input.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import ObjectWidthSlider from '@educandu/educandu/components/object-width-slider.js';
import DragAndDropContainer from '@educandu/educandu/components/drag-and-drop-container.js';
import { swapItemsAt, removeItemAt, moveItem } from '@educandu/educandu/utils/array-utils.js';
import { useNumberWithUnitFormat } from '@educandu/educandu/components/locale-context.js';
import FlipbookPageFlip from './flipbook-page-flip.js';

const PAGE_TYPES = ['image', 'text', 'image+text', 'abc'];
const IMAGE_SOURCE_TYPES = [SOURCE_TYPE.mediaLibrary, SOURCE_TYPE.roomMedia, SOURCE_TYPE.external, SOURCE_TYPE.wikimedia];

function createPage(type) {
  const base = { key: crypto.randomUUID(), type, image: '', text: '' };
  if (type === 'abc') {
    return { ...base, markdown: '' };
  }
  return base;
}

export default function FlipbookEditor({ content, onContentChanged }) {
  const droppableIdRef = useRef(useId());
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');
  const pxFormatter = useNumberWithUnitFormat({ unit: 'px', useGrouping: false });
  const { pages, width, height = 550, showCover = false, coverTitle = '', coverSubtitle = '', coverEdition = '' } = content;

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

      {page.type === 'abc' && (
        <>
          <Form.Item label={t('abcCode')} {...FORM_ITEM_LAYOUT}>
            <AbcInput
              value={page.text}
              debounced
              onChange={e => handlePageChange(page.key, { text: e.target.value })}
            />
          </Form.Item>
          <Form.Item label={<Info tooltip={t('abcTextInfo')}>{t('text')}</Info>} {...FORM_ITEM_LAYOUT}>
            <MarkdownInput
              value={page.markdown ?? ''}
              renderAnchors
              onChange={e => handlePageChange(page.key, { markdown: e.target.value })}
            />
          </Form.Item>
        </>
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
        <Form.Item label={t('height')} {...FORM_ITEM_LAYOUT}>
          <StepSlider
            min={100}
            step={10}
            max={2000}
            marksStep={200}
            labelsStep={400}
            value={height}
            formatter={pxFormatter}
            onChange={value => updateContent({ height: value })}
          />
        </Form.Item>
        <Form.Item label={t('showCover')} {...FORM_ITEM_LAYOUT}>
          <Checkbox checked={showCover} onChange={e => updateContent({ showCover: e.target.checked })} />
        </Form.Item>
        {showCover && (
          <>
            <Form.Item label={t('coverTitle')} {...FORM_ITEM_LAYOUT}>
              <MarkdownInput
                value={coverTitle}
                renderAnchors
                onChange={e => updateContent({ coverTitle: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t('coverSubtitle')} {...FORM_ITEM_LAYOUT}>
              <MarkdownInput
                value={coverSubtitle}
                renderAnchors
                onChange={e => updateContent({ coverSubtitle: e.target.value })}
              />
            </Form.Item>
            <Form.Item label={t('coverEdition')} {...FORM_ITEM_LAYOUT}>
              <MarkdownInput
                inline
                value={coverEdition}
                onChange={e => updateContent({ coverEdition: e.target.value })}
              />
            </Form.Item>
          </>
        )}
      </Form>

      <div className="EP_Musikisum_Flipbook_EditorPreview">
        <div className="EP_Musikisum_Flipbook_EditorPreviewLabel">{t('preview')}</div>
        <div className="EP_Musikisum_Flipbook_EditorPreviewBook">
          <FlipbookPageFlip
            pages={pages}
            height={height}
            showCover={showCover}
            coverTitle={coverTitle}
            coverSubtitle={coverSubtitle}
            coverEdition={coverEdition}
          />
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
