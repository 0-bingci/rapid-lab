"use client";

import { useState } from "react";
import Link from "next/link";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function formatJson() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError("JSON 格式错误：" + (e as Error).message);
      setOutput("");
    }
  }

  function compressJson() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError("JSON 格式错误：" + (e as Error).message);
      setOutput("");
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setError("");
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <nav className="glass-card bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/">
              <span className="text-xl font-bold tracking-tight text-slate-800">
                RapidLab
              </span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm">JSON 格式化</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-code text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">JSON 格式化</h1>
            <p className="text-slate-500 text-sm mt-1">
              一键美化或压缩 JSON 字符串，支持高亮显示与语法校验。
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={formatJson}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-magic mr-2"></i>美化
          </button>
          <button
            onClick={compressJson}
            className="px-5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <i className="fas fa-compress-alt mr-2"></i>压缩
          </button>
          <button
            onClick={copyOutput}
            className="px-5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <i className="fas fa-copy mr-2"></i>复制结果
          </button>
          <button
            onClick={clearAll}
            className="px-5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:border-red-400 hover:text-red-500 transition-colors ml-auto"
          >
            <i className="fas fa-trash mr-2"></i>清空
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 mb-2">
              输入 JSON
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-96 p-4 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder='{"key": "value"}'
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-600 mb-2">
              输出结果
            </label>
            <textarea
              readOnly
              value={output}
              className="flex-1 min-h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 focus:outline-none resize-none"
              placeholder="格式化结果将显示在这里..."
            />
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2026 RapidLab. 版权所有</p>
        </div>
      </footer>
    </div>
  );
}
