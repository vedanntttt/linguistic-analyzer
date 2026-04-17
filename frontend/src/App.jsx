import { useState, useRef } from 'react'
import axios from 'axios'
import SummaryCard from './components/SummaryCard'
import EntityCard from './components/EntityCard'
import POSChart from './components/POSChart'
import KeywordsCard from './components/KeywordsCard'
import DependencyTree from './components/DependencyTree'
import ReadabilityCard from './components/ReadabilityCard'
import LLMCard from './components/LLMCard'

const SAMPLE_TEXT = `Artificial intelligence (AI) is transforming industries worldwide. Companies like Google, Microsoft, and OpenAI are leading the charge in developing large language models. These systems, trained on vast datasets, can now perform complex tasks once thought exclusive to humans. However, researchers at MIT and Stanford University warn that unchecked AI development poses significant ethical challenges. In 2024, the European Union passed landmark legislation to regulate AI applications in member states. Despite these concerns, global investment in AI exceeded $100 billion last year, signaling strong confidence in the technology's future potential. Experts believe that collaboration between governments, academia, and the private sector is essential to ensure responsible innovation.`

export default function App() {
  const [text, setText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [fileInfo, setFileInfo] = useState(null)   // { name, pages? }
  const fileInputRef = useRef(null)

  const [llmData, setLlmData] = useState(null)
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmError, setLlmError] = useState('')

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  // ── Analyze ──────────────────────────────────────
  const analyze = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError('Please enter at least 20 characters of text.')
      return
    }
    setError('')
    setLoading(true)
    setLlmLoading(true)
    setResults(null)
    setLlmData(null)
    setLlmError('')

    // Run classical NLP and LLM analysis in parallel
    const [nlpRes, llmRes] = await Promise.allSettled([
      axios.post('http://localhost:5001/analyze', { text }),
      axios.post('http://localhost:5001/analyze-llm', { text }),
    ])

    setLoading(false)
    setLlmLoading(false)

    if (nlpRes.status === 'fulfilled') {
      setResults(nlpRes.value.data)
    } else {
      setError(
        nlpRes.reason?.response?.data?.error ||
        'Could not connect to the backend. Make sure Flask is running on port 5001.'
      )
    }

    if (llmRes.status === 'fulfilled') {
      setLlmData(llmRes.value.data)
    } else {
      setLlmError(
        llmRes.reason?.response?.data?.error ||
        'LLM analysis failed. Check your Groq API key.'
      )
    }
  }

  // ── File upload handler ───────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset so the same file can be re-selected
    e.target.value = ''

    setError('')
    setResults(null)

    const ext = file.name.split('.').pop().toLowerCase()

    // ── Plain text ──
    if (ext === 'txt') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setText(ev.target.result)
        setFileInfo({ name: file.name })
      }
      reader.onerror = () => setError('Failed to read the text file.')
      reader.readAsText(file)
      return
    }

    // ── PDF ──
    if (ext === 'pdf') {
      setUploading(true)
      try {
        const form = new FormData()
        form.append('file', file)
        const res = await axios.post('http://localhost:5001/extract-text', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setText(res.data.text)
        setFileInfo({ name: file.name, pages: res.data.pages })
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to extract text from PDF.')
      } finally {
        setUploading(false)
      }
      return
    }

    setError('Unsupported file type. Please upload a .pdf or .txt file.')
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyze()
  }

  const clear = () => {
    setText('')
    setResults(null)
    setError('')
    setFileInfo(null)
    setLlmData(null)
    setLlmError('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">
            Computational Linguistics Pipeline
          </h1>
          <p className="mt-1 text-indigo-200 text-sm">
            Morphological &nbsp;·&nbsp; Syntactic &nbsp;·&nbsp; Semantic &nbsp;·&nbsp; Discourse Analysis
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* ── Input ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

          {/* Label row */}
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Input Text</label>
            {fileInfo && (
              <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                {fileInfo.name}
                {fileInfo.pages != null && ` · ${fileInfo.pages} page${fileInfo.pages !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>

          <textarea
            className="w-full h-40 p-3 border border-slate-300 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            placeholder="Paste text here, or upload a .pdf / .txt file below…  (Ctrl+Enter to analyze)"
            value={text}
            onChange={(e) => { setText(e.target.value); setFileInfo(null) }}
            onKeyDown={handleKeyDown}
          />

          {/* Button row */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
              onClick={analyze}
              disabled={loading || uploading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Extracting…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload PDF / TXT
                </>
              )}
            </button>

            <button
              onClick={() => { setText(SAMPLE_TEXT); setResults(null); setError(''); setFileInfo(null) }}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Load Sample
            </button>

            <button
              onClick={clear}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Clear
            </button>

            {wordCount > 0 && (
              <span className="ml-auto text-xs text-slate-400">
                {wordCount} words &nbsp;·&nbsp; {text.length} chars
              </span>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* ── Loader ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Running NLP pipeline…</p>
          </div>
        )}

        {/* ── Results ── */}
        {(results || llmData || llmLoading) && (
          <div className="space-y-6">
            {/* Row 1: LLM Analysis (full width) */}
            <LLMCard data={llmData} loading={llmLoading} error={llmError} />

            {results && <>
              {/* Row 2: Summary + Readability */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SummaryCard sentences={results.summary} />
                </div>
                <ReadabilityCard data={results.readability} />
              </div>

              {/* Row 3: POS chart + Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <POSChart distribution={results.pos_distribution} />
                <KeywordsCard keywords={results.keywords} />
              </div>

              {/* Row 4: Entities */}
              <EntityCard entities={results.entities} />

              {/* Row 5: Dependency tree */}
              <DependencyTree html={results.dependency_tree} />
            </>}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        spaCy &nbsp;·&nbsp; NLTK &nbsp;·&nbsp; scikit-learn &nbsp;·&nbsp; textstat &nbsp;·&nbsp; displaCy
      </footer>
    </div>
  )
}
