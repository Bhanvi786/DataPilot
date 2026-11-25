import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Search, Sparkles, Send, ArrowRight, CornerDownLeft, BarChart2, Table as TableIcon, CheckCircle2, HelpCircle } from 'lucide-react';
import { queryDataset } from '../services/api';

const SAMPLE_QUERIES = [
  "Which area had max sales",
  "Total sales by category",
  "Average price by product",
  "Top 5 cities by revenue",
  "How many rows are in the dataset"
];

export const NaturalSearchEngine = ({ datasetId, version = 'cleaned' }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'

  const handleSearch = async (queryText) => {
    const q = (queryText !== undefined ? queryText : query).trim();
    if (!q || !datasetId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await queryDataset(datasetId, q, version);
      setResult(res);
      if (res && res.chart) {
        setViewMode('chart');
      } else {
        setViewMode('table');
      }
    } catch (err) {
      console.error('Search query failed:', err);
      setError(err.response?.data?.detail || 'Failed to process query. Please try phrasing differently.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Decorative gradient header accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20C997] via-[#6EE7B7] to-[#20C997]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Ask DataPilot Search Engine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#20C997]/20 text-[#6EE7B7] border border-[#20C997]/30 uppercase tracking-wider">
                  Instant Answers
                </span>
              </h2>
              <p className="text-xs text-[#A7B5AE]">
                Ask questions in plain English (e.g., &ldquo;Which area had max sales&rdquo;, &ldquo;Total revenue by city&rdquo;)
              </p>
            </div>
          </div>
        </div>

        {/* Example query chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#A7B5AE] font-medium mr-1">Try:</span>
          {SAMPLE_QUERIES.slice(0, 3).map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sample);
                handleSearch(sample);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#14231E] border border-[#244536] text-[#A7B5AE] hover:text-[#20C997] hover:border-[#20C997]/60 transition-all font-medium"
            >
              &ldquo;{sample}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-[#A7B5AE]">
          <Search size={18} className={loading ? 'text-[#20C997] animate-pulse' : ''} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. Which area had max sales? Or what is the average profit by category?"
          className="w-full pl-11 pr-28 py-3.5 bg-[#14231E] border border-[#244536] rounded-xl text-sm text-white placeholder-[#52796F] focus:outline-none focus:border-[#20C997] focus:ring-1 focus:ring-[#20C997] transition-all shadow-inner"
        />
        <div className="absolute right-2.5 flex items-center gap-1.5">
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#20C997] hover:bg-[#6EE7B7] text-[#080D0C] font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#20C997]/20"
          >
            {loading ? (
              <span className="animate-spin inline-block mr-1">⟳</span>
            ) : (
              <Send size={13} />
            )}
            <span>Ask</span>
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && result.success && (
        <div className="mt-5 p-5 bg-[#14231E]/80 border border-[#244536] rounded-xl space-y-4 animate-in fade-in duration-200">
          {/* Answer Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#244536]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#20C997]/20 border border-[#20C997]/40 flex items-center justify-center text-[#20C997] shrink-0 mt-0.5">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div
                  className="text-sm font-semibold text-white leading-relaxed"
                  dangerouslySetSolitaryMarkdown={false}
                  dangerouslySetInnerHTML={{
                    __html: result.answer.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#20C997] font-black">$1</strong>')
                  }}
                />
                {result.interpretation && (
                  <div className="text-[11px] text-[#A7B5AE] mt-1 flex flex-wrap items-center gap-3">
                    {result.interpretation.detected_dimension && (
                      <span>Grouped by: <strong className="text-white">{result.interpretation.detected_dimension}</strong></span>
                    )}
                    {result.interpretation.detected_metric && (
                      <span>Metric: <strong className="text-white">{result.interpretation.detected_metric}</strong></span>
                    )}
                    {result.interpretation.aggregation && (
                      <span>Operation: <strong className="text-white">{result.interpretation.aggregation}</strong></span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Toggle chart / table view */}
            {result.chart && result.table && (
              <div className="flex items-center gap-1 bg-[#0D1512] p-1 rounded-lg border border-[#244536] self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    viewMode === 'chart'
                      ? 'bg-[#20C997] text-[#080D0C]'
                      : 'text-[#A7B5AE] hover:text-white'
                  }`}
                >
                  <BarChart2 size={13} /> Chart
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-[#20C997] text-[#080D0C]'
                      : 'text-[#A7B5AE] hover:text-white'
                  }`}
                >
                  <TableIcon size={13} /> Table
                </button>
              </div>
            )}
          </div>

          {/* Visualization or Table Content */}
          {viewMode === 'chart' && result.chart ? (
            <div className="w-full h-72">
              <Plot
                data={[
                  {
                    type: 'bar',
                    x: result.chart.x,
                    y: result.chart.y,
                    marker: {
                      color: result.chart.y.map((_, i) =>
                        i === 0 ? '#20C997' : '#145A46'
                      ),
                      line: { color: '#6EE7B7', width: 1 }
                    },
                    hoverinfo: 'x+y'
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 50, r: 20, t: 30, b: 60 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { color: '#A7B5AE', family: 'Inter, sans-serif' },
                  xaxis: {
                    title: { text: result.chart.x_label, font: { size: 11, color: '#A7B5AE' } },
                    tickangle: -25,
                    gridcolor: '#1a3328',
                    color: '#A7B5AE'
                  },
                  yaxis: {
                    title: { text: result.chart.y_label, font: { size: 11, color: '#A7B5AE' } },
                    gridcolor: '#1a3328',
                    color: '#A7B5AE'
                  }
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : result.table && result.table.length > 0 ? (
            <div className="overflow-x-auto max-h-60 rounded-lg border border-[#244536]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D1512] text-[#A7B5AE] uppercase font-bold sticky top-0">
                  <tr>
                    {Object.keys(result.table[0]).map((colName) => (
                      <th key={colName} className="px-4 py-2.5 border-b border-[#244536]">
                        {colName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#244536]/60 text-white">
                  {result.table.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx === 0 ? 'bg-[#20C997]/10 font-bold' : 'hover:bg-[#1a3328]/50'}
                    >
                      {Object.values(row).map((val, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2 font-mono">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
