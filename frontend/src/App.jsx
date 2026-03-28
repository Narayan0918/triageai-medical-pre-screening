/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  Upload, 
  X, 
  Stethoscope, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Hospital, 
  User,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSymptoms } from './services/api';

export default function App() {
  // Application State (Real API Data)
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Intake Input State
  const [symptoms, setSymptoms] = useState('');
  const [imageFile, setImageFile] = useState(null); // The actual file for the API
  const [imagePreview, setImagePreview] = useState(null); // The base64 preview for UI
  const fileInputRef = useRef(null);

  // Handle Image Selection/Preview and save File Object
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store file for API
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Store preview for UI
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Drag & Drop same way
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Integrate the REAL API call
  const handleAnalyze = async () => {
    // Basic validation: must have text, image optional
    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call Django endpoint (imageFile can be null)
      const data = await analyzeSymptoms(imageFile, symptoms);
      setResult(data);
    } catch (err) {
      setError(err.message || "Analysis failed. Server might be down.");
    } finally {
      setLoading(false);
    }
  };

  // Reset function to clear all states
  const handleReset = () => {
    setResult(null);
    setSymptoms('');
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const getUrgencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'red': return 'bg-red-600 border-red-700 text-white';
      case 'yellow': return 'bg-amber-500 border-amber-600 text-white';
      case 'green': return 'bg-emerald-600 border-emerald-700 text-white';
      default: return 'bg-slate-800 border-slate-900 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans text-slate-900">
      {/* Emergency Disclaimer */}
      <div className="bg-red-950 text-white py-2 px-4 text-center text-[11px] font-bold uppercase tracking-widest border-b border-red-900 sticky top-0 z-50">
        Not for emergencies. Call 911 for life-threatening conditions
      </div>

      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-8.25 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-slate-900">
            TriageAI
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-bold border-b-2 border-slate-900 pb-1">Symptom Checker</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">History</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Doctors</a>
          </nav>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User size={20} className="text-slate-600" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="intake"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
            >
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-5 space-y-8 pt-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Clinical Triage v2.4</span>
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] text-slate-900">
                    Precision analysis for your peace of mind.
                  </h1>
                  <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                    Describe your symptoms in natural language. Our clinical engine will categorize urgency and suggest immediate next steps.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-2xl border-l-4 border-slate-900 shadow-sm">
                  <p className="text-sm font-medium italic text-slate-700 leading-relaxed">
                    "The platform identified a subtle pattern in my skin rash that prompted a specialist visit."
                  </p>
                  <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">— Verified Patient</p>
                </div>
              </div>

              {/* Right Column: Intake Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="space-y-10">
                  {/* Symptoms Text Area */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Symptom Description</label>
                    <textarea 
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full min-h-50 bg-slate-50 border-none rounded-2xl p-6 text-lg text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                      placeholder="Example: I've noticed a persistent dry cough for the past 3 days..."
                    />
                  </div>

                  {/* File Upload Zone (Optional) */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Visual Evidence (Optional)</label>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer overflow-hidden group ${imagePreview ? 'border-none' : ''}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      
                      {imagePreview ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white text-sm font-bold">Change Image</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Clear actual file and preview
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                          >
                            <X size={16} className="text-slate-900" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-600 font-medium">
                            Drag and drop or <span className="text-slate-900 underline underline-offset-4">browse files</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">JPG, PNG (Max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Integrated Error Display */}
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Real Submit Logic */}
                  <button 
                    onClick={handleAnalyze}
                    disabled={loading || !symptoms.trim()}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Analyzing Symptoms...
                      </>
                    ) : (
                      <>
                        Analyze Symptoms
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12" // Increased spacing between main sections
            >
              {/* SECTION 1: Results Header & Urgency */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors group"
                  >
                    <X size={14} className="group-hover:rotate-90 transition-transform" />
                    Start Over
                  </button>
                  <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900">Diagnostic Narrative</h2>
                </div>
                
                {/* Dynamic Urgency Banner using REAL data */}
                <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-b-4 shadow-lg ${getUrgencyColor(result.ai_analysis.urgency_level)}`}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Urgency Level</p>
                    <p className="text-xl font-black tracking-tight">{result.ai_analysis.urgency_level} Priority</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: AI Analysis (Full Width now) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100 space-y-12"
              >
                {/* Suggested Specialty */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                    <Stethoscope className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Suggested Specialty</h3>
                    <p className="text-3xl font-black tracking-tight text-slate-900">{result.ai_analysis.suggested_specialty}</p>
                  </div>
                </div>

                {/* Possible Causes */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Possible Causes</h3>
                  {/* Kept causes as a 2-column grid within the full-width card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.ai_analysis.possible_causes.map((cause, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="font-bold text-slate-700">{cause}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions & Watch Out */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-12">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Precautions
                    </h3>
                    <ul className="space-y-3">
                      {result.ai_analysis.precautions.map((item, i) => (
                        <li key={i} className="text-sm font-medium text-slate-600 leading-relaxed flex gap-3">
                          <span className="text-emerald-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {result.ai_analysis.watch_out_symptoms.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={14} />
                        Watch Out For
                      </h3>
                      <ul className="space-y-3">
                        {result.ai_analysis.watch_out_symptoms.map((item, i) => (
                          <li key={i} className="text-sm font-medium text-slate-600 leading-relaxed flex gap-3">
                            <span className="text-red-500">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* SECTION 3: Doctors List (Moved BELOW main description component in GRID format) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4 px-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recommended Doctors</h3>
                    <div className="p-6 bg-slate-900 rounded-full text-white space-y-4 py-2 px-4 shadow-xl shadow-slate-200">
                        <p className="text-[10px] font-medium leading-relaxed flex items-center gap-2">
                           <ShieldAlert size={12} className="text-amber-400"/> Book within 48 hours for examination.
                        </p>
                    </div>
                </div>
                
                {result.recommended_doctors.length > 0 ? (
                  /* Updated to GRID format: 1 col on mobile, 2 on tablet, 3 on desktop */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {result.recommended_doctors.map((doc) => (
                      <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                                <img 
                                  src={`https://picsum.photos/seed/doc${doc.id}/200/200`} 
                                  alt={doc.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-lg leading-tight">{doc.name}</p>
                                <p className="font-bold text-slate-700 text-sm mb-1">{doc.credentials}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded inline-block">{doc.specialty}</p>
                              </div>
                            </div>

                            <div className="space-y-3 mb-8">
                              <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors">
                                <Hospital size={16} className="shrink-0" />
                                <span className="text-sm font-medium">{doc.hospital}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors">
                                <Clock size={16} className="shrink-0" />
                                <span className="text-sm font-medium">{doc.shift_hours}</span>
                              </div>
                            </div>
                        </div>

                        <button className="w-full bg-slate-50 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 group mt-auto border border-slate-200 hover:border-slate-900">
                          Book Consultation
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-16 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <Stethoscope size={48} className="mx-auto mb-4 text-slate-300"/>
                      <p className="text-lg font-bold text-slate-700">No Specialists Found</p>
                      <p className="text-sm">No doctors matching this specialty were found in the database.</p>
                   </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black tracking-tighter text-slate-900">
            TriageAI
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Medical Compliance</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Data Security</a>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            © 2026 TriageAI Curators. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}