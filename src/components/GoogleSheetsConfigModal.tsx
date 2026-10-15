import React, { useState, useEffect } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptCode';
import { X, Check, Copy, ExternalLink, RefreshCw, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface GoogleSheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GoogleSheetsConfigModal: React.FC<GoogleSheetsConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [url, setUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(googleSheetsService.getScriptUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    googleSheetsService.setScriptUrl(url);
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await googleSheetsService.login('0000000000', 'Test Connection', '9A');
      if (res.success) {
        setTestResult({ success: true, message: 'Kết nối Google Sheets thành công! Dữ liệu đã sẵn sàng.' });
        if (onSuccess) onSuccess();
      } else {
        setTestResult({ success: false, message: res.error || 'Chưa nhận được phản hồi từ Web App. Vui lòng kiểm tra lại URL /exec.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Không thể kết nối đến URL Web App.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl border border-[#E8DFC8] shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7D8876] hover:text-[#2D332A] hover:bg-[#F0EAE1] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#4B5D44] text-[#F7F3E9] flex items-center justify-center shadow-sm">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2D332A] font-serif">
              Đồng bộ Google Sheets (Google Apps Script)
            </h2>
            <p className="text-xs text-[#5C6B57]">
              Project ID: 1FOrI45Kkf0e7L6XyyuyHcwME5JJ6J4IRQ9tNdvIgaZC0dQ3g0qU9vQH2
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-xs text-[#2D332A]">
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DDD0]">
            <p className="font-bold text-sm text-[#4B5D44] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Các bước triển khai dành cho Giáo viên:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[#4B5547] leading-relaxed">
              <li>
                Mở dự án Apps Script:{' '}
                <a
                  href="https://script.google.com/u/0/home/projects/1FOrI45Kkf0e7L6XyyuyHcwME5JJ6J4IRQ9tNdvIgaZC0dQ3g0qU9vQH2/edit"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#8E5D32] underline inline-flex items-center gap-1"
                >
                  Mở Project Editor <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>
                Sao chép mã Apps Script bên dưới và dán thay thế toàn bộ mã trong file <code>Code.gs</code>.
              </li>
              <li>
                Bấm <strong>Deploy (Triển khai)</strong> &gt; <strong>New deployment (Triển khai mới)</strong> &gt; Chọn loại <strong>Web app</strong>.
              </li>
              <li>
                Cấu hình: <em>Execute as: <strong>Me</strong></em>, <em>Who has access: <strong>Anyone</strong> (Bất kỳ ai)</em>.
              </li>
              <li>
                Sao chép <strong>Web app URL (đuôi /exec)</strong> và dán vào ô bên dưới.
              </li>
            </ol>
          </div>

          {/* Copy script button */}
          <div>
            <button
              type="button"
              onClick={handleCopyScript}
              className="w-full py-2.5 px-4 bg-[#F2ECE1] hover:bg-[#EAE2D4] border border-[#DDD4C3] rounded-xl font-bold text-xs text-[#2D332A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Đã sao chép mã Apps Script vào Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#8E5D32]" />
                  <span>Sao chép toàn bộ mã Apps Script (Code.gs)</span>
                </>
              )}
            </button>
          </div>

          {/* Input Web App Exec URL */}
          <div className="pt-2">
            <label className="block font-bold text-xs text-[#2D332A] uppercase tracking-wider mb-1.5">
              URL Web App Apps Script (/exec)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-4 py-3 bg-white border border-[#DDD4C3] rounded-2xl text-xs font-mono text-[#2D332A] focus:border-[#4B5D44] focus:ring-2 focus:ring-[#4B5D44]/20 focus:outline-hidden"
            />
          </div>

          {/* Test connection results */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl flex items-start gap-2 text-xs font-medium ${
                testResult.success
                  ? 'bg-[#E8EFE6] text-[#384732] border border-[#C6D8C2]'
                  : 'bg-[#FDF2F0] text-[#A64B3B] border border-[#F5C7C0]'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <X className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isTesting || !url.trim()}
              className="flex-1 py-3 bg-[#4B5D44] hover:bg-[#3D4C37] text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra kết nối...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu và Kiểm Tra Kết Nối</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-white border border-[#DDD4C3] text-[#5C6B57] font-bold rounded-2xl hover:bg-[#FAF7F2] transition-colors text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
