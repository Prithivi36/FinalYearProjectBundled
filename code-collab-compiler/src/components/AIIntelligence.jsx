import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AIIntelligence = ({ dark, code, language, onInjectCode }) => {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('AIzaSyA3-8OlYPsQ9Px8je5vMNAVMVF2gpX84O4')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [error, setError] = useState('')
  const [showInstructionInput, setShowInstructionInput] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [generatingCode, setGeneratingCode] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key')
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  function saveApiKey() {
    localStorage.setItem('gemini-api-key', apiKey)
    setShowKeyInput(false)
  }

  async function explainCode() {
    if (!apiKey) {
      setShowKeyInput(true)
      setError('Please enter your Gemini API key first.')
      return
    }

    if (!code || code.trim() === '') {
      setError('No code found in the editor. Write some code first.')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    const prompt = `You are a helpful programming tutor. Explain the following ${language || 'code'} code step by step in simple natural language. Break it down so a beginner can understand what each part does. Use numbered steps and be clear and concise.\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nExplain step by step:`

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
          break // success, exit loop
        } catch (retryErr) {
          if (retryErr.response?.status === 429 && retries < maxRetries) {
            retries++
            setError(`Rate limited. Retrying in ${retries * 5}s... (${retries}/${maxRetries})`)
            await new Promise(r => setTimeout(r, retries * 5000))
            continue
          }
          throw retryErr // re-throw if not 429 or out of retries
        }
      }

      const text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        setResponse(text)
      } else {
        setError('No response received from AI. Please try again.')
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid request. Check your API key and try again.')
      } else if (err.response?.status === 403) {
        setError('API key is invalid or has been revoked. Please update your key.')
        setShowKeyInput(true)
      } else if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.')
      } else {
        setError('Failed to get AI response: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setLoading(false)
    }
  }

  function clearResponse() {
    setResponse('')
    setError('')
  }

  async function generateCode() {
    if (!apiKey) {
      setShowKeyInput(true)
      setError('Please enter your Gemini API key first.')
      return
    }

    if (!instruction || instruction.trim() === '') {
      setError('Please enter instructions for what code to generate.')
      return
    }

    setGeneratingCode(true)
    setError('')
    setResponse('')

    const prompt = `You are an expert programmer. Write ${language || 'code'} code based on the following instructions. Return ONLY the code, no explanations, no markdown code fences, no extra text. Just pure code that can be directly executed.${language === 'java' ? ' IMPORTANT: The main class MUST be named "Main" (i.e. "class Main").' : ''}\n\nInstructions: ${instruction}\n\nCode:`

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

      let generatedCode = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (generatedCode) {
        // Strip markdown code fences if the model wraps them anyway
        generatedCode = generatedCode.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim()
        // For Java: ensure the main class is always named "Main"
        if (language === 'java') {
          generatedCode = generatedCode.replace(/public\s+class\s+\w+/g, 'class Main')
          generatedCode = generatedCode.replace(/class\s+(?!Main\b)\w+\s*\{/, 'class Main {')
        }
        // Inject generated code into the editor
        if (onInjectCode) {
          onInjectCode(generatedCode)
        }
        setResponse('Code generated and inserted into the editor!')
        setShowInstructionInput(false)
        setInstruction('')
      } else {
        setError('No code received from AI. Please try again.')
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid request. Check your API key and try again.')
      } else if (err.response?.status === 403) {
        setError('API key is invalid or has been revoked. Please update your key.')
        setShowKeyInput(true)
      } else if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.')
      } else {
        setError('Failed to generate code: ' + (err.message || 'Unknown error'))
      }
    } finally {
      setGeneratingCode(false)
    }
  }

  function formatResponse(text) {
    // Simple markdown-like formatting
    return text.split('\n').map((line, i) => {
      // Bold text between ** **
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>
        }
        // Inline code between ` `
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

      // Check if line starts with a number (step)
      const isStep = /^\d+[\.\)]/.test(line.trim())
      // Check if line starts with # (heading)
      const isHeading = /^#{1,3}\s/.test(line.trim())

      if (isHeading) {
        const headingText = line.replace(/^#{1,3}\s/, '')
        return (
          <p key={i} style={{ fontWeight: 'bold', fontSize: '1.05em', marginTop: '12px', marginBottom: '4px' }}>
            {headingText}
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
      {/* API Key configuration */}
      {showKeyInput && (
        <div className={`p-3 border-bottom ${dark ? 'border-dark' : ''}`}>
          <div className="d-flex align-items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API key..."
              className={`form-control form-control-sm rounded-pill ${dark ? 'bg-prime-dark text-light border-dark' : ''}`}
              onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
            />
            <button
              onClick={saveApiKey}
              className="btn btn-primary btn-sm rounded-pill text-nowrap"
            >
              Save
            </button>
            <button
              onClick={() => setShowKeyInput(false)}
              className={`btn btn-sm rounded-pill ${dark ? 'text-light' : 'text-dark'}`}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <small className={`${dark ? 'text-secondary' : 'text-muted'} mt-1 d-block`}>
            Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary">aistudio.google.com/apikey</a>
          </small>
        </div>
      )}

      {/* Action buttons */}
      <div className={`px-3 py-2 d-flex gap-2 align-items-center border-bottom ${dark ? 'border-dark' : ''}`}>
        <button
          onClick={explainCode}
          disabled={loading || generatingCode}
          className="btn btn-primary btn-sm rounded-pill px-3"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Analyzing...
            </>
          ) : (
            <>
              <i className="bi bi-stars me-2"></i>
              Explain Code
            </>
          )}
        </button>
        <button
          onClick={() => setShowInstructionInput(prev => !prev)}
          disabled={loading || generatingCode}
          className="btn btn-success btn-sm rounded-pill px-3"
        >
          <i className="bi bi-pencil-square me-2"></i>
          Instructions
        </button>
        {response && (
          <button
            onClick={clearResponse}
            className={`btn btn-sm rounded-pill ${dark ? 'btn-outline-light' : 'btn-outline-secondary'}`}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Clear
          </button>
        )}
        <button
          onClick={() => setShowKeyInput(prev => !prev)}
          className={`btn btn-sm rounded-pill ms-auto ${dark ? 'text-light' : 'text-dark'}`}
          title="Configure API Key"
        >
          <i className="bi bi-gear"></i>
        </button>
      </div>

      {/* Instruction input */}
      {showInstructionInput && (
        <div className={`px-3 py-2 border-bottom ${dark ? 'border-dark' : ''}`}>
          <div className="d-flex gap-2 align-items-start">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={`Describe what ${language || ''} code you want to generate...\ne.g. "Write a function to sort an array using bubble sort"`}
              className={`form-control form-control-sm rounded-4 ${dark ? 'bg-prime-dark text-light border-dark' : ''}`}
              rows={3}
              style={{ resize: 'none', fontSize: '0.85rem' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) generateCode() }}
            />
            <button
              onClick={generateCode}
              disabled={generatingCode}
              className="btn btn-success btn-sm rounded-pill px-3 text-nowrap"
            >
              {generatingCode ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Generating...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill me-1"></i>
                  Generate
                </>
              )}
            </button>
          </div>
          <small className={`${dark ? 'text-secondary' : 'text-muted'} mt-1 d-block`}>
            Press Ctrl+Enter to generate. Code will be inserted into the editor.
          </small>
        </div>
      )}

      {/* Response area */}
      <div className={`flex-grow-1 overflow-auto p-3 ${dark ? 'bg-prime-dark' : 'bg-white'}`} style={{ fontSize: '0.9rem' }}>
        {error && (
          <div className="alert alert-danger py-2 rounded-4 d-flex align-items-start" role="alert">
            <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
            <span>{error}</span>
          </div>
        )}

        {loading && !response && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className={`${dark ? 'text-secondary' : 'text-muted'} m-0`}>
              AI is analyzing your code...
            </p>
          </div>
        )}

        {response && (
          <div className="ai-response" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {formatResponse(response)}
          </div>
        )}

        {!response && !loading && !error && (
          <div className="text-center py-5">
            <i className={`bi bi-robot d-block mb-3 ${dark ? 'text-secondary' : 'text-muted'}`} style={{ fontSize: '2.5rem' }}></i>
            <p className={`${dark ? 'text-secondary' : 'text-muted'} m-0 fw-medium`}>
              AI Code Explainer
            </p>
            <small className={`${dark ? 'text-secondary' : 'text-muted'}`}>
              Click "Explain Code" to get a step-by-step explanation, or "Instructions" to generate code from a description
            </small>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIIntelligence
