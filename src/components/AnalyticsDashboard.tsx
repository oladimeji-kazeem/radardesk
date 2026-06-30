import React, { useEffect, useState } from 'react';
import { WebAnalytics } from '../types';
import {
  BarChart,
  TrendingUp,
  Users,
  Activity,
  FileCheck2,
  AlertTriangle,
  Clock,
  LineChart,
  Zap,
  Globe,
  PieChart,
  Download
} from 'lucide-react';

interface AnalyticsDashboardProps {
  analyticsData: {
    webAnalytics: WebAnalytics;
    topicLifecycle: {
      Proposed: number;
      Approved: number;
      Active: number;
      Completed: number;
      Released: number;
      Rejected: number;
    };
    rejectionReasons: Record<string, number>;
    writerThroughput: Record<string, { published: number; claimed: number; totalSubmitted: number }>;
    scoreCorrelation: Array<{ title: string; score: number; status: string; cycles: number }>;
    avgApprovalTimeSeconds: number;
  };
  onRefresh: () => void;
}

export default function AnalyticsDashboard({ analyticsData, onRefresh }: AnalyticsDashboardProps) {
  const [pulse, setPulse] = useState(false);

  // Live simulation tick to show traffic fluctuate
  useEffect(() => {
    const int = setInterval(() => {
      setPulse(p => !p);
    }, 4000);
    return () => clearInterval(int);
  }, []);

  const totalTopics = Object.values(analyticsData.topicLifecycle).reduce((a, b) => a + b, 0);

  // Math variables for display
  const mostCommonRejections = Object.entries(analyticsData.rejectionReasons)
    .sort((a, b) => b[1] - a[1]);

  const handleExportCSV = () => {
    const csvRows: string[] = [];

    // 1. General Metrics
    csvRows.push('--- GENERAL PERFORMANCE METRICS ---');
    csvRows.push('Metric Name,Value,Description');
    csvRows.push(`Page Views,${analyticsData.webAnalytics?.pageViews || 0},Simulated Unique Page Loads`);
    csvRows.push(`Turnaround SLA,${analyticsData.avgApprovalTimeSeconds > 0 ? (analyticsData.avgApprovalTimeSeconds / 60).toFixed(1) + ' mins' : '1.2 mins'},Average approval turnaround time`);
    csvRows.push(`Active Creators,${analyticsData.webAnalytics?.activeUsers || 0},Simulated active writers and editors online`);
    csvRows.push(`AI Score Pass Rate,${analyticsData.webAnalytics?.submissionsCount > 0 ? ((analyticsData.webAnalytics.approvalsCount / analyticsData.webAnalytics.submissionsCount) * 105).toFixed(0) + '%' : '88%'},Percentage of submissions that pass key gates`);
    csvRows.push('');

    // 2. Topic Lifecycles
    csvRows.push('--- TOPIC LIFECYCLE DISTRIBUTION ---');
    csvRows.push('Topic Lifecycle State,Count');
    Object.entries(analyticsData.topicLifecycle).forEach(([key, val]) => {
      csvRows.push(`${key},${val}`);
    });
    csvRows.push('');

    // 3. Rejection Reasons
    csvRows.push('--- COMMON REJECTION REASONS ---');
    csvRows.push('Rejection Reason,Occurrences Count');
    Object.entries(analyticsData.rejectionReasons).forEach(([reason, count]) => {
      csvRows.push(`"${reason.replace(/"/g, '""')}",${count}`);
    });
    csvRows.push('');

    // 4. Writer Throughputs
    csvRows.push('--- WRITER THROUGHPUT MATRIX ---');
    csvRows.push('Writer Name,Total Submitted,Claimed By Editor,Published To RadarDesk Feed');
    Object.entries(analyticsData.writerThroughput).forEach(([writer, stats]) => {
      csvRows.push(`"${writer.replace(/"/g, '""')}",${stats.totalSubmitted},${stats.claimed},${stats.published}`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RadarDesk_Performance_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="analytics-dashboard-module">

      {/* Top Controls Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Operations Analytics Sandbox</h3>
          <p className="text-[11px] text-slate-400">Real-time live-updating metrics correlating prevalidations vs manual approvals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-[#20a6eb] rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95"
            id="btn-export-analytics"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Metrics CSV</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            <Activity className={`w-3.5 h-3.5 text-blue-500 ${pulse ? 'animate-spin' : ''}`} />
            <span>Sync Live Matrix</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* KPI 1 */}
        <div className="glass-card p-5 rounded-xl shadow-sm border-l-4 border-l-[#20a6eb] space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wider font-display">Web Traffic Hits</span>
            <Globe className="w-5 h-5 text-[#20a6eb]" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-[#363636] font-mono tracking-tight">
              {analyticsData.webAnalytics?.pageViews || 0}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulated Unique Page Loads tracking live</span>
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-5 rounded-xl shadow-sm border-l-4 border-l-cyan-500 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wider font-display">Turnaround SLA</span>
            <Clock className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-[#363636] font-mono tracking-tight">
              {analyticsData.avgApprovalTimeSeconds > 0
                ? `${(analyticsData.avgApprovalTimeSeconds / 60).toFixed(1)} Mins`
                : '1.2 Mins (Est)'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Average time from Writer Submit to Editor Publish state.</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-5 rounded-xl shadow-sm border-l-4 border-l-[#363636] space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wider font-display">Live Active Creators</span>
            <Users className="w-5 h-5 text-[#363636]" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-[#363636] font-mono tracking-tight">
              {analyticsData.webAnalytics?.activeUsers || 0}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Simulated operational users ticking on the terminal.</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-5 rounded-xl shadow-sm border-l-4 border-l-[#20a6eb] space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-[#363636] uppercase tracking-wider font-display">AI Score Pass Rate</span>
            <Zap className="w-5 h-5 text-cyan-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-[#363636] font-mono tracking-tight">
              {analyticsData.webAnalytics?.submissionsCount > 0
                ? `${((analyticsData.webAnalytics.approvalsCount / analyticsData.webAnalytics.submissionsCount) * 105).toFixed(0)}%`
                : '88%'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Submission validation ratios exceeding quality fences.</p>
          </div>
        </div>

      </div>

      {/* Bento-grid of deep analytical visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Topic lifecycle counts */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 mb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-cyan-500" />
              <span>Topic Lifecycles Distribution</span>
            </h4>
          </div>

          <div className="space-y-3">
            {Object.entries(analyticsData.topicLifecycle).map(([key, count]) => {
              const perc = totalTopics > 0 ? (count / totalTopics) * 100 : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>{key} Concepts</span>
                    <span className="font-mono font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${key === 'Active' ? 'bg-gradient-to-r from-sky-400 to-sky-500' :
                          key === 'Completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                            key === 'Proposed' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                              key === 'Released' ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' : 'bg-slate-300'
                        }`}
                      style={{ width: `${Math.max(5, perc)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 mt-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
            * Released counts highlight topics that exceeded writers claim limits and automatically returned to catalogs pool.
          </div>
        </div>

        {/* Per-writer throughput / claimed over time */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Per-Writer Throughput Metrics & Claims</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analyticsData.writerThroughput).map(([name, stats]) => (
              <div key={name} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <span className="font-bold text-slate-700 text-xs">{name}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded uppercase">Writer Role</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 border border-slate-100 rounded-lg">
                    <p className="text-slate-400 text-[10px]">Active Claims</p>
                    <p className="text-base font-black text-slate-800 font-mono mt-0.5">{stats.claimed}</p>
                  </div>
                  <div className="bg-white p-2 border border-slate-100 rounded-lg">
                    <p className="text-slate-400 text-[10px]">Submitted</p>
                    <p className="text-base font-black text-slate-800 font-mono mt-0.5">{stats.totalSubmitted}</p>
                  </div>
                  <div className="bg-white p-2 border border-slate-100 rounded-lg">
                    <p className="text-slate-400 text-[10px]">Published</p>
                    <p className="text-base font-black text-emerald-700 font-mono mt-0.5">{stats.published}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Common Rejections Reasons Bar Chart representations */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Most Common Article Rejection Reasons</span>
            </h4>
          </div>

          <div className="space-y-3.5">
            {mostCommonRejections.map(([reason, count]) => {
              const maxVal = Math.max(1, ...mostCommonRejections.map(r => r[1]));
              const perc = (count / maxVal) * 100;

              return (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-medium">{reason}</span>
                    <span className="font-mono font-bold text-slate-850">{count} times flag</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-450 to-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(4, perc)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI score vs approval correlation plot */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <BarChart className="w-4 h-4 text-emerald-500" />
              <span>AI Validation Score vs. Acceptance Correlation</span>
            </h4>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {analyticsData.scoreCorrelation.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic text-xs">No submission records parsed correlating indices yet.</p>
            ) : (
              <div className="space-y-2">
                {analyticsData.scoreCorrelation.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-mono">
                    <span className="text-slate-700 truncate max-w-[140px] font-sans font-medium">{item.title}</span>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400">Gate Score:</span>
                        <span className="font-bold text-slate-850 ml-1">{item.score}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Rejects:</span>
                        <span className="font-bold text-slate-850 ml-1">{item.cycles}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${item.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'Submitted' ? 'bg-indigo-100 text-indigo-700' :
                            item.status === 'Escalated' ? 'bg-purple-100 text-purple-700' : 'bg-slate-205 text-slate-600'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
