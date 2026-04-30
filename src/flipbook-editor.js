import React from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import Info from '@educandu/educandu/components/info.js';
import { FORM_ITEM_LAYOUT } from '@educandu/educandu/domain/constants.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import ObjectWidthSlider from '@educandu/educandu/components/object-width-slider.js';

export default function FlipbookEditor({ content, onContentChanged }) {
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');
  const { width } = content;

  const handleWidthChange = value => {
    onContentChanged({ ...content, width: value });
  };

  return (
    <div className="EP_Musikisum_Flipbook_Editor">
      <Form labelAlign="left">
        <Form.Item
          label={<Info tooltip={t('common:widthInfo')}>{t('common:width')}</Info>}
          {...FORM_ITEM_LAYOUT}
          >
          <ObjectWidthSlider value={width} onChange={handleWidthChange} />
        </Form.Item>
      </Form>
    </div>
  );
}

FlipbookEditor.propTypes = {
  ...sectionEditorProps
};
