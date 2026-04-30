import React from 'react';
import { sectionDisplayProps } from '@educandu/educandu/ui/default-prop-types.js';

export default function FlipbookDisplay({ content }) {
  return (
    <div className="EP_Musikisum_Flipbook_Display">
      <div className={`u-horizontally-centered u-width-${content.width}`}>
        <p>FlipBook – {content.pages.length} Seiten</p>
      </div>
    </div>
  );
}

FlipbookDisplay.propTypes = {
  ...sectionDisplayProps
};
