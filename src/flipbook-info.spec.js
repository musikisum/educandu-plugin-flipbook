import FlipbookInfo from './flipbook-info.js';
import { beforeEach, describe, expect, it } from 'vitest';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';

const ROOM_A = '63cHjt3BAhGnNxzJGrTsN1';
const ROOM_B = 'rebhjf4MLq7yjeoCnYfn7E';
const IMG_ROOM_A = `cdn://room-media/${ROOM_A}/some-image.png`;
const IMG_ROOM_B = `cdn://room-media/${ROOM_B}/some-image.png`;
const IMG_LIBRARY = 'cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png';

describe('flipbook-info', () => {
  let sut;

  beforeEach(() => {
    sut = new FlipbookInfo(new GithubFlavoredMarkdown());
  });

  describe('validateContent', () => {
    it('accepts minimal valid content', () => {
      expect(() => sut.validateContent({ pages: [], width: 100 })).not.toThrow();
    });

    it('accepts a valid abc page with optional fields', () => {
      expect(() => sut.validateContent({
        pages: [{ key: 'k1', type: 'abc', text: 'X:1\nK:C', markdown: 'Example:', abcSize: 60, abcPosition: 'top' }],
        width: 100
      })).not.toThrow();
    });

    it('accepts a valid image+text page with imagePosition and imageSize', () => {
      expect(() => sut.validateContent({
        pages: [{ key: 'k1', type: 'image+text', image: IMG_LIBRARY, text: 'Caption', imagePosition: 'left', imageSize: 40 }],
        width: 100
      })).not.toThrow();
    });

    it('accepts a full cover configuration', () => {
      expect(() => sut.validateContent({
        pages: [],
        width: 100,
        showCover: true,
        coverTitle: '# My Book',
        coverSubtitle: 'A subtitle',
        coverEdition: '2nd Edition'
      })).not.toThrow();
    });

    it('allows unknown top-level fields for backward compatibility', () => {
      expect(() => sut.validateContent({ pages: [], width: 100, unknownField: 'value' })).not.toThrow();
    });

    it('rejects unknown page type', () => {
      expect(() => sut.validateContent({ pages: [{ key: 'k1', type: 'video' }], width: 100 })).toThrow();
    });

    it('rejects page without key', () => {
      expect(() => sut.validateContent({ pages: [{ type: 'image' }], width: 100 })).toThrow();
    });

    it('rejects width above maximum', () => {
      expect(() => sut.validateContent({ pages: [], width: 200 })).toThrow();
    });
  });

  describe('redactContent', () => {
    it('redacts room-media image from a different room', () => {
      const result = sut.redactContent({
        pages: [{ type: 'image', image: IMG_ROOM_A }],
        coverTitle: '',
        coverSubtitle: ''
      }, ROOM_B);
      expect(result.pages[0].image).toBe('');
    });

    it('keeps room-media image from the same room', () => {
      const result = sut.redactContent({
        pages: [{ type: 'image', image: IMG_ROOM_A }],
        coverTitle: '',
        coverSubtitle: ''
      }, ROOM_A);
      expect(result.pages[0].image).toBe(IMG_ROOM_A);
    });

    it('keeps media-library image regardless of room', () => {
      const result = sut.redactContent({
        pages: [{ type: 'image', image: IMG_LIBRARY }],
        coverTitle: '',
        coverSubtitle: ''
      }, ROOM_B);
      expect(result.pages[0].image).toBe(IMG_LIBRARY);
    });

    it('redacts room-media URL embedded in page.markdown', () => {
      const result = sut.redactContent({
        pages: [{ type: 'abc', text: 'X:1', markdown: `![](${IMG_ROOM_A})` }],
        coverTitle: '',
        coverSubtitle: ''
      }, ROOM_B);
      expect(result.pages[0].markdown).not.toContain(IMG_ROOM_A);
    });

    it('redacts room-media URL embedded in coverTitle', () => {
      const result = sut.redactContent({
        pages: [],
        coverTitle: `![](${IMG_ROOM_A})`,
        coverSubtitle: ''
      }, ROOM_B);
      expect(result.coverTitle).not.toContain(IMG_ROOM_A);
    });

    it('redacts room-media URL embedded in coverSubtitle', () => {
      const result = sut.redactContent({
        pages: [],
        coverTitle: '',
        coverSubtitle: `![](${IMG_ROOM_A})`
      }, ROOM_B);
      expect(result.coverSubtitle).not.toContain(IMG_ROOM_A);
    });

    it('does not mutate the original content object', () => {
      const content = {
        pages: [{ type: 'image', image: IMG_ROOM_A }],
        coverTitle: '',
        coverSubtitle: ''
      };
      sut.redactContent(content, ROOM_B);
      expect(content.pages[0].image).toBe(IMG_ROOM_A);
    });
  });

  describe('getCdnResources', () => {
    it('returns image URLs from image pages', () => {
      const result = sut.getCdnResources({
        pages: [
          { type: 'image', image: IMG_LIBRARY },
          { type: 'image', image: IMG_ROOM_A },
          { type: 'text', text: 'Hello' }
        ],
        coverTitle: '',
        coverSubtitle: ''
      });
      expect(result).toStrictEqual([IMG_LIBRARY, IMG_ROOM_A]);
    });

    it('returns CDN URLs embedded in page.markdown', () => {
      const result = sut.getCdnResources({
        pages: [{ type: 'abc', text: 'X:1', markdown: `![](${IMG_ROOM_A})` }],
        coverTitle: '',
        coverSubtitle: ''
      });
      expect(result).toContain(IMG_ROOM_A);
    });

    it('returns CDN URLs embedded in coverTitle', () => {
      const result = sut.getCdnResources({
        pages: [],
        coverTitle: `![](${IMG_LIBRARY})`,
        coverSubtitle: ''
      });
      expect(result).toContain(IMG_LIBRARY);
    });

    it('returns CDN URLs embedded in coverSubtitle', () => {
      const result = sut.getCdnResources({
        pages: [],
        coverTitle: '',
        coverSubtitle: `![](${IMG_ROOM_B})`
      });
      expect(result).toContain(IMG_ROOM_B);
    });

    it('deduplicates resources that appear in multiple places', () => {
      const result = sut.getCdnResources({
        pages: [
          { type: 'image', image: IMG_LIBRARY },
          { type: 'image', image: IMG_LIBRARY }
        ],
        coverTitle: '',
        coverSubtitle: ''
      });
      expect(result.filter(r => r === IMG_LIBRARY)).toHaveLength(1);
    });

    it('filters out empty image strings', () => {
      const result = sut.getCdnResources({
        pages: [{ type: 'image', image: '' }],
        coverTitle: '',
        coverSubtitle: ''
      });
      expect(result).not.toContain('');
    });
  });
});
