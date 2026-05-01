import PropTypes from 'prop-types';
import PageFlipModule from 'page-flip';
import React, { useEffect, useRef, useState } from 'react';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { getAccessibleUrl } from '@educandu/educandu/utils/source-utils.js';

const { PageFlip } = PageFlipModule;

export default function FlipbookPageFlip({ pages, height }) {
  const containerRef = useRef(null);
  const pageFlipRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const clientConfig = useService(ClientConfig);

  const pagesKey = pages.map(p => `${p.key}:${p.type}:${p.image}:${p.text}`).join('|');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !pages.length) {
      return;
    }

    // Create a fresh element each time — reusing the same DOM node across
    // PageFlip instances causes silent init failures after the first destroy().
    container.innerHTML = '';
    const bookEl = document.createElement('div');
    container.appendChild(bookEl);

    pages.forEach(page => {
      const el = document.createElement('div');
      el.className = 'EP_Musikisum_Flipbook_Page';

      if ((page.type === 'image' || page.type === 'image+text') && page.image) {
        const img = document.createElement('img');
        img.src = getAccessibleUrl({ url: page.image, cdnRootUrl: clientConfig.cdnRootUrl });
        img.alt = '';
        el.appendChild(img);
      }

      if ((page.type === 'text' || page.type === 'image+text') && page.text) {
        const textEl = document.createElement('div');
        textEl.className = 'EP_Musikisum_Flipbook_PageText';
        textEl.textContent = page.text;
        el.appendChild(textEl);
      }

      bookEl.appendChild(el);
    });

    const pageFlip = new PageFlip(bookEl, {
      width: 400,
      height: height ?? 550,
      size: 'stretch',
      minWidth: 100,
      maxWidth: 1000,
      usePortrait: true,
      showCover: false,
      mobileScrollSupport: true,
    });

    pageFlip.loadFromHTML(bookEl.querySelectorAll('.EP_Musikisum_Flipbook_Page'));
    pageFlip.on('flip', e => setCurrentPage(e.data));
    pageFlipRef.current = pageFlip;

    return () => {
      pageFlip.destroy();
      pageFlipRef.current = null;
      setCurrentPage(0);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesKey, height, clientConfig]);

  return (
    <div className="EP_Musikisum_Flipbook_Container">
      <div ref={containerRef} className="EP_Musikisum_Flipbook_Book" />
      {!!pages.length && (
        <div className="EP_Musikisum_Flipbook_Controls">
          <button
            className="EP_Musikisum_Flipbook_NavBtn"
            disabled={currentPage === 0}
            onClick={() => pageFlipRef.current?.flipPrev()}
            >
            ‹
          </button>
          <span className="EP_Musikisum_Flipbook_PageIndicator">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            className="EP_Musikisum_Flipbook_NavBtn"
            disabled={currentPage >= pages.length - 1}
            onClick={() => pageFlipRef.current?.flipNext()}
            >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

FlipbookPageFlip.propTypes = {
  height: PropTypes.number,
  pages: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['image', 'text', 'image+text']).isRequired,
    image: PropTypes.string,
    text: PropTypes.string
  })).isRequired
};
