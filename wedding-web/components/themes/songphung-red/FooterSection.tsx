'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableText } from './editModeHelpers';

interface Props {
  groomName: string;
  brideName: string;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

export default function FooterSection({
  groomName,
  brideName,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const primary = cfg.colors.primary;
  const bg = cfg.colors.background;
  const fontHeading = `'${cfg.fonts.heading}', serif`;
  const fontBody = `'${cfg.fonts.body}', sans-serif`;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <footer
      ref={ref}
      style={{
        position: 'relative',
        backgroundColor: primary,
        padding: '64px 24px 40px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        layout={false}
        style={{
          fontFamily: fontHeading,
          fontSize: 18,
          fontStyle: 'italic',
          color: bg,
          marginBottom: 40,
          lineHeight: 1.6,
          maxWidth: 800,
          marginLeft: 'auto',
          marginRight: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <EditableText
          section="footer"
          slot="thank_you_text"
          value={(cfg.text_samples as any).footer?.thank_you_text || ''}
          fallback="Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!"
          editMode={editMode}
        />
      </motion.p>

      <p
        style={{
          fontFamily: fontBody,
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Thiết kế bởi{' '}
        <a
          href="https://juntech.vn"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'rgba(200,150,60,0.6)',
            textDecoration: 'none',
          }}
        >
          juntech.vn
        </a>
      </p>
    </footer>
  );
}
