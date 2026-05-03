import abcjs from 'abcjs';
import PropTypes from 'prop-types';
import PageFlipModule from 'page-flip';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { MEDIA_SCREEN_MODE } from '@educandu/educandu/domain/constants.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { getAccessibleUrl } from '@educandu/educandu/utils/source-utils.js';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';
import MediaPlayer from '@educandu/educandu/components/media-player/media-player.js';

const ABC_OPTIONS = { paddingtop: 0, paddingbottom: 10, paddingright: 0, paddingleft: 0, responsive: 'resize' };

const { PageFlip } = PageFlipModule;

const MIN_PAGES = 4;

function createPadPage(index) {
  return { key: `__pad_${index}`, type: 'image', image: '', text: '' };
}

export default function FlipbookPageFlip({ pages, height, showCover, coverTitle, coverSubtitle, coverEdition, audioUrl, audioPlaybackRange, audioWidth, audioTimecodes }) {
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const printContainerRef = useRef(null);
  const pageFlipRef = useRef(null);
  const currentPageRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const clientConfig = useService(ClientConfig);
  const gfm = useService(GithubFlavoredMarkdown);
  const { t } = useTranslation('musikisum/educandu-plugin-flipbook');

  const handlePrint = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.classList.add('EP_Musikisum_Flipbook_IsPrinting');
      const cleanup = () => {
        wrapper.classList.remove('EP_Musikisum_Flipbook_IsPrinting');
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
    }
    window.print();
  }, []);

  const pagesKey = [
    pages.map(p => `${p.key}:${p.type}:${p.image}:${p.text}:${p.markdown ?? ''}:${p.imagePosition ?? ''}:${p.imageSize ?? ''}`).join('|'),
    String(showCover),
    coverTitle,
    coverSubtitle,
    coverEdition
  ].join('||');

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const handleProgress = useCallback(progressMs => {
    if (!audioTimecodes?.length) {
      return;
    }
    const progressSecs = progressMs / 1000;
    const coverOffset = showCover ? 2 : 0;
    let targetContentPage = 0;
    for (let i = 0; i < audioTimecodes.length; i += 1) {
      if (audioTimecodes[i] !== null && progressSecs >= audioTimecodes[i]) {
        targetContentPage = i;
      }
    }
    const targetFlipPage = targetContentPage + coverOffset;
    if (targetFlipPage !== currentPageRef.current) {
      currentPageRef.current = targetFlipPage;
      pageFlipRef.current?.flip(targetFlipPage);
    }
  }, [audioTimecodes, showCover]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return () => {};
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

    const abcRenderQueue = [];

    paddedPages.forEach(page => {
      const el = document.createElement('div');
      el.className = 'EP_Musikisum_Flipbook_Page';
      if (page.type === 'text' || page.type === 'image+text' || page.type === 'abc') {
        el.style.background = '#f9f6ee';
      }

      if (page.type === 'image' && page.image) {
        const img = document.createElement('img');
        img.src = getAccessibleUrl({ url: page.image, cdnRootUrl: clientConfig.cdnRootUrl });
        img.alt = '';
        el.appendChild(img);
      }

      if (page.type === 'text' && page.text) {
        const textEl = document.createElement('div');
        textEl.className = 'EP_Musikisum_Flipbook_PageText Markdown';
        textEl.innerHTML = gfm.render(page.text, { cdnRootUrl: clientConfig.cdnRootUrl, renderMedia: true });
        el.appendChild(textEl);
      }

      if (page.type === 'image+text') {
        const imagePosition = page.imagePosition ?? 'none';
        const imageSize = page.imageSize ?? 100;
        const isFloat = imagePosition === 'left' || imagePosition === 'right';

        const layoutEl = document.createElement('div');
        layoutEl.className = `EP_Musikisum_Flipbook_PageImageText${  isFloat ? '' : ' EP_Musikisum_Flipbook_PageImageText--column'}`;

        const makeImg = () => {
          if (!page.image) {return null;}
          const img = document.createElement('img');
          img.src = getAccessibleUrl({ url: page.image, cdnRootUrl: clientConfig.cdnRootUrl });
          img.alt = '';
          img.style.width = `${imageSize}%`;
          if (isFloat) {
            img.style.float = imagePosition;
            img.style.marginRight = imagePosition === 'left' ? '20px' : '0';
            img.style.marginLeft = imagePosition === 'right' ? '20px' : '0';
            img.style.marginBottom = '16px';
          } else {
            img.style.display = 'block';
            img.style.margin = '0 auto';
          }
          return img;
        };

        const appendText = text => {
          if (text.trim()) {
            if (isFloat) {
              const temp = document.createElement('div');
              temp.innerHTML = gfm.render(text, { cdnRootUrl: clientConfig.cdnRootUrl, renderMedia: true });
              while (temp.firstChild) {layoutEl.appendChild(temp.firstChild);}
            } else {
              const textEl = document.createElement('div');
              textEl.className = 'EP_Musikisum_Flipbook_PageImageTextContent Markdown';
              textEl.innerHTML = gfm.render(text, { cdnRootUrl: clientConfig.cdnRootUrl, renderMedia: true });
              layoutEl.appendChild(textEl);
            }
          }
        };

        const markdownText = page.text ?? '';
        const parts = markdownText.split('@IMG');

        if (parts.length > 1) {
          appendText(parts[0]);
          const img = makeImg();
          if (img) {layoutEl.appendChild(img);}
          appendText(parts[1]);
        } else {
          const img = makeImg();
          if (img) {layoutEl.appendChild(img);}
          appendText(markdownText);
        }

        if (isFloat) {
          const clearEl = document.createElement('div');
          clearEl.style.clear = 'both';
          layoutEl.appendChild(clearEl);
        }

        el.appendChild(layoutEl);
      }

      if (page.type === 'abc') {
        const layoutEl = document.createElement('div');
        layoutEl.className = 'EP_Musikisum_Flipbook_PageAbcLayout';

        const notationEl = document.createElement('div');
        notationEl.className = 'EP_Musikisum_Flipbook_PageAbcNotation';
        notationEl.style.background = '#f9f6ee';

        const markdownText = page.markdown ?? '';
        const parts = markdownText.split('@ABC');

        const makeTextEl = text => {
          const div = document.createElement('div');
          div.className = 'EP_Musikisum_Flipbook_PageAbcText Markdown';
          div.innerHTML = gfm.render(text, { cdnRootUrl: clientConfig.cdnRootUrl, renderMedia: true });
          return div;
        };

        if (parts.length > 1) {
          if (parts[0].trim()) {layoutEl.appendChild(makeTextEl(parts[0]));}
          layoutEl.appendChild(notationEl);
          if (parts[1].trim()) {layoutEl.appendChild(makeTextEl(parts[1]));}
        } else {
          layoutEl.appendChild(notationEl);
          if (markdownText.trim()) {layoutEl.appendChild(makeTextEl(markdownText));}
        }

        el.appendChild(layoutEl);

        if (page.text) {
          abcRenderQueue.push({ el: notationEl, code: page.text });
        }
      }

      bookEl.appendChild(el);
    });

    if (showCover) {
      bookEl.appendChild(buildBackCoverEl());
    }

    abcRenderQueue.forEach(({ el, code }) => abcjs.renderAbc(el, code, ABC_OPTIONS));

    const printContainer = printContainerRef.current;
    if (printContainer) {
      printContainer.innerHTML = '';
      bookEl.querySelectorAll('.EP_Musikisum_Flipbook_Page').forEach(pageEl => {
        printContainer.appendChild(pageEl.cloneNode(true));
      });
    }

    setTotalPages(coverCount + paddedPages.length);

    let pageFlip;
    try {
      pageFlip = new PageFlip(bookEl, {
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
    } catch (err) {
      console.error('[FlipbookPageFlip] page-flip initialization failed:', err);
      return () => {
        pageFlipRef.current = null;
        if (printContainerRef.current) {
          printContainerRef.current.innerHTML = '';
        }
      };
    }

    return () => {
      pageFlip.destroy();
      pageFlipRef.current = null;
      setCurrentPage(0);
      setTotalPages(0);
      if (printContainerRef.current) {
        printContainerRef.current.innerHTML = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesKey, height, clientConfig, gfm]);

  return (
    <div ref={wrapperRef} className="EP_Musikisum_Flipbook_Container">
      <div className="EP_Musikisum_Flipbook_BookArea">
        <div ref={containerRef} className="EP_Musikisum_Flipbook_Book" />
        {!!isPlaying && <div className="EP_Musikisum_Flipbook_PlayingOverlay" />}
      </div>
      {!!(pages.length || showCover) && (
        <div className="EP_Musikisum_Flipbook_Controls">
          <button
            type="button"
            className="EP_Musikisum_Flipbook_NavBtn"
            disabled={currentPage === 0 || isPlaying}
            onClick={() => pageFlipRef.current?.flipPrev()}
            >
            ‹
          </button>
          <span className="EP_Musikisum_Flipbook_PageIndicator">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="EP_Musikisum_Flipbook_NavBtn"
            disabled={currentPage >= totalPages - 1 || isPlaying}
            onClick={() => pageFlipRef.current?.flipNext()}
            >
            ›
          </button>
          <button
            type="button"
            className="EP_Musikisum_Flipbook_PrintBtn"
            onClick={handlePrint}
            >
            {t('printButton')}
          </button>
        </div>
      )}
      <div ref={printContainerRef} className="EP_Musikisum_Flipbook_PrintView" />
      {!!audioUrl && (
        <div className="EP_Musikisum_Flipbook_Audio" style={{ width: `${audioWidth}%` }}>
          <MediaPlayer
            sourceUrl={getAccessibleUrl({ url: audioUrl, cdnRootUrl: clientConfig.cdnRootUrl })}
            playbackRange={audioPlaybackRange}
            screenMode={MEDIA_SCREEN_MODE.none}
            onProgress={handleProgress}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            allowLoop
            allowPlaybackRate
            />
        </div>
      )}
    </div>
  );
}

FlipbookPageFlip.defaultProps = {
  height: 550,
  showCover: false,
  coverTitle: '',
  coverSubtitle: '',
  coverEdition: '',
  audioUrl: '',
  audioPlaybackRange: [0, 1],
  audioWidth: 100,
  audioTimecodes: []
};

FlipbookPageFlip.propTypes = {
  height: PropTypes.number,
  showCover: PropTypes.bool,
  coverTitle: PropTypes.string,
  coverSubtitle: PropTypes.string,
  coverEdition: PropTypes.string,
  audioUrl: PropTypes.string,
  audioPlaybackRange: PropTypes.arrayOf(PropTypes.number),
  audioWidth: PropTypes.number,
  audioTimecodes: PropTypes.arrayOf(PropTypes.number),
  pages: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['image', 'text', 'image+text', 'abc']).isRequired,
    image: PropTypes.string,
    text: PropTypes.string
  })).isRequired
};
