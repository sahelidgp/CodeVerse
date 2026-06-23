import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/oneCompiler";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentProblemId, setCurrentProblemId] = useState("two-sum");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(PROBLEMS[currentProblemId].starterCode.javascript);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // State for Test Cases UI
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [actualOutputs, setActualOutputs] = useState([]);

  const currentProblem = PROBLEMS[currentProblemId];

  // Update problem when URL param changes
  useEffect(() => {
    if (id && PROBLEMS[id]) {
      setCurrentProblemId(id);
      setCode(PROBLEMS[id].starterCode[selectedLanguage]);
      setOutput(null);
      // Reset test case states on problem change
      setActualOutputs([]);
      setActiveTestCase(0);
    }
  }, [id, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
    setActualOutputs([]); // Reset on language change
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (output) => {
    if (!output) return "";
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setActualOutputs([]); // Clear previous actual outputs

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      const testsPassed = checkIfTestsPassed(result.output, expectedOutput);

      // Split output into an array to match with individual test cases
      const outputArray = result.output ? result.output.split('\n') : [];
      setActualOutputs(outputArray);

      if (testsPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Tests failed. Check your output!");
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left panel - Problem Description */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={Object.values(PROBLEMS)}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* Right panel - Code Editor & Output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={60} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Test Cases & Output Panel */}
              <Panel defaultSize={40} minSize={30}>
                <div className="h-full bg-[#1e1e1e] flex flex-col overflow-auto">
                  
                  {/* Test Cases UI */}
                  <div className="p-4 flex-shrink-0 border-b border-gray-700">
                    
                    {/* Header & Overall Status */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-bold text-gray-300">Test Cases</p>
                      
                      {/* BIG STATUS TEXT (Shows only after running) */}
                      {actualOutputs.length > 0 && (
                        <p className={`font-bold text-xl ${
                          currentProblem.examples.every((ex, i) => normalizeOutput(actualOutputs[i] || "") === normalizeOutput(ex.output))
                            ? "text-green-500"
                            : "text-red-500"
                        }`}>
                          {currentProblem.examples.every((ex, i) => normalizeOutput(actualOutputs[i] || "") === normalizeOutput(ex.output))
                            ? "Accepted"
                            : "Wrong Answer"}
                        </p>
                      )}
                    </div>
                    
                    {/* The Tabs */}
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {currentProblem.examples.map((example, index) => {
                        // Logic to determine if this specific tab passed or failed
                        const hasRun = actualOutputs.length > 0;
                        const isPassed = hasRun && normalizeOutput(actualOutputs[index] || "") === normalizeOutput(example.output);
                        
                        // Determine the text color based on execution status
                        let textColor = "text-gray-400";
                        if (hasRun) {
                          textColor = isPassed ? "text-green-500" : "text-red-500";
                        } else if (activeTestCase === index) {
                          textColor = "text-white";
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => setActiveTestCase(index)}
                            className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 font-semibold ${textColor} ${
                              activeTestCase === index 
                                ? "bg-[#2d2d2d]" 
                                : "bg-transparent hover:bg-[#252525]"
                            }`}
                          >
                            {/* Colored dot indicator */}
                            {hasRun && (
                              <span className="text-xl leading-none mb-1">•</span>
                            )}
                            Case {index + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* The Content for the Active Tab */}
                    <div className="bg-[#2d2d2d] p-4 rounded-md text-sm font-mono text-white">
                      <div className="mb-4">
                        <span className="text-gray-400 block mb-1">Input:</span>
                        <span className="font-semibold break-all">{currentProblem.examples[activeTestCase].input}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 block mb-1">Expected Output:</span>
                        <span className="font-semibold break-all">{currentProblem.examples[activeTestCase].output}</span>
                      </div>

                      {/* Actual Output shown conditionally after running code */}
                      {actualOutputs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <span className="text-gray-400 block mb-1">Actual Output:</span>
                          <span className={`font-semibold break-all ${
                            normalizeOutput(actualOutputs[activeTestCase] || "") === normalizeOutput(currentProblem.examples[activeTestCase].output) 
                              ? "text-green-500" 
                              : "text-red-500"
                          }`}>
                            {actualOutputs[activeTestCase] || "No output"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Existing Output Panel (Useful for Compilation Errors / Logs) */}
                  <div className="flex-1 p-4">
                    <p className="font-bold mb-2 text-gray-300">Raw Console Logs</p>
                    <OutputPanel output={output} />
                  </div>

                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;