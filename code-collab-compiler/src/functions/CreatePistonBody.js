// Wandbox compiler mapping — use exact compiler names from wandbox.org
const wandboxCompilers = {
  java: 'openjdk-jdk-22+36',
  python: 'cpython-3.12.0',
  javascript: 'nodejs-20.11.0',
  c: 'gcc-13.2.0-c',
  cpp: 'gcc-13.2.0',
  go: 'go-1.22.1',
  rust: 'rust-1.77.0',
  csharp: 'mono-6.12.0.200',
  ruby: 'ruby-3.3.0'
};

export function createWandboxRequestBody(language, code, stdin) {
  const compiler = wandboxCompilers[language];

  if (!compiler) {
    return null;
  }

  const body = {
    code: code,
    codes: [],
    compiler: compiler,
    'compiler-option-raw': '',
    description: '',
    options: '',
    'runtime-option-raw': '',
    stdin: stdin || '',
    title: ''
  };

  return body;
}

// Keep old export name for backward compatibility
export function createPistonRequestBody(language, code, stdin) {
  return createWandboxRequestBody(language, code, stdin);
}
