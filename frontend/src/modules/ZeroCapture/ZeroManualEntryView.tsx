import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Mic,
  MicOff,
  Upload,
  Scale,
  Barcode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  Radio,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Languages,
} from 'lucide-react';

export const ZeroManualEntryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'voice' | 'scanner' | 'scale' | 'barcode' | 'queue'>('voice');
  const [queue, setQueue] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Voice state
  const [language, setLanguage] = useState<'en' | 'hi' | 'gu'>('hi');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceResult, setVoiceResult] = useState<any>(null);

  // Scanner state
  const [scannerFile, setScannerFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  // Scale state
  const [scaleGross, setScaleGross] = useState<number>(14.85);
  const [scaleTare, setScaleTare] = useState<number>(0.0);
  const [scaleDescription, setScaleDescription] = useState<string>('22K Handcrafted Gold Ring');
  const [scaleMsg, setScaleMsg] = useState<string | null>(null);

  // Barcode state
  const [barcodeInput, setBarcodeInput] = useState<string>('CJ-G-RNG-1005');
  const [barcodeResult, setBarcodeResult] = useState<any>(null);

  // Reversal dialog
  const [reversalDocId, setReversalDocId] = useState<number | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/capture/queue?status=all');
      if (res.data.success) {
        setQueue(res.data.data);
        setPendingCount(res.data.pending_count);
      }
    } catch (err) {
      console.error('Failed to fetch approval queue:', err);
    }
  };

  // 1. Submit Voice Command
  const submitVoiceCommand = async (text: string, lang = language) => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await api.post('/capture/voice', { transcript: text, language: lang });
      if (res.data.success) {
        setVoiceResult(res.data.data);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle live mic (Web Speech API)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please click one of the quick test voice prompts.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      setIsListening(false);
      submitVoiceCommand(transcript, language);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 2. Upload Document Scan
  const handleUploadScan = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (scannerFile) {
        formData.append('file', scannerFile);
      }
      formData.append('source_type', 'invoice_scan');

      const res = await api.post('/capture/upload', formData);
      if (res.data.success) {
        setScanResult(res.data.data);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Ingest Weighing Scale
  const handleIngestScale = async () => {
    setLoading(true);
    setScaleMsg(null);
    try {
      const res = await api.post('/capture/scale', {
        gross_weight: scaleGross,
        tare_weight: scaleTare,
        item_description: scaleDescription,
      });
      if (res.data.success) {
        setScaleMsg('Scale reading recorded and sent to approval queue (Confidence: 99.8%)');
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Barcode Scan Lookup
  const handleBarcodeLookup = async () => {
    if (!barcodeInput) return;
    setLoading(true);
    try {
      const res = await api.post('/capture/barcode', { code: barcodeInput });
      setBarcodeResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Approve Captured Document
  const handleApprove = async (id: number) => {
    try {
      const res = await api.post(`/capture/${id}/approve`);
      if (res.data.success) {
        alert(res.data.message);
        fetchQueue();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  // Reject Captured Document
  const handleReject = async (id: number) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    try {
      const res = await api.post(`/capture/${id}/reject`, { reason });
      if (res.data.success) {
        alert('Document rejected.');
        fetchQueue();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  // Reverse Transaction
  const handleReverse = async (id: number) => {
    if (!reversalReason) {
      alert('Please state a reason for transaction reversal.');
      return;
    }
    try {
      const res = await api.post(`/capture/${id}/reverse`, { reason: reversalReason });
      if (res.data.success) {
        alert(res.data.message);
        setReversalDocId(null);
        setReversalReason('');
        fetchQueue();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Reversal failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E3DFD7] dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#111318] dark:text-[#F6F5F1]">
              Zero-Manual-Entry & Intelligent Data Capture
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#8B7CF6]" /> AI Autonomous
            </span>
          </div>
          <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-1">
            Multilingual voice commands, invoice image scanning, digital scale telemetry, and barcode lookups with human approval gates.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('queue')}
          className="px-4 py-2 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-[#111318]" />
          <span>Approval Queue ({pendingCount} Pending)</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E3DFD7] dark:border-white/10 pb-2">
        {[
          { id: 'voice', label: 'Voice Command Studio', icon: Mic },
          { id: 'scanner', label: 'Invoice & Bill Scanner', icon: Upload },
          { id: 'scale', label: 'Digital Weighing Scale', icon: Scale },
          { id: 'barcode', label: 'Barcode & RFID Scanner', icon: Barcode },
          { id: 'queue', label: `Approval & Audit Queue (${pendingCount})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'gold-gradient text-[#111318] font-bold shadow-sm'
                  : 'bg-[#FFFFFF] dark:bg-[#181A22] text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5 border border-[#E3DFD7] dark:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: VOICE COMMAND STUDIO
         ========================================================================= */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl p-6 border border-[#E3DFD7] dark:border-white/10 shadow-sm flex flex-col items-center text-center">
            {/* Language Selector */}
            <div className="flex items-center gap-2 mb-4">
              <Languages className="w-4 h-4 text-[#C9A34A]" />
              <span className="text-xs font-semibold text-[#5A5E6B] dark:text-[#A6AAB6]">Spoken Language:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'hi', label: 'हिन्दी (Hindi)' },
                  { id: 'gu', label: 'ગુજરાતી (Gujarati)' },
                  { id: 'en', label: 'English' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      language === l.id
                        ? 'gold-gradient text-[#111318] font-bold'
                        : 'bg-[#ECEAE4]/60 dark:bg-[#111318] text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#ECEAE4]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mic Button */}
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? 'violet-gradient text-white animate-pulse ring-8 ring-[#8B7CF6]/30'
                  : 'violet-gradient text-white hover:scale-105 shadow-md shadow-[#8B7CF6]/25'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </button>

            <p className="text-xs font-semibold text-gray-800 mt-4">
              {isListening ? 'Listening live... speak your jewellery query' : 'Tap Microphone or Click Quick Test Prompts'}
            </p>
            {voiceTranscript && (
              <p className="text-xs text-gray-600 italic mt-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                "{voiceTranscript}"
              </p>
            )}

            {/* Quick Test Voice Chips */}
            <div className="mt-6 w-full max-w-2xl">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Simulate 1-Click Voice Commands:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { text: 'Aaj ki total sale batao.', lang: 'hi' },
                  { text: 'Customer ka outstanding balance batao.', lang: 'hi' },
                  { text: 'Ye necklace inventory mein add karna hai.', lang: 'hi' },
                  { text: 'આજનું વેચાણ કેટલું છે?', lang: 'gu' },
                  { text: 'ગ્રાહકનું બાકી લેણું જણાવો.', lang: 'gu' },
                  { text: 'આ હાર સ્ટોકમાં ઉમેરો.', lang: 'gu' },
                  { text: "What is today's total sales?", lang: 'en' },
                  { text: 'Show me low stock items.', lang: 'en' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setVoiceTranscript(chip.text);
                      submitVoiceCommand(chip.text, chip.lang as any);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-amber-100 text-gray-700 text-xs border border-gray-200 transition-colors"
                  >
                    "{chip.text}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Execution Result Card */}
          {voiceResult && (
            <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl p-5 border border-[#35BFA0]/30 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DFD7] dark:border-white/5">
                <span className="text-xs font-bold text-[#35BFA0] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#35BFA0]" /> AI Intent Understood ({voiceResult.intent})
                </span>
                <span className="text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6] uppercase">Lang: {voiceResult.language}</span>
              </div>
              <div className="mt-3 p-4 rounded-xl bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10">
                <p className="text-sm font-semibold text-[#111318] dark:text-[#F6F5F1]">{voiceResult.reply}</p>
                {voiceResult.data && (
                  <pre className="mt-2 text-[11px] font-mono bg-[#FFFFFF] dark:bg-[#181A22] p-3 rounded-lg border border-[#E3DFD7] dark:border-white/10 text-[#5A5E6B] dark:text-[#A6AAB6] overflow-x-auto">
                    {JSON.stringify(voiceResult.data, null, 2)}
                  </pre>
                )}
                {voiceResult.captured_document && (
                  <div className="mt-3 flex items-center justify-between text-xs bg-[#35BFA0]/10 p-2.5 rounded-lg border border-[#35BFA0]/25">
                    <span className="text-[#35BFA0] font-medium">
                      Transaction draft queued! Approval required before committing.
                    </span>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="px-3 py-1 rounded-lg gold-gradient text-[#111318] font-bold text-xs flex items-center gap-1"
                    >
                      Review in Queue <ArrowRight className="w-3 h-3 text-[#111318]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: AI INVOICE & DOCUMENT SCANNER
         ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl p-6 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
            <h3 className="font-serif font-bold text-[#111318] dark:text-[#F6F5F1] text-base mb-1">
              AI-Powered Invoice & Bullion Bill Extraction
            </h3>
            <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mb-4">
              Drop an image of a vendor purchase bill, manual counter memo, or supplier voucher (JPG, PNG, PDF, Excel) for automated entity extraction.
            </p>

            <div className="border-2 border-dashed border-[#C9A34A]/40 rounded-xl p-8 text-center bg-[#ECEAE4]/30 dark:bg-[#111318]/50 hover:bg-[#C9A34A]/5 transition-colors">
              <Upload className="w-10 h-10 text-[#C9A34A] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#111318] dark:text-[#F6F5F1]">Select invoice document or drag & drop</p>
              <p className="text-[10px] text-[#8E929E] mt-1">Supports Jewellery Purchase Invoices, Hallmarking Slips, Karigar Memos</p>
              <input
                type="file"
                accept="image/*,.pdf,.xlsx,.csv"
                onChange={(e) => setScannerFile(e.target.files?.[0] || null)}
                className="mt-4 text-xs text-[#5A5E6B] dark:text-[#A6AAB6] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:gold-gradient file:text-[#111318] cursor-pointer"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={handleUploadScan}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#111318]" />
                <span>{loading ? 'Analyzing with AI OCR...' : 'Scan & Extract Data'}</span>
              </button>
            </div>
          </div>

          {/* Extraction Result Preview */}
          {scanResult && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-fade-in space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h4 className="font-serif font-bold text-gray-900 text-sm">Extracted Invoice Entities</h4>
                  <p className="text-[11px] text-gray-500">File: {scanResult.original_filename}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 font-medium">Confidence:</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {scanResult.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Warnings / Duplicate checks */}
              {scanResult.validation_warnings?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Smart Validation Alerts:
                  </p>
                  {scanResult.validation_warnings.map((w: string, idx: number) => (
                    <p key={idx} className="text-[11px] pl-5">• {w}</p>
                  ))}
                </div>
              )}

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Customer / Patron</span>
                  <p className="font-bold text-gray-900">{scanResult.extracted_data?.customer_name}</p>
                  <p className="text-[10px] text-gray-500">{scanResult.extracted_data?.customer_phone}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Ornament & Purity</span>
                  <p className="font-bold text-gray-900">{scanResult.extracted_data?.item_name}</p>
                  <p className="text-[10px] text-gray-600">Purity: {scanResult.extracted_data?.purity_karat}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Weights Breakdown</span>
                  <p className="font-bold text-gray-900">Gross: {scanResult.extracted_data?.gross_weight}g</p>
                  <p className="text-[10px] text-gray-600">Net: {scanResult.extracted_data?.net_weight}g (Stone: {scanResult.extracted_data?.stone_weight}g)</p>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-semibold">Financial Settlement</span>
                  <p className="font-bold text-[#C9A34A] font-serif text-sm">₹{Number(scanResult.extracted_data?.grand_total).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-[#35BFA0] font-medium">3% GST: ₹{scanResult.extracted_data?.gst_3_percent}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('queue')}
                  className="px-4 py-2 rounded-lg gold-gradient text-[#111318] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  Proceed to Approval Queue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: DIGITAL WEIGHING SCALE TERMINAL
         ========================================================================= */}
      {activeTab === 'scale' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LED Display Box */}
            <div className="md:col-span-2 bg-[#1B1B1B] text-emerald-400 rounded-xl p-8 border border-gray-800 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-between w-full mb-6 text-gray-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Serial Stream Active (COM3: 9600 baud)
                </span>
                <span className="bg-emerald-950/80 text-emerald-400 px-2.5 py-0.5 rounded font-mono text-[10px] border border-emerald-800">
                  KERN EMB PRECISION
                </span>
              </div>

              {/* 7-Segment Style Weight Display */}
              <div className="my-4">
                <p className="text-6xl sm:text-7xl font-mono font-bold tracking-wider text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                  {scaleGross.toFixed(3)}
                </p>
                <span className="text-sm font-sans text-gray-400 uppercase tracking-widest mt-2 block">
                  Grams (Net: {(scaleGross - scaleTare).toFixed(3)}g)
                </span>
              </div>

              {/* Scale Controls */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setScaleTare(scaleGross)}
                  className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-mono text-xs font-semibold border border-gray-700"
                >
                  TARE / ZERO
                </button>
                <button
                  onClick={() => {
                    // Random fluctuate weight within 0.005g
                    setScaleGross(Number((14.850 + (Math.random() * 0.01 - 0.005)).toFixed(3)));
                  }}
                  className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-mono text-xs font-semibold border border-gray-700"
                >
                  STABILIZE
                </button>
              </div>
            </div>

            {/* Ingestion Panel */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-gray-900 text-sm mb-1">Scale Telemetry Commit</h4>
                <p className="text-xs text-gray-500 mb-4">Directly record verified calibrated weight into inventory or POS tray.</p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Item Description</label>
                    <input
                      type="text"
                      value={scaleDescription}
                      onChange={(e) => setScaleDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Tare (Box/Pouch) Deduction</label>
                    <input
                      type="number"
                      step="0.001"
                      value={scaleTare}
                      onChange={(e) => setScaleTare(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded border border-gray-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E3DFD7] dark:border-white/5">
                {scaleMsg && (
                  <p className="text-[11px] text-[#35BFA0] font-medium mb-3 bg-[#35BFA0]/10 p-2.5 rounded-lg border border-[#35BFA0]/25">
                    {scaleMsg}
                  </p>
                )}
                <button
                  onClick={handleIngestScale}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4 text-[#111318]" /> Commit Weight to Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BARCODE & RFID SCANNER
         ========================================================================= */}
      {activeTab === 'barcode' && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl p-6 border border-[#E3DFD7] dark:border-white/10 shadow-sm">
            <h3 className="font-serif font-bold text-[#111318] dark:text-[#F6F5F1] text-base mb-1">
              Optical Barcode, QR Code & RFID Tag Scanner
            </h3>
            <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mb-4">
              Instant item lookup with real-time bullion valuation at today's retail rate.
            </p>

            <div className="flex gap-3 max-w-xl">
              <input
                type="text"
                placeholder="Scan item code or HUID (e.g. CJ-G-RNG-1005)..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeLookup()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E3DFD7] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#111318] text-[#111318] dark:text-[#F6F5F1] text-xs font-mono focus:border-[#C9A34A] outline-none"
              />
              <button
                onClick={handleBarcodeLookup}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl gold-gradient text-[#111318] font-bold text-xs shadow hover:brightness-105 transition-all flex items-center gap-2"
              >
                <Barcode className="w-4 h-4 text-[#111318]" /> Scan
              </button>
            </div>
          </div>

          {/* Barcode Valuation Result Card */}
          {barcodeResult && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-fade-in">
              {barcodeResult.found ? (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="font-serif font-bold text-gray-900 text-sm">
                        {barcodeResult.item.name} ({barcodeResult.item.purity_karat})
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Code: {barcodeResult.item.item_code} | HUID: {barcodeResult.item.huid || 'Unverified'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {barcodeResult.item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-lg mt-3">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Weight Details</span>
                      <p className="font-bold text-gray-900">Gross: {Number(barcodeResult.item.gross_weight).toFixed(3)}g</p>
                      <p className="text-[10px] text-gray-600">Net: {Number(barcodeResult.item.net_weight).toFixed(3)}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Live Metal Rate</span>
                      <p className="font-bold text-amber-800 font-mono">₹{barcodeResult.live_valuation.rate_per_gram.toFixed(2)}/g</p>
                      <p className="text-[10px] text-gray-600">Valuation: ₹{barcodeResult.live_valuation.metal_value.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Making & GST</span>
                      <p className="font-bold text-gray-900">Making: ₹{barcodeResult.live_valuation.making_charges.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-600">GST 3%: ₹{barcodeResult.live_valuation.gst_3_percent.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-semibold">Live Retail Price</span>
                      <p className="text-base font-bold text-[#C9A34A] font-serif">
                        ₹{barcodeResult.live_valuation.estimated_retail_price.toLocaleString('en-IN')}
                      </p>
                      <a href="/pos" className="text-[10px] text-[#C9A34A] font-semibold hover:underline">
                        Add to POS Cart →
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-semibold">{barcodeResult.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: HUMAN APPROVAL & AUDIT QUEUE (SAFETY GATE)
         ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-gray-900 text-sm">
                  Human Approval & Safety Verification Queue
                </h3>
                <p className="text-[11px] text-gray-500">
                  Every zero-manual transaction requires human authorization before updating enterprise ledgers.
                </p>
              </div>
              <button
                onClick={fetchQueue}
                className="text-xs text-[#C9A34A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Refresh Queue
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Document / Summary</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Warnings</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        No transactions in the approval queue.
                      </td>
                    </tr>
                  ) : (
                    queue.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-amber-50/20">
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                            {doc.source_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">
                            {doc.extracted_data?.item_name || doc.extracted_data?.name || doc.extracted_data?.item_description || doc.document_type}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Net: {doc.extracted_data?.net_weight || doc.extracted_data?.gross_weight || '—'}g | 
                            Amount: ₹{Number(doc.extracted_data?.grand_total || 0).toLocaleString('en-IN')}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              doc.confidence_score >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doc.confidence_score}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {doc.validation_warnings?.length > 0 ? (
                            <span className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> {doc.validation_warnings.length} alert(s)
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600">Clean verification</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              doc.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : doc.status === 'reversed'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {doc.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleApprove(doc.id)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(doc.id)}
                                  className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold hover:bg-rose-100 flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              </>
                            )}
                            {doc.status === 'approved' && (
                              <button
                                onClick={() => setReversalDocId(doc.id)}
                                className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold hover:bg-purple-100 flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> Reverse
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reversal Modal */}
          {reversalDocId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-gray-900 text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-purple-600" /> Confirm Transaction Reversal
                  </h4>
                  <button onClick={() => setReversalDocId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className="text-xs text-gray-600">
                  Reversing will cancel the generated invoice, restore deducted inventory pieces back to stock, and post a reversing contra voucher.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Reversal:</label>
                  <input
                    type="text"
                    placeholder="e.g. Incorrect customer weight or clerical error"
                    value={reversalReason}
                    onChange={(e) => setReversalReason(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReversalDocId(null)}
                    className="px-3 py-1.5 rounded text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReverse(reversalDocId)}
                    className="px-4 py-1.5 rounded bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
                  >
                    Confirm Reversal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
