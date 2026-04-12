'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import type { BankAccount } from '@/app/w/[slug]/page';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  bankAccounts: BankAccount[];
  groomName: string;
  brideName: string;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

const BANK_CODE_MAP: Record<string, string> = {
  'vietcombank': 'VCB',
  'techcombank': 'TCB',
  'vib': 'VIB',
  'vietinbank': 'CTG',
  'bidv': 'BIDV',
  'acb': 'ACB',
  'tpbank': 'TPB',
  'mbbank': 'MB',
  'mb bank': 'MB',
  'mb': 'MB',
  'sacombank': 'STB',
  'vpbank': 'VPB',
  'agribank': 'AGR',
  'shb': 'SHB',
  'oceanbank': 'OCB',
  'ocb': 'OCB',
  'hdbank': 'HDB',
  'eximbank': 'EIB',
  'msb': 'MSB',
  'seabank': 'SEAB',
  'nama bank': 'NAMA',
  'lienvietpostbank': 'LPB',
  'pvcombank': 'PVC',
  'baovietbank': 'BVB',
  'dongabank': 'DAB',
  'abbank': 'ABB',
  'namabank': 'NAMA',
  'kienlongbank': 'KLB',
  'pgbank': 'PGB',
  'bacabank': 'BAB',
  'vietabank': 'VAB',
  'vietbank': 'VBB',
  'cbbank': 'CBB',
  'gpbank': 'GPB',
  'saigonbank': 'SGB',
  'banvietbank': 'BVB',
};

function getBankCode(bankName: string): string | null {
  const normalized = bankName.toLowerCase().trim();
  if (BANK_CODE_MAP[normalized]) return BANK_CODE_MAP[normalized];
  for (const [key, code] of Object.entries(BANK_CODE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return code;
  }
  return null;
}

function getQrUrl(bankName: string, accountNumber: string): string | null {
  const bankCode = getBankCode(bankName);
  if (!bankCode) return null;
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.png`;
}

function BankCard({
  account,
  label,
  index,
  isInView,
}: {
  account: BankAccount;
  label: string;
  index: number;
  isInView: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const qrUrl = getQrUrl(account.bank, account.account);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(account.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = account.account;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [account.account]);

  const handleDownloadQr = useCallback(async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${account.bank}_${account.account}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, '_blank');
    }
  }, [qrUrl, account.bank, account.account]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
      style={{
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 30,
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18,
          color: '#5F191D',
          fontWeight: 700,
          marginBottom: 15,
        }}
      >
        {label} - {account.name}
      </p>

      {qrUrl && (
        <div style={{ marginBottom: 15 }}>
          <Image
            src={qrUrl}
            alt={`Mã QR chuyển khoản ${account.bank}`}
            width={180}
            height={180}
            style={{
              width: 180,
              height: 180,
              borderRadius: 5,
              border: '1px solid #eee',
              objectFit: 'contain',
            }}
            unoptimized
          />
        </div>
      )}

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14,
          color: '#333',
          lineHeight: 1.5,
          marginBottom: 15,
        }}
      >
        <p style={{ margin: '2px 0' }}>{account.bank}</p>
        <p style={{ margin: '2px 0' }}>{account.account}</p>
        <p style={{ margin: '2px 0' }}>{account.name}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleCopy}
          style={{
            backgroundColor: copied ? '#2D8B3A' : '#EFEFEF',
            color: copied ? '#fff' : '#5F191D',
            border: '1px solid #ccc',
            borderRadius: 20,
            padding: '8px 18px',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          {copied ? '✓ Đã sao chép' : 'Sao chép'}
        </button>

        {qrUrl && (
          <button
            onClick={handleDownloadQr}
            style={{
              backgroundColor: '#EFEFEF',
              color: '#5F191D',
              border: '1px solid #ccc',
              borderRadius: 20,
              padding: '8px 18px',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DDD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EFEFEF';
            }}
          >
            Lưu QR
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function BankSection({
  bankAccounts,
  groomName,
  brideName,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const bankAssets: any = (cfg.assets as any).bank || {};
  const flowerAsset = bankAssets.flower || '/themes/songphung-red/flower.webp';
  const sectionTitle = cfg.text_samples.bank?.section_title || '';
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  if (!bankAccounts || bankAccounts.length === 0) return null;

  const getLabel = (index: number): string => {
    if (index === 0) return 'Chú Rể';
    if (index === 1) return 'Cô Dâu';
    return '';
  };

  return (
    <section
      ref={ref}
      style={{
        padding: '72px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background - flower LEFT */}
      <EditableSlot
        section="bank"
        slot="flower"
        variant="absolute"
        editMode={editMode}
        hint="Đổi hoa decor (Mừng cưới)"
        style={{
          bottom: -40,
          left: -80,
          width: 350,
          opacity: 0.30,
          zIndex: 0,
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <Image
          src={flowerAsset}
          alt=""
          width={350}
          height={350}
          style={{ width: '100%', height: 'auto' }}
          unoptimized={flowerAsset.startsWith('/uploads/')}
        />
      </EditableSlot>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        layout={false}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 24,
          fontWeight: 700,
          color: '#5F191D',
          textAlign: 'center',
          marginBottom: 30,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <EditableText
          section="bank"
          slot="section_title"
          value={sectionTitle}
          fallback="Hộp Mừng Cưới"
          editMode={editMode}
        />
      </motion.h2>

      {/* Bank cards */}
      <div
        className="sp-bank-grid"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 50,
          marginBottom: 50,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {bankAccounts.map((account, i) => (
          <BankCard
            key={i}
            account={account}
            label={getLabel(i)}
            index={i}
            isInView={isInView}
          />
        ))}
      </div>
    </section>
  );
}
