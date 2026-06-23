import axios from "axios";

// OneCompiler specific language names
const LANGUAGE_MAP = {
  javascript: "nodejs",
  python: "python",
  java: "java",
  "c++": "cpp",
  c: "c",
};

export const executeCode = async (language, sourceCode) => {
  const options = {
    method: 'POST',
    url: 'https://onecompiler-apis.p.rapidapi.com/api/v1/run',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com'
    },
    data: {
      language: LANGUAGE_MAP[language.toLowerCase()],
      stdin: "",
      files: [
        {
          name: "index",
          content: sourceCode
        }
      ]
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    // OneCompiler puts crash logs in 'exception' or syntax errors in 'stderr'
    const hasError = data.stderr || data.exception;
    const output = data.exception || data.stderr || data.stdout;

    return {
      success: !hasError,
      output: output ? output.trim() : "No output generated."
    };

  } catch (error) {
    console.error("OneCompiler Execution Error:", error);
    return {
      success: false,
      output: "Execution failed. The compiler server is temporarily unreachable."
    };
  }
};