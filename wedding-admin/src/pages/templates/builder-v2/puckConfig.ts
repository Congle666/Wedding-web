/**
 * Puck editor configuration — maps each BlockType to a Puck component with
 * default props, fields, and renderer. Puck handles:
 *   - Sidebar block library (drag to add)
 *   - Block reorder via DnD
 *   - JSON state serialization (maps to BuilderConfig.blocks[])
 *   - Undo/redo
 *
 * Element-level DnD WITHIN each block is handled by @dnd-kit (Phase 04).
 */

import type { Config } from '@measured/puck';
import {
  CoverBlockRenderer,
  HeroBlockRenderer,
  FamilyBlockRenderer,
  CeremonyBlockRenderer,
  CountdownBlockRenderer,
  GalleryBlockRenderer,
  WishesBlockRenderer,
  BankBlockRenderer,
  FooterBlockRenderer,
} from './blockRenderers';

/**
 * Puck component config. Each key = BlockType string used in BuilderConfig.
 * `defaultProps` will be populated with full element lists in Phase 07 (preset system).
 */
export const puckConfig: Config = {
  components: {
    'cover-songphung': {
      label: 'Bìa thiệp (Song Phụng)',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: CoverBlockRenderer as any,
    },
    'hero-songphung': {
      label: 'Hero (Song Phụng)',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: HeroBlockRenderer as any,
    },
    'family-default': {
      label: 'Gia đình',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: FamilyBlockRenderer as any,
    },
    'ceremony-default': {
      label: 'Lễ cưới',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: CeremonyBlockRenderer as any,
    },
    'countdown-default': {
      label: 'Đếm ngược',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: CountdownBlockRenderer as any,
    },
    'gallery-default': {
      label: 'Album ảnh',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: GalleryBlockRenderer as any,
    },
    'wishes-default': {
      label: 'Sổ lưu bút',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: WishesBlockRenderer as any,
    },
    'bank-default': {
      label: 'Mừng cưới',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: BankBlockRenderer as any,
    },
    'footer-default': {
      label: 'Footer',
      defaultProps: {
        elements: [],
        settings: {},
      },
      render: FooterBlockRenderer as any,
    },
  },
};
