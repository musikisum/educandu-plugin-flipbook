import React, { useId, useRef, useState } from 'react';
import { Button, Checkbox, Form, Input, Modal, Select } from 'antd';
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
import MediaRangeSelector from '@educandu/educandu/components/media-player/media-range-selector.js';

const PAGE_TYPES = ['image', 'text', 'image+text', 'abc'];
const IMAGE_SOURCE_TYPES = [SOURCE_TYPE.mediaLibrary, SOURCE_TYPE.roomMedia, SOURCE_TYPE.external, SOURCE_TYPE.wikimedia];
const AUDIO_SOURCE_TYPES = [SOURCE_TYPE.mediaLibrary, SOURCE_TYPE.roomMedia, SOURCE_TYPE.external, SOURCE_TYPE.youtube];

function secondsToTimecode(secs) {
  if (secs === null || typeof secs === 'undefined') {
    return '';
  }
  const m = Math.floor(Number(secs) / 60);
  const s = Math.floor(Number(secs) % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timecodeToSeconds(str) {
  const trimmed = (str || '').trim();
  if (!trimmed) {
    return null;
  }
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx !== -1) {
    const m = parseInt(trimmed.slice(0, colonIdx), 10);
    const s = parseInt(trimmed.slice(colonIdx + 1), 10);
    if (!Number.isNaN(m) && !Number.isNaN(s)) {
      return m * 60 + s;
    }
  }
  const n = parseFloat(trimmed);
  return Number.isNaN(n) ? null : n;
}

function createPage(type) {
  const base = { key: crypto.randomUUID(), type, image: '', text: '' };
  if (type === 'abc') {
    return { ...base, markdown: '' };
  }
  if (type === 'image+text') {
    return { ...base, imagePosition: 'none', imageSize: 100 };
  }
  return base;
}

export default function FlipbookEditor({ content, onContentChanged }) {
  const droppableIdRef = useRef(useId());
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');
  const pxFormatter = useNumberWithUnitFormat({ unit: 'px', useGrouping: false });
  const percentFormatter = useNumberWithUnitFormat({ unit: '%', useGrouping: false });
  const [timecodeModalOpen, setTimecodeModalOpen] = useState(false);
  const [editingTimecodes, setEditingTimecodes] = useState([]);
  const { pages, width, height = 550, showCover = false, coverTitle = '', coverSubtitle = '', coverEdition = '', audioUrl = '', audioPlaybackRange = [0, 1], audioWidth = 100, audioTimecodes = [] } = content;

  const updateContent = updates => onContentChanged({ ...content, ...updates });

  const handleOpenTimecodeModal = () => {
    setEditingTimecodes(pages.map((_, i) => secondsToTimecode(audioTimecodes[i])));
    setTimecodeModalOpen(true);
  };

  const handleSaveTimecodes = () => {
    updateContent({ audioTimecodes: editingTimecodes.map(timecodeToSeconds) });
    setTimecodeModalOpen(false);
  };

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

      {page.type === 'image+text' && (
        <React.Fragment>
          <Form.Item label={t('imagePosition')} {...FORM_ITEM_LAYOUT}>
            <Select
              value={page.imagePosition ?? 'none'}
              options={['none', 'left', 'right'].map(pos => ({ value: pos, label: t(`imagePosition_${pos}`) }))}
              onChange={imagePosition => handlePageChange(page.key, { imagePosition })}
              />
          </Form.Item>
          <Form.Item label={t('imageSize')} {...FORM_ITEM_LAYOUT}>
            <StepSlider
              min={10}
              step={5}
              max={100}
              marksStep={10}
              labelsStep={20}
              value={page.imageSize ?? 40}
              formatter={percentFormatter}
              onChange={value => handlePageChange(page.key, { imageSize: value })}
              />
          </Form.Item>
        </React.Fragment>
      )}

      {page.type === 'text' && (
        <Form.Item label={t('text')} {...FORM_ITEM_LAYOUT}>
          <MarkdownInput
            value={page.text}
            renderAnchors
            onChange={e => handlePageChange(page.key, { text: e.target.value })}
            />
        </Form.Item>
      )}

      {page.type === 'image+text' && (
        <Form.Item label={<Info tooltip={t('imageTextInfo')}>{t('text')}</Info>} {...FORM_ITEM_LAYOUT}>
          <MarkdownInput
            value={page.text}
            renderAnchors
            onChange={e => handlePageChange(page.key, { text: e.target.value })}
            />
        </Form.Item>
      )}

      {page.type === 'abc' && (
        <React.Fragment>
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
        </React.Fragment>
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
        {showCover
          ? (
            <React.Fragment>
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
            </React.Fragment>
          )
          : null}
        <Form.Item label={t('audioUrl')} {...FORM_ITEM_LAYOUT}>
          <UrlInput
            value={audioUrl}
            allowedSourceTypes={AUDIO_SOURCE_TYPES}
            onChange={url => updateContent({ audioUrl: url, audioPlaybackRange: [0, 1] })}
            />
        </Form.Item>
        {!!audioUrl && (
          <Form.Item
            label={<Info tooltip={t('common:widthInfo')}>{t('audioWidth')}</Info>}
            {...FORM_ITEM_LAYOUT}
            >
            <ObjectWidthSlider value={audioWidth} onChange={value => updateContent({ audioWidth: value })} />
          </Form.Item>
        )}
        {!!audioUrl && (
          <Form.Item label={t('audioPlaybackRange')} {...FORM_ITEM_LAYOUT}>
            <MediaRangeSelector
              sourceUrl={audioUrl}
              range={audioPlaybackRange}
              onRangeChange={range => updateContent({ audioPlaybackRange: range })}
              />
          </Form.Item>
        )}
        {!!(audioUrl && pages.length) && (
          <Form.Item label={t('audioTimecodes')} {...FORM_ITEM_LAYOUT}>
            <Button onClick={handleOpenTimecodeModal}>{t('editTimecodes')}</Button>
          </Form.Item>
        )}
      </Form>

      <Modal
        title={t('editTimecodes')}
        open={timecodeModalOpen}
        onOk={handleSaveTimecodes}
        onCancel={() => setTimecodeModalOpen(false)}
        >
        <div className="EP_Musikisum_Flipbook_TimecodeModal">
          {pages.map((page, index) => (
            <div key={page.key} className="EP_Musikisum_Flipbook_TimecodeRow">
              <span className="EP_Musikisum_Flipbook_TimecodeLabel">{t('page')} {index + 1}</span>
              <Input
                value={editingTimecodes[index] ?? ''}
                placeholder="0:00"
                onChange={e => setEditingTimecodes(prev => {
                  const next = [...prev];
                  next[index] = e.target.value;
                  return next;
                })}
                />
            </div>
          ))}
        </div>
      </Modal>

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
