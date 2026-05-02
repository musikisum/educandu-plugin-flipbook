import PropTypes from 'prop-types';
import PageFlipModule from 'page-flip';
import React, { useEffect, useRef, useState } from 'react';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { getAccessibleUrl } from '@educandu/educandu/utils/source-utils.js';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';

const { PageFlip } = PageFlipModule;

const MIN_PAGES = 4;

function createPadPage(index) {
  return { key: `__pad_${index}`, type: 'image', image: '', text: '' };
}

export default function FlipbookPageFlip({ pages, height, showCover, coverTitle, coverSubtitle, coverEdition }) {
  const containerRef = useRef(null);
  const pageFlipRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const clientConfig = useService(ClientConfig);
  const gfm = useService(GithubFlavoredMarkdown);

  const pagesKey = [
    pages.map(p => `${p.key}:${p.type}:${p.image}:${p.text}`).join('|'),
    String(showCover),
    coverTitle,
    coverSubtitle,
    coverEdition
  ].join('||');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const coverCount = showCover ? 2 : 0;
    const minContentPages = Math.max(0, MIN_PAGES - coverCount);
    const paddedPages = pages.length >= minContentPages
      ? pages
      : [...pages, ...Array.from({ length: minContentPages - pages.length }, (_, i) => createPadPage(i))];

    container.innerHTML = '';
    const bookEl = document.createElement('div');
    container.appendChild(bookEl);

    const buildFrontCoverEl = () => {
      const el = document.createElement('div');
      el.className = 'EP_Musikisum_Flipbook_Page EP_Musikisum_Flipbook_Cover EP_Musikisum_Flipbook_Cover--front';
      el.dataset.density = 'hard';

      const contentEl = document.createElement('div');
      contentEl.className = 'EP_Musikisum_Flipbook_CoverContent';

      if (coverTitle) {
        const titleEl = document.createElement('div');
        titleEl.className = 'EP_Musikisum_Flipbook_CoverTitle';
        titleEl.innerHTML = gfm.render(coverTitle, { cdnRootUrl: clientConfig.cdnRootUrl });
        contentEl.appendChild(titleEl);
      }

      if (coverSubtitle) {
        const subtitleEl = document.createElement('div');
        subtitleEl.className = 'EP_Musikisum_Flipbook_CoverSubtitle Markdown';
        subtitleEl.innerHTML = gfm.render(coverSubtitle, { cdnRootUrl: clientConfig.cdnRootUrl, renderMedia: true });
        contentEl.appendChild(subtitleEl);
      }

      if (coverEdition) {
        const editionEl = document.createElement('div');
        editionEl.className = 'EP_Musikisum_Flipbook_CoverEdition';
        editionEl.textContent = coverEdition;
        contentEl.appendChild(editionEl);
      }

      el.appendChild(contentEl);
      return el;
    };

    const buildBackCoverEl = () => {
      const el = document.createElement('div');
      el.className = 'EP_Musikisum_Flipbook_Page EP_Musikisum_Flipbook_Cover EP_Musikisum_Flipbook_Cover--back';
      el.dataset.density = 'hard';

      const contentEl = document.createElement('div');
      contentEl.className = 'EP_Musikisum_Flipbook_CoverContent';

      const omaEl = document.createElement('div');
      omaEl.className = 'EP_Musikisum_Flipbook_CoverOma';
      omaEl.textContent = 'openmusic.academy';
      contentEl.appendChild(omaEl);

      el.appendChild(contentEl);
      return el;
    };

    if (showCover) {
      bookEl.appendChild(buildFrontCoverEl());
    }

    paddedPages.forEach(page => {
      const el = document.createElement('div');
      el.className = 'EP_Musikisum_Flipbook_Page';
      if (page.type === 'text' || page.type === 'image+text') {
        el.style.background = '#f9f6ee';
      }

      if ((page.type === 'image' || page.type === 'image+text') && page.image) {
        const img = document.createElement('img');
        img.src = getAccessibleUrl({ url: page.image, cdnRootUrl: clientConfig.cdnRootUrl });
        img.alt = '';
        el.appendChild(img);
      }

      if ((page.type === 'text' || page.type === 'image+text') && page.text) {
        const textEl = document.createElement('div');
        textEl.className = 'EP_Musikisum_Flipbook_PageText Markdown';
        textEl.innerHTML = gfm.render(page.text, { cdnRootUrl: clientConfig.cdnRootUrl, renderMedia: true });
        el.appendChild(textEl);
      }

      bookEl.appendChild(el);
    });

    if (showCover) {
      bookEl.appendChild(buildBackCoverEl());
    }

    setTotalPages(coverCount + paddedPages.length);

    const pageFlip = new PageFlip(bookEl, {
      width: 400,
      height: height ?? 550,
      size: 'stretch',
      minWidth: 100,
      maxWidth: 1000,
      usePortrait: true,
      showCover: !!showCover,
      mobileScrollSupport: true,
    });

    pageFlip.loadFromHTML(bookEl.querySelectorAll('.EP_Musikisum_Flipbook_Page'));
    pageFlip.on('flip', e => setCurrentPage(e.data));
    pageFlipRef.current = pageFlip;

    return () => {
      pageFlip.destroy();
      pageFlipRef.current = null;
      setCurrentPage(0);
      setTotalPages(0);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesKey, height, clientConfig, gfm]);

  return (
    <div className="EP_Musikisum_Flipbook_Container">
      <div ref={containerRef} className="EP_Musikisum_Flipbook_Book" />
      {!!(pages.length || showCover) && (
        <div className="EP_Musikisum_Flipbook_Controls">
          <button
            className="EP_Musikisum_Flipbook_NavBtn"
            disabled={currentPage === 0}
            onClick={() => pageFlipRef.current?.flipPrev()}
            >
            ‹
          </button>
          <span className="EP_Musikisum_Flipbook_PageIndicator">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className="EP_Musikisum_Flipbook_NavBtn"
            disabled={currentPage >= totalPages - 1}
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
  showCover: PropTypes.bool,
  coverTitle: PropTypes.string,
  coverSubtitle: PropTypes.string,
  coverEdition: PropTypes.string,
  pages: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['image', 'text', 'image+text']).isRequired,
    image: PropTypes.string,
    text: PropTypes.string
  })).isRequired
};
