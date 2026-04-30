import FlipbookInfo from './flipbook-info.js';
import { beforeEach, describe, expect, it } from 'vitest';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';

describe('flipbook-info', () => {
  let sut;

  beforeEach(() => {
    sut = new FlipbookInfo(new GithubFlavoredMarkdown());
  });

  describe('redactContent', () => {
    it('redacts room-media image resources from different rooms', () => {
      const result = sut.redactContent({
        pages: [{ type: 'image', image: 'cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png' }]
      }, 'rebhjf4MLq7yjeoCnYfn7E');
      expect(result).toStrictEqual({
        pages: [{ type: 'image', image: '' }]
      });
    });

    it('leaves room-media image resources from the same room intact', () => {
      const result = sut.redactContent({
        pages: [{ type: 'image', image: 'cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png' }]
      }, '63cHjt3BAhGnNxzJGrTsN1');
      expect(result).toStrictEqual({
        pages: [{ type: 'image', image: 'cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png' }]
      });
    });

    it('leaves non room-media resources intact', () => {
      const result = sut.redactContent({
        pages: [{ type: 'image', image: 'cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png' }]
      }, 'rebhjf4MLq7yjeoCnYfn7E');
      expect(result).toStrictEqual({
        pages: [{ type: 'image', image: 'cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png' }]
      });
    });
  });

  describe('getCdnResources', () => {
    it('returns CDN image resources from pages', () => {
      const result = sut.getCdnResources({
        pages: [
          { type: 'image', image: 'cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png' },
          { type: 'image', image: 'cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png' },
          { type: 'text', text: 'Hello' }
        ]
      });
      expect(result).toStrictEqual([
        'cdn://media-library/JgTaqob5vqosBiHsZZoh1/some-image.png',
        'cdn://room-media/63cHjt3BAhGnNxzJGrTsN1/some-image.png'
      ]);
    });
  });
});
