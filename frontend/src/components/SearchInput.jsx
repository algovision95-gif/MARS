import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Mic, Video, Image, ArrowUp, Loader2, X, Paperclip } from 'lucide-react';
import api from '../services/api';

const uploadOptions = [
  { icon: FileText, label: 'Upload Document', accept: '.pdf,.txt,.docx', type: 'document', color: 'text-accent' },
  { icon: Mic,      label: 'Upload Audio',    accept: '.mp3,.wav',       type: 'audio',    color: 'text-accentPurple' },
  { icon: Video,    label: 'Upload Video',    accept: '.mp4',            type: 'video',    color: 'text-accentAmber' },
  { icon: Image,    label: 'Generate Image',  accept: null,              type: 'image',    color: 'text-accentGreen' },
];

export default function SearchInput({ onSubmit, onAgentSubmit, loading, user, onLoginRequired }) {
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim() && !uploadedFile) return;
    // Search is FREE — no login check here
    onSubmit({ query: query.trim(), fileId: uploadedFile?.fileId });
    setQuery('');
    setUploadedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const triggerUpload = (option) => {
    if (!user) { onLoginRequired?.(); setShowUpload(false); return; }
    if (!option.accept) { alert('Image generation coming soon!'); setShowUpload(false); return; }
    fileInputRef.current.accept = option.accept;
    fileInputRef.current.click();
    setShowUpload(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedFile({ fileId: data.fileId, name: data.filename, type: data.type });
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Upload Dropdown */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-0 glass-strong rounded-2xl p-2 w-56 z-30"
          >
            {uploadOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => triggerUpload(opt)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-all text-left"
              >
                <opt.icon size={16} className={opt.color} />
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached File Badge */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full mb-2 left-14 flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-accent border border-accent/20"
          >
            <Paperclip size={12} />
            <span className="max-w-[200px] truncate">{uploadedFile.name}</span>
            <button onClick={() => setUploadedFile(null)} className="text-gray-500 hover:text-red-400 ml-1">
              <X size={12} />
            </button>
          </motion.div>
        )}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-full mb-2 left-14 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"
          >
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Box */}
      <div className="glass-strong rounded-2xl border border-white/10 flex items-end gap-2 p-3 focus-within:border-accent/30 transition-colors">
        {/* Upload Button */}
        <button
          id="upload-btn"
          onClick={() => setShowUpload(!showUpload)}
          disabled={uploading}
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            showUpload
              ? 'bg-accent text-dark'
              : 'bg-white/8 text-gray-400 hover:text-white hover:bg-white/12'
          }`}
        >
          {uploading
            ? <Loader2 size={16} className="animate-spin text-accent" />
            : <Plus size={18} className={showUpload ? 'rotate-45 transition-transform' : 'transition-transform'} />
          }
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="research-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search any topic freely — no login required"
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm resize-none focus:outline-none min-h-[36px] max-h-40 py-2"
          style={{ lineHeight: '1.5' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
          }}
        />

        {/* Send Button */}
        <button
          id="send-btn"
          onClick={handleSubmit}
          disabled={loading || (!query.trim() && !uploadedFile)}
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            (query.trim() || uploadedFile) && !loading
              ? 'bg-accent text-dark hover:bg-accent/90 glow-blue-sm'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
