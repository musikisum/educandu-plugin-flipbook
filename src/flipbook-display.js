import React from 'react';
import { useTranslation } from 'react-i18next';
import FlipbookPageFlip from './flipbook-page-flip.js';
import { sectionDisplayProps } from '@educandu/educandu/ui/default-prop-types.js';

export default function FlipbookDisplay({ content }) {
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');
  const { pages, width, height = 550, showCover = false, coverTitle = '', coverSubtitle = '', coverEdition = '' } = content;

  return (
    <div className="EP_Musikisum_Flipbook_Display">
      <div className={`u-horizontally-centered u-width-${width}`}>
        {pages.length || showCover
          ? <FlipbookPageFlip
              pages={pages}
              height={height}
              showCover={showCover}
              coverTitle={coverTitle}
              coverSubtitle={coverSubtitle}
              coverEdition={coverEdition}
              />
          : <p className="EP_Musikisum_Flipbook_Empty">{t('noPages')}</p>}
      </div>
    </div>
  );
}

FlipbookDisplay.propTypes = {
  ...sectionDisplayProps
};
