import React, { useState } from 'react';
import { buildUpiUri, generateQrMatrix } from '../../services/upi';
import { Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';

interface UpiQrCodeProps {
  upiId: string;
  name: string;
  amount?: number;
  studentName?: string;
  month?: string;
  size?: number;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  name,
  amount,
  studentName,
  month,
  size = 200,
}) => {
  const [copied, setCopied] = useState(false);

  const note = studentName
    ? `Tuition Fee - ${studentName}${month ? ' ' + month : ''}`
    : 'Tuition Fee Payment';

  const upiUri = buildUpiUri({
    upiId,
    name,
    amount,
    transactionNote: note,
  });

  const matrix = generateQrMatrix(upiUri);
  const matrixSize = matrix.length;
  const cellSize = size / matrixSize;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayNow = () => {
    window.location.href = upiUri;
  };

  return (
    <div className="flex flex-col items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mx-auto">
      {/* Header Info */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
          <QrIcon className="w-3.5 h-3.5" />
          <span>BHIM UPI Instant Payment</span>
        </div>
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        {amount && (
          <p className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5 tabular-nums">
            ₹{amount.toLocaleString('en-IN')}
          </p>
        )}
        {studentName && (
          <p className="text-xs text-slate-500 mt-0.5">For {studentName}</p>
        )}
      </div>

      {/* QR Code Container */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner flex items-center justify-center relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-lg"
          role="img"
          aria-label="UPI Payment QR Code"
        >
          <rect width={size} height={size} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((col, c) =>
              col ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.5}
                  height={cellSize + 0.5}
                  fill="#0f172a"
                />
              ) : null
            )
          )}
        </svg>

        {/* Center UPI Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-sm text-[10px] font-bold text-indigo-700 tracking-wider">
            UPI
          </div>
        </div>
      </div>

      {/* Supported Apps strip */}
      <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
        <span>GPay</span>
        <span>·</span>
        <span>PhonePe</span>
        <span>·</span>
        <span>Paytm</span>
        <span>·</span>
        <span>BHIM</span>
        <span>·</span>
        <span>Any UPI</span>
      </div>

      {/* UPI ID with copy button */}
      <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-3.5 text-xs">
        <div className="truncate mr-2">
          <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">UPI ID</span>
          <span className="font-mono font-semibold text-slate-800 select-all">{upiId}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Pay directly on mobile CTA */}
      <button
        type="button"
        onClick={handlePayNow}
        className="w-full mt-3 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Pay via Installed UPI App</span>
      </button>
    </div>
  );
};
