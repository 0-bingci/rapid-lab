"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { evaluate } from "mathjs";

interface Group {
  label: string;
  values: Record<string, number>;
}

interface Scenario {
  name: string;
  varsInput: string;
  formula: string;
  formulaDesc: string;
  groups: Group[];
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    name: "💧 桶装水比价",
    varsInput: "p v",
    formula: "p / v",
    formulaDesc: "p = 价格(元)，v = 容量(L)，结果越小越划算",
    groups: [
      { label: "农夫 19L", values: { p: 28, v: 19 } },
      { label: "景田 15L", values: { p: 20, v: 15 } },
    ],
  },
  {
    name: "🧻 抽纸比价",
    varsInput: "p s l",
    formula: "p / (s * l) * 100",
    formulaDesc: "p = 价格(元)，s = 抽数，l = 层数，结果为每百张单层价格",
    groups: [
      { label: "得宝", values: { p: 45, s: 90, l: 4 } },
      { label: "清风", values: { p: 25, s: 120, l: 3 } },
    ],
  },
];

const STORAGE_KEY = "rapidlab_price_compare_v1";

function calcResult(formula: string, values: Record<string, number>): string {
  try {
    const res = evaluate(formula, values);
    return typeof res === "number" && isFinite(res) ? res.toFixed(4) : "---";
  } catch {
    return "---";
  }
}

function getVarsList(varsInput: string): string[] {
  return varsInput.trim().split(/\s+/).filter(Boolean);
}

function getBestIdx(scenario: Scenario): number {
  if (scenario.groups.length <= 1) return -1;
  const results = scenario.groups.map((g) => {
    const val = calcResult(scenario.formula, g.values);
    return val === "---" ? Infinity : parseFloat(val);
  });
  const min = Math.min(...results);
  if (!isFinite(min)) return -1;
  return results.indexOf(min);
}

export default function PriceComparePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setScenarios(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  }, [scenarios, loaded]);

  const current = scenarios[activeIdx] ?? null;

  const updateCurrent = useCallback(
    (patch: Partial<Scenario>) => {
      setScenarios((prev) =>
        prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s))
      );
    },
    [activeIdx]
  );

  function addScenario() {
    const next: Scenario = {
      name: "新场景",
      varsInput: "a b",
      formula: "a / b",
      formulaDesc: "",
      groups: [],
    };
    setScenarios((prev) => [...prev, next]);
    setActiveIdx(scenarios.length);
  }

  function deleteScenario() {
    if (!confirm("确定删除整个场景吗？")) return;
    setScenarios((prev) => prev.filter((_, i) => i !== activeIdx));
    setActiveIdx(Math.max(0, activeIdx - 1));
  }

  function addGroup() {
    if (!current) return;
    const vars = getVarsList(current.varsInput);
    const vals: Record<string, number> = {};
    vars.forEach((v) => (vals[v] = 0));
    updateCurrent({
      groups: [...current.groups, { label: "新选项", values: vals }],
    });
  }

  function updateGroup(gIdx: number, patch: Partial<Group>) {
    if (!current) return;
    updateCurrent({
      groups: current.groups.map((g, i) =>
        i === gIdx ? { ...g, ...patch } : g
      ),
    });
  }

  function updateGroupValue(gIdx: number, varName: string, value: number) {
    if (!current) return;
    const group = current.groups[gIdx];
    updateGroup(gIdx, { values: { ...group.values, [varName]: value } });
  }

  function removeGroup(gIdx: number) {
    if (!current) return;
    updateCurrent({ groups: current.groups.filter((_, i) => i !== gIdx) });
  }

  if (!loaded) return null;

  const varsList = current ? getVarsList(current.varsInput) : [];
  const bestIdx = current ? getBestIdx(current) : -1;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <nav className="glass-card bg-white/80 border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-xl font-bold tracking-tight text-slate-800">
                RapidLab
              </span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm">万能比价引擎</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto w-full pb-20">
        {/* Scenario tabs */}
        <div className="sticky top-16 z-10 bg-gray-100 pt-4 pb-2 px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {scenarios.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-bold transition-all shadow-sm text-sm ${
                  activeIdx === i
                    ? "bg-indigo-600 text-white shadow-indigo-200 scale-105"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {s.name}
              </button>
            ))}
            <button
              onClick={addScenario}
              className="px-5 py-2 rounded-full bg-emerald-500 text-white font-bold shadow-sm text-sm hover:bg-emerald-600 flex-shrink-0"
            >
              + 新场景
            </button>
          </div>
        </div>

        {current && (
          <div className="px-4 mt-2">
            {/* Scenario config */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <input
                  value={current.name}
                  onChange={(e) => updateCurrent({ name: e.target.value })}
                  className="text-xl font-black text-gray-800 border-b-2 border-transparent focus:border-indigo-500 outline-none w-1/2 bg-transparent"
                />
                <button
                  onClick={deleteScenario}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  删除此场景
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    变量定义
                  </label>
                  <input
                    value={current.varsInput}
                    onChange={(e) =>
                      updateCurrent({ varsInput: e.target.value })
                    }
                    placeholder="变量名 用空格隔开"
                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    计算公式
                  </label>
                  <input
                    value={current.formula}
                    onChange={(e) => updateCurrent({ formula: e.target.value })}
                    placeholder="例如: p / v"
                    className="w-full mt-1 p-3 bg-indigo-50 text-indigo-700 font-mono rounded-xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  />
                  <input
                    value={current.formulaDesc}
                    onChange={(e) => updateCurrent({ formulaDesc: e.target.value })}
                    placeholder="释义：例如 p = 价格(元)，v = 容量(L)"
                    className="w-full mt-2 p-2 px-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Comparison groups */}
            <div className="space-y-4">
              {current.groups.map((group, gIdx) => {
                const isBest = gIdx === bestIdx;
                const result = calcResult(current.formula, group.values);
                return (
                  <div
                    key={gIdx}
                    className={`bg-white rounded-2xl p-5 border-2 transition-all relative ${
                      isBest
                        ? "border-emerald-500 shadow-lg shadow-emerald-50"
                        : "border-transparent shadow-sm"
                    }`}
                  >
                    {isBest && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold tracking-tighter">
                        最划算
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <input
                          value={group.label}
                          onChange={(e) =>
                            updateGroup(gIdx, { label: e.target.value })
                          }
                          placeholder="选项名称"
                          className="font-bold text-gray-700 w-full outline-none mb-3 bg-transparent border-b border-transparent focus:border-gray-300"
                        />
                        <div className="flex flex-wrap gap-2">
                          {varsList.map((v) => (
                            <div
                              key={v}
                              className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-100"
                            >
                              <span className="text-[10px] font-black text-gray-300 mr-2 uppercase">
                                {v}
                              </span>
                              <input
                                type="number"
                                value={group.values[v] ?? 0}
                                onChange={(e) =>
                                  updateGroupValue(
                                    gIdx,
                                    v,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="bg-transparent w-14 outline-none text-sm font-semibold"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end sm:min-w-[120px] gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            结果
                          </p>
                          <p
                            className={`text-2xl font-black italic ${
                              isBest ? "text-emerald-600" : "text-indigo-600"
                            }`}
                          >
                            {result}
                          </p>
                        </div>
                        <button
                          onClick={() => removeGroup(gIdx)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addGroup}
              className="w-full mt-6 py-4 bg-gray-800 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform hover:bg-gray-700"
            >
              ＋ 添加对比项
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
