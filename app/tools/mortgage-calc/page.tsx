"use client";

import { useState } from "react";
import Link from "next/link";

interface MonthlyResult {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remaining: number;
}

function calcEqualPayment(principal: number, annualRate: number, months: number): MonthlyResult[] {
  const r = annualRate / 100 / 12;
  const payment = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const results: MonthlyResult[] = [];
  let remaining = principal;
  for (let i = 1; i <= months; i++) {
    const interest = remaining * r;
    const principalPart = payment - interest;
    remaining -= principalPart;
    results.push({ month: i, payment, principal: principalPart, interest, remaining: Math.max(0, remaining) });
  }
  return results;
}

function calcEqualPrincipal(principal: number, annualRate: number, months: number): MonthlyResult[] {
  const r = annualRate / 100 / 12;
  const monthlyPrincipal = principal / months;
  const results: MonthlyResult[] = [];
  let remaining = principal;
  for (let i = 1; i <= months; i++) {
    const interest = remaining * r;
    const payment = monthlyPrincipal + interest;
    remaining -= monthlyPrincipal;
    results.push({ month: i, payment, principal: monthlyPrincipal, interest, remaining: Math.max(0, remaining) });
  }
  return results;
}

export default function MortgageCalcPage() {
  const [loanAmount, setLoanAmount] = useState("100");
  const [annualRate, setAnnualRate] = useState("3.95");
  const [loanYears, setLoanYears] = useState("30");
  const [results, setResults] = useState<{ equal: MonthlyResult[]; principal: MonthlyResult[] } | null>(null);

  function calculate() {
    const p = parseFloat(loanAmount) * 10000;
    const r = parseFloat(annualRate);
    const m = parseInt(loanYears) * 12;
    if (!p || !r || !m) return;
    setResults({
      equal: calcEqualPayment(p, r, m),
      principal: calcEqualPrincipal(p, r, m),
    });
  }

  const totalEqual = results ? results.equal.reduce((s, r) => s + r.payment, 0) : 0;
  const totalPrincipal = results ? results.principal.reduce((s, r) => s + r.payment, 0) : 0;

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <nav className="glass-card bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/">
              <span className="text-xl font-bold tracking-tight text-slate-800">RapidLab</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm">房贷计算器</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-calculator text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">房贷计算器</h1>
            <p className="text-slate-500 text-sm mt-1">最新利率支持，等额本息与等额本金对比分析。</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-2">贷款金额（万元）</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-2">年利率（%）</label>
              <input
                type="number"
                step="0.01"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="3.95"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-2">贷款年限（年）</label>
              <input
                type="number"
                value={loanYears}
                onChange={(e) => setLoanYears(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="30"
              />
            </div>
          </div>
          <button
            onClick={calculate}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-calculator mr-2"></i>开始计算
          </button>
        </div>

        {results && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                等额本息
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">每月还款</span>
                  <span className="font-semibold text-slate-800">¥{results.equal[0].payment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">还款总额</span>
                  <span className="font-semibold text-slate-800">¥{(totalEqual / 10000).toFixed(2)} 万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">支付利息</span>
                  <span className="font-semibold text-red-500">¥{((totalEqual - parseFloat(loanAmount) * 10000) / 10000).toFixed(2)} 万</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                等额本金
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">首月还款</span>
                  <span className="font-semibold text-slate-800">¥{results.principal[0].payment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">还款总额</span>
                  <span className="font-semibold text-slate-800">¥{(totalPrincipal / 10000).toFixed(2)} 万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">支付利息</span>
                  <span className="font-semibold text-green-600">¥{((totalPrincipal - parseFloat(loanAmount) * 10000) / 10000).toFixed(2)} 万</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2026 RapidLab. 版权所有</p>
        </div>
      </footer>
    </div>
  );
}
