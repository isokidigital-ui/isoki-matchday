import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Plus, CheckCircle2, Clock, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'motion/react';
import { LangType, TRANSLATIONS } from '../utils/lang';
import { useInvitationCodes, InvitationCode } from '../hooks/useInvitationCodes';

interface AdminInvitationCodesProps {
  clubId: string;
  lang: LangType;
}

export default function AdminInvitationCodes({ clubId, lang }: AdminInvitationCodesProps) {
  const t = TRANSLATIONS[lang];
  const invitationHook = useInvitationCodes();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [expireDays, setExpireDays] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load codes on mount
  useEffect(() => {
    loadCodes();
  }, [clubId]);

  const loadCodes = async () => {
    setIsLoading(true);
    const result = await invitationHook.getCodesByClub(clubId);
    if (result.success) {
      setCodes(result.codes);
    }
    setIsLoading(false);
  };

  const handleGenerateCode = async () => {
    setError('');
    setSuccess('');
    setIsGenerating(true);

    try {
      const expireInDays = expireDays ? parseInt(expireDays.toString()) : undefined;
      const result = await invitationHook.generateCode(clubId, maxUses, expireInDays);

      if (result.success) {
        setSuccess(lang === 'ID' ? 'Kode berhasil dibuat!' : 'Code generated successfully!');
        setMaxUses(1);
        setExpireDays('');
        await loadCodes();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeactivateCode = async (codeId: string) => {
    const result = await invitationHook.deactivateCode(codeId);
    if (result.success) {
      await loadCodes();
    } else {
      setError(result.message);
    }
  };

  const getStatusColor = (code: InvitationCode) => {
    if (!code.isActive) return 'text-gray-500';
    if (code.usedCount >= code.maxUses) return 'text-orange-400';
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) return 'text-red-400';
    return 'text-green-400';
  };

  const getStatusText = (code: InvitationCode): string => {
    if (!code.isActive) return lang === 'ID' ? 'Nonaktif' : 'Inactive';
    if (code.usedCount >= code.maxUses) return lang === 'ID' ? 'Habis' : 'Exhausted';
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) return lang === 'ID' ? 'Expired' : 'Expired';
    return lang === 'ID' ? 'Aktif' : 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            {lang === 'ID' ? 'Kelola Kode Undangan' : 'Manage Invitation Codes'}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {lang === 'ID' 
              ? 'Buat dan bagikan kode undangan untuk mengontrol pendaftaran klub baru.' 
              : 'Create and share invitation codes to control new club registrations.'}
          </p>
        </div>
      </div>

      {/* Generate New Code Section */}
      <div className="bg-[#111112] border border-white/5 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-400" />
          {lang === 'ID' ? 'Buat Kode Baru' : 'Generate New Code'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">
              {lang === 'ID' ? 'Maks Penggunaan' : 'Max Uses'}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">
              {lang === 'ID' ? 'Expire (Hari)' : 'Expire (Days)'}
            </label>
            <input
              type="number"
              min="1"
              max="365"
              placeholder={lang === 'ID' ? 'Kosong = Tidak expire' : 'Empty = No expiry'}
              value={expireDays}
              onChange={(e) => setExpireDays(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/5 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-green-400"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-green-400 hover:bg-green-500 text-black font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {lang === 'ID' ? 'Membuat...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {lang === 'ID' ? 'Buat' : 'Generate'}
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs text-red-400"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-950/20 border border-green-500/20 rounded-lg text-xs text-green-400"
          >
            ✓ {success}
          </motion.div>
        )}
      </div>

      {/* Codes List */}
      <div className="bg-[#111112] border border-white/5 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          {lang === 'ID' ? 'Daftar Kode' : 'Codes List'} ({codes.length})
        </h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">
            {lang === 'ID' ? 'Belum ada kode undangan.' : 'No invitation codes yet.'}
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-[#0a0a0b] border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm font-bold text-white">{code.code}</code>
                      <button
                        onClick={() => handleCopyCode(code.code)}
                        className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copiedCode === code.code ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs text-white/30 mt-1 space-y-0.5">
                      <p>
                        {lang === 'ID' ? 'Penggunaan:' : 'Uses:'} {code.usedCount}/{code.maxUses}
                        {code.expiresAt && ` • ${lang === 'ID' ? 'Expire:' : 'Expires:'} ${new Date(code.expiresAt).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US')}`}
                      </p>
                    </div>
                  </div>

                  <div className={`text-xs font-bold font-mono uppercase ${getStatusColor(code)}`}>
                    {getStatusText(code)}
                  </div>
                </div>

                {code.isActive && code.usedCount < code.maxUses && (
                  <button
                    onClick={() => handleDeactivateCode(code.id)}
                    className="ml-2 p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                    title={lang === 'ID' ? 'Nonaktifkan' : 'Deactivate'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
