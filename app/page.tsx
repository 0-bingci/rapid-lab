"use client";

import { useState } from "react";
import Link from "next/link";

const tools = [
  {
    id: "json-formatter",
    href: "/tools/json-formatter",
    iconClass: "fas fa-code",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    iconHoverBg: "group-hover:bg-blue-600",
    shadowHover: "hover:shadow-blue-100",
    name: "JSON 格式化",
    desc: "一键美化或压缩 JSON 字符串，支持高亮显示与语法校验。",
    category: "代码",
  },
  {
    id: "price-compare",
    href: "/tools/price-compare",
    iconClass: "fas fa-balance-scale",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
    iconHoverBg: "group-hover:bg-green-600",
    shadowHover: "hover:shadow-green-100",
    name: "万能比价引擎",
    desc: "自定义变量与公式，多方案并排计算，自动标出最划算选项。",
    category: "生活",
  },
  {
    id: "image-compress",
    href: "/tools/image-compress",
    iconClass: "fas fa-image",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    iconHoverBg: "group-hover:bg-purple-600",
    shadowHover: "hover:shadow-purple-100",
    name: "图片无损压缩",
    desc: "在保持画质的情况下，大幅度减少图片占用的存储空间。",
    category: "其他",
  },
];

const categories = ["全部工具", "学业", "生活", "代码", "其他"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("全部工具");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter((tool) => {
    const matchCategory =
      activeCategory === "全部工具" || tool.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      tool.name.includes(searchQuery) ||
      tool.desc.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-slate-50 text-slate-900 h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="z-50 glass-card bg-white/80 border-b border-slate-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-800">
                RapidLab
              </span>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full text-slate-400 focus-within:text-indigo-600">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="搜一下你需要的工具..."
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category filters */}
          <div className="flex gap-4 overflow-x-auto pb-6 mb-8 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tool cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => {
              const cardClass = `tool-card group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start cursor-pointer hover:shadow-xl ${tool.shadowHover}`;
              const cardContent = (
                <>
                  <div
                    className={`w-12 h-12 ${tool.iconBg} ${tool.iconText} rounded-xl flex items-center justify-center mb-4 ${tool.iconHoverBg} group-hover:text-white transition-colors`}
                  >
                    <i className={`${tool.iconClass} text-xl`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    {tool.desc}
                  </p>
                  <div className="mt-auto flex items-center text-indigo-600 font-semibold text-sm">
                    立即使用
                    <i className="fas fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </>
              );
              return tool.external ? (
                <a
                  key={tool.id}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {cardContent}
                </a>
              ) : (
                <Link key={tool.id} href={tool.href} className={cardClass}>
                  {cardContent}
                </Link>
              );
            })}

            {/* Placeholder cards */}
            <div className="h-64 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
              更多工具开发中...
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2026 RapidLab. 版权所有</p>
        </div>
      </footer>
    </div>
  );
}
