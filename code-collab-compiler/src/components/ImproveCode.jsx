import React, { useState, useEffect } from 'react'
import axios from 'axios'

const ImproveCode = ({ dark, code, language, onInjectCode }) => {
  const [response, setResponse] = useState('')
  const [improvedCode, setImprovedCode] = useState('')
  const [originalCode, setOriginalCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyBest, setAlreadyBest] = useState(false)
  const [injected, setInjected] = useState(false)
  const [apiKey, setApiKey] = useState('AIzaSyA3-8OlYPsQ9Px8je5vMNAVMVF2gpX84O4')

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key')
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  async function improveCode() {
    if (!apiKey) {
      setError('Please set your Gemini API key in the AI Intelligence tab first.')
      return
    }

    if (!code || code.trim() === '') {
      setError('No code found in the editor. Write some code first.')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')
    setImprovedCode('')
    setAlreadyBest(false)
    setInjected(false)
    setOriginalCode(code)

    const prompt = `You are an expert code reviewer and optimizer. Analyze the following ${language || ''} code and improve it for better performance, readability, and best practices.

IMPORTANT RULES:
1. If the code is already well-written and cannot be meaningfully improved, respond with EXACTLY: "ALREADY_BEST" on the first line, followed by a brief explanation of why it's good.
2. If the code can be improved, respond in this EXACT format:
   - First line: "IMPROVED"
   - Then the improved code wrapped in triple backticks
   - Then explain what was improved and why, using numbered points
${language === 'java' ? '3. The main class MUST always be named "Main" (class Main).' : ''}

Code:
\`\`\`${language}
${code}
\`\`\`

Analyze and improve:`

    try {
      let res = null
      let retries = 0
      const maxRetries = 3

      while (retries <= maxRetries) {
        try {
          res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`,
            {
              contents: [
                {
                  parts: [{ text: prompt }]
                }
              ]
            },
            {
              headers: { 'Content-Type': 'application/json' }
            }
          )
          break
        } catch (retryErr) {
          if (retryErr.response?.status === 429 && retries < maxRetries) {
            retries++
            setError(`Rate limited. Retrying in ${retries * 5}s... (${retries}/${maxRetries})`)
            await new Promise(r => setTimeout(r, retries * 5000))
            continue
          }
          throw retryErr
        }
      }

      const text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        if (text.trim().startsWith('ALREADY_BEST')) {
          setAlreadyBest(true)
          setResponse(text.replace('ALREADY_BEST', '').trim())
        } else {
          // Extract code from response
          const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/)
          if (codeMatch && codeMatch[1]) {
            let extractedCode = codeMatch[1].trim()
            // For Java: ensure class name is Main
            if (language === 'java') {
              extractedCode = extractedCode.replace(/public\s+class\s+\w+/g, 'class Main')
              extractedCode = extractedCode.replace(/class\s+(?!Main\b)\w+\s*\{/, 'class Main {')
            }
            setImprovedCode(extractedCode)
            // Auto-inject improved code
            if (onInjectCode) {
              onInjectCode(extractedCode)
              setInjected(true)
            }
          }
          // Get explanation (everything after the code block)
          const explanation = text.replace(/IMPROVED\s*\n?/, '').replace(/```[\w]*\n[\s\S]*?```/, '').trim()
          setResponse(explanation)
        }
      } else {
        setError('No response received from AI. Please try again.')
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid request. Check your API key.')
      } else if (err.response?.status === 403) {
        setError('API key is invalid or revoked.')
      } else if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait and try again.')
      } else {
        setError('Failed to improve code: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setLoading(false)
    }
  }

  function revertCode() {
    if (originalCode && onInjectCode) {
      onInjectCode(originalCode)
      setInjected(false)
      setResponse('')
      setImprovedCode('')
      setAlreadyBest(false)
    }
  }

  function clearAll() {
    setResponse('')
    setImprovedCode('')
    setError('')
    setAlreadyBest(false)
    setInjected(false)
  }

  function formatText(text) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>
        }
        const codeParts = part.split(/(`.*?`)/g).map((cp, k) => {
          if (cp.startsWith('`') && cp.endsWith('`')) {
            return (
              <code key={k} style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '0.9em',
                fontFamily: 'monospace'
              }}>
                {cp.slice(1, -1)}
              </code>
            )
          }
          return cp
        })
        return <span key={j}>{codeParts}</span>
      })

      const isStep = /^\d+[\.\)]/.test(line.trim())
      const isHeading = /^#{1,3}\s/.test(line.trim())

      if (isHeading) {
        return (
          <p key={i} style={{ fontWeight: 'bold', fontSize: '1.05em', marginTop: '12px', marginBottom: '4px' }}>
            {line.replace(/^#{1,3}\s/, '')}
          </p>
        )
      }

      return (
        <p key={i} style={{
          margin: '3px 0',
          paddingLeft: isStep ? '8px' : '0',
          lineHeight: '1.6'
        }}>
          {parts}
        </p>
      )
    })
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Action bar */}
      <div className={`px-3 py-2 d-flex gap-2 align-items-center border-bottom ${dark ? 'border-dark' : ''}`}>
        <button
          onClick={improveCode}
          disabled={loading}
          className="btn btn-primary btn-sm rounded-pill px-3"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Improving...
            </>
          ) : (
            <>
              <i className="bi bi-magic me-2"></i>
              Improve Code
            </>
          )}
        </button>
        {injected && (
          <button
            onClick={revertCode}
            className="btn btn-warning btn-sm rounded-pill px-3"
          >
            <i className="bi bi-arrow-counterclockwise me-2"></i>
            Revert
          </button>
        )}
        {(response || improvedCode || error) && (
          <button
            onClick={clearAll}
            className={`btn btn-sm rounded-pill ${dark ? 'btn-outline-light' : 'btn-outline-secondary'}`}
          >
            <i className="bi bi-x-lg me-1"></i>
            Clear
          </button>
        )}
      </div>

      {/* Content area */}
      <div className={`flex-grow-1 overflow-auto p-3 ${dark ? 'bg-prime-dark' : 'bg-white'}`} style={{ fontSize: '0.9rem' }}>
        {error && (
          <div className="alert alert-danger py-2 rounded-4 d-flex align-items-start" role="alert">
            <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className={`${dark ? 'text-secondary' : 'text-muted'} m-0`}>
              AI is analyzing and improving your code...
            </p>
          </div>
        )}

        {alreadyBest && !loading && (
          <div className="text-center py-4">
            <i className="bi bi-check-circle-fill text-success d-block mb-2" style={{ fontSize: '2.5rem' }}></i>
            <p className="fw-bold text-success mb-2" style={{ fontSize: '1.1rem' }}>Already Best!</p>
            <p className={`${dark ? 'text-secondary' : 'text-muted'} m-0`}>
              Your code is already well-written and optimized.
            </p>
            {response && (
              <div className="mt-3 text-start" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {formatText(response)}
              </div>
            )}
          </div>
        )}

        {improvedCode && !loading && !alreadyBest && (
          <div>
            {injected && (
              <div className="alert alert-success py-2 rounded-4 d-flex align-items-center mb-3" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                <span>Improved code has been applied to the editor. Click <strong>Revert</strong> to undo.</span>
              </div>
            )}

            <div className="mb-3">
              <p className="fw-bold mb-2">
                <i className="bi bi-code-slash text-primary me-2"></i>
                Improved Code:
              </p>
              <div style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: '12px',
                padding: '12px',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {improvedCode}
                </pre>
              </div>
            </div>

            {response && (
              <div>
                <p className="fw-bold mb-2">
                  <i className="bi bi-lightbulb text-warning me-2"></i>
                  What was improved:
                </p>
                <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {formatText(response)}
                </div>
              </div>
            )}
          </div>
        )}

        {!response && !improvedCode && !loading && !error && !alreadyBest && (
          <div className="text-center py-5">
            <i className={`bi bi-magic d-block mb-3 ${dark ? 'text-secondary' : 'text-muted'}`} style={{ fontSize: '2.5rem' }}></i>
            <p className={`${dark ? 'text-secondary' : 'text-muted'} m-0 fw-medium`}>
              Code Improver
            </p>
            <small className={`${dark ? 'text-secondary' : 'text-muted'}`}>
              Click "Improve Code" to optimize your code for performance, readability, and best practices
            </small>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImproveCode
