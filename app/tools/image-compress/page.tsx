"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import imageCompression from "browser-image-compression";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string;
  compressedFile: File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

export default function ImageCompressPage() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function compressFile(file: File): Promise<CompressedImage> {
    const originalUrl = URL.createObjectURL(file);
    const compressed = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      preserveExif: true,
    });
    const compressedUrl = URL.createObjectURL(compressed);
    return {
      name: file.name,
      originalSize: file.size,
      compressedSize: compressed.size,
      originalUrl,
      compressedUrl,
      compressedFile: compressed,
    };
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setProcessing(true);
    const results: CompressedImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const result = await compressFile(file);
        results.push(result);
      } catch {
        // skip files that fail
      }
    }
    setImages((prev) => [...prev, ...results]);
    setProcessing(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function downloadImage(img: CompressedImage) {
    const a = document.createElement("a");
    a.href = img.compressedUrl;
    const ext = img.name.split(".").pop();
    a.download = img.name.replace(`.${ext}`, `_compressed.${ext}`);
    a.click();
  }

  function downloadAll() {
    images.forEach((img) => downloadImage(img));
  }

  function clearAll() {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
  }

  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = images.reduce((s, i) => s + i.compressedSize, 0);
  const totalSaved =
    totalOriginal > 0
      ? (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1)
      : "0";

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
            <span className="text-slate-500 text-sm">图片无损压缩</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-image text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">图片无损压缩</h1>
            <p className="text-slate-500 text-sm mt-1">
              在保持画质的情况下，大幅度减少图片占用的存储空间。
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
              目标大小上限
            </label>
            <input
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={maxSizeMB}
              onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="text-sm font-semibold text-indigo-600 w-16 text-right">
              {maxSizeMB} MB
            </span>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragging
                ? "border-indigo-400 bg-indigo-50"
                : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {processing ? (
              <div className="text-indigo-600 flex flex-col items-center">
                <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <p className="text-sm font-medium">压缩中，请稍候...</p>
              </div>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-300 mb-3"></i>
                <p className="text-slate-500 font-medium">
                  点击或拖拽图片到这里
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  支持 JPG、PNG、WebP、HEIC 等格式，可批量上传
                </p>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        {images.length > 0 && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">原始总大小</p>
                <p className="text-lg font-bold text-slate-700">
                  {formatSize(totalOriginal)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">压缩后总大小</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatSize(totalCompressed)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">节省空间</p>
                <p className="text-lg font-bold text-green-500">
                  {totalSaved}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <span className="font-medium text-slate-700">
                  压缩结果（{images.length} 张）
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={downloadAll}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <i className="fas fa-download mr-1"></i>全部下载
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i>清空
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {images.map((img, i) => {
                  const saved = (
                    ((img.originalSize - img.compressedSize) /
                      img.originalSize) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                      <img
                        src={img.compressedUrl}
                        alt={img.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {img.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatSize(img.originalSize)}
                          <i className="fas fa-arrow-right mx-2 text-slate-300"></i>
                          {formatSize(img.compressedSize)}
                          <span className="ml-2 text-green-500 font-medium">
                            节省 {saved}%
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => downloadImage(img)}
                        className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex-shrink-0"
                      >
                        <i className="fas fa-download mr-1"></i>下载
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2026 RapidLab. 版权所有</p>
        </div>
      </footer>
    </div>
  );
}
