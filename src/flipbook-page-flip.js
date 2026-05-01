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

  const structureKey = pages.map(p => `${p.key}:${p.type}`).join('|');

  // Full reinit only when page structure (count/type/order) or height changes.
  useEffect(() => {
    const container = containerRef.current;

    if (pageFlipRef.current) {
      pageFlipRef.current.destroy();
      pageFlipRef.current = null;
    }

    if (!container || !pages.length) {
      return;
    }

    container.innerHTML = '';

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

      container.appendChild(el);
    });

    const pageFlip = new PageFlip(container, {
      width: 400,
      height: height ?? 550,
      size: 'stretch',
      minWidth: 100,
      maxWidth: 1000,
      usePortrait: true,
      showCover: false,
      mobileScrollSupport: true,
    });

    pageFlip.loadFromHTML(container.querySelectorAll('.EP_Musikisum_Flipbook_Page'));
    pageFlip.on('flip', e => setCurrentPage(e.data));
    pageFlipRef.current = pageFlip;

    return () => {
      pageFlip.destroy();
      pageFlipRef.current = null;
    };
  // pages intentionally excluded: URL/text changes are handled by the effect below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureKey, height, clientConfig]);

  // Lightweight update: sync image URLs and text into existing page elements
  // without tearing down and recreating the page-flip instance.
  useEffect(() => {
    if (!pageFlipRef.current || !containerRef.current) {
      return;
    }

    const pageElements = containerRef.current.querySelectorAll('.EP_Musikisum_Flipbook_Page');

    pages.forEach((page, i) => {
      const el = pageElements[i];
      if (!el) {
        return;
      }

      const img = el.querySelector('img');
      if (page.image) {
        const src = getAccessibleUrl({ url: page.image, cdnRootUrl: clientConfig.cdnRootUrl });
        if (img) {
          img.src = src;
        } else {
          const newImg = document.createElement('img');
          newImg.src = src;
          newImg.alt = '';
          el.insertBefore(newImg, el.firstChild);
        }
      } else if (img) {
        img.remove();
      }

      const textEl = el.querySelector('.EP_Musikisum_Flipbook_PageText');
      if (page.text) {
        if (textEl) {
          textEl.textContent = page.text;
        } else {
          const newText = document.createElement('div');
          newText.className = 'EP_Musikisum_Flipbook_PageText';
          newText.textContent = page.text;
          el.appendChild(newText);
        }
      } else if (textEl) {
        textEl.remove();
      }
    });
  }, [pages, clientConfig]);

  if (!pages.length) {
    return null;
  }

  return (
    <div className="EP_Musikisum_Flipbook_Container">
      <div ref={containerRef} className="EP_Musikisum_Flipbook_Book" />
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
