"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { 
  Cpu, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  Layers, 
  Play, 
  Settings, 
  Activity, 
  Terminal,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface RunPodJob {
  id: string;
  category: 'tops' | 'bottoms' | 'one-pieces';
  gpuModel: string;
  executionTime: number; // in seconds
  queueTime: number; // in seconds
  cost: number; // in USD
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE';
  timestamp: string;
}

const INITIAL_JOBS: RunPodJob[] = [
  { id: 'job-rp-91730', category: 'tops', gpuModel: 'NVIDIA RTX 4090', executionTime: 11.8, queueTime: 0.4, cost: 0.0026, status: 'COMPLETED', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 'job-rp-91729', category: 'bottoms', gpuModel: 'NVIDIA RTX 4090', executionTime: 12.5, queueTime: 1.2, cost: 0.0028, status: 'COMPLETED', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'job-rp-91728', category: 'tops', gpuModel: 'NVIDIA RTX 4090', executionTime: 14.1, queueTime: 2.5, cost: 0.0031, status: 'COMPLETED', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: 'job-rp-91727', category: 'one-pieces', gpuModel: 'NVIDIA RTX 4090', executionTime: 0.0, queueTime: 0.8, cost: 0.0001, status: 'FAILED', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'job-rp-91726', category: 'tops', gpuModel: 'NVIDIA RTX 4090', executionTime: 11.2, queueTime: 0.3, cost: 0.0025, status: 'COMPLETED', timestamp: new Date(Date.now() - 60 * 60000).toISOString() }
];

interface LogEntry {
  timestamp: string;
  type: 'info' | 'warn' | 'success' | 'err';
  message: string;
}

export default function RunPodAdminPage() {
  const [jobs, setJobs] = useState<RunPodJob[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 2840,
    activeWorkers: 3,
    avgLatency: 12.4,
    totalCost: 3.36,
    queueSize: 0,
    maxWorkers: 10,
    scaleUpThreshold: 80 // percent GPU utilization
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSimulatingJob, setIsSimulatingJob] = useState(false);
  const [simCategory, setSimCategory] = useState<'tops' | 'bottoms' | 'one-pieces'>('tops');
  
  // Settings configurations (editable)
  const [endpointId, setEndpointId] = useState('v7lif3hwz72hlo-8000');
  const [dockerImage, setDockerImage] = useState('runpod/stable-diffusion-vton:v1.3-4090');

  useEffect(() => {
    setJobs(INITIAL_JOBS);
    setLogs([
      { timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(), type: 'info', message: 'RunPod Serverless Client successfully authenticated.' },
      { timestamp: new Date(Date.now() - 20 * 60000).toLocaleTimeString(), type: 'info', message: 'Active endpoint v7lif3hwz72hlo-8000 scaled to min: 1 instance.' },
      { timestamp: new Date(Date.now() - 10 * 60000).toLocaleTimeString(), type: 'success', message: 'Scale Up Check: Concurrency requirements met (3 active / 10 capacity).' }
    ]);
  }, []);

  // Simulate Triggering a new VTON generation job
  const handleTriggerSimJob = () => {
    if (isSimulatingJob) return;
    setIsSimulatingJob(true);

    const jobId = 'job-rp-' + Math.floor(90000 + Math.random() * 10000);
    const newLogTime = new Date().toLocaleTimeString();

    // Log job submission
    setLogs(prev => [
      ...prev,
      { timestamp: newLogTime, type: 'info', message: `JOB_SUBMIT: VTON Job ${jobId} triggered (category=${simCategory}).` }
    ]);

    // Create a pending job
    const pendingJob: RunPodJob = {
      id: jobId,
      category: simCategory,
      gpuModel: 'NVIDIA RTX 4090',
      executionTime: 0,
      queueTime: 0.5,
      cost: 0,
      status: 'IN_QUEUE',
      timestamp: new Date().toISOString()
    };

    setJobs(prev => [pendingJob, ...prev]);

    // Simulate Job lifecycle stages
    setTimeout(() => {
      // Transition to IN_PROGRESS
      setJobs(prev => prev.map(j => {
        if (j.id === jobId) return { ...j, status: 'IN_PROGRESS' };
        return j;
      }));
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), type: 'info', message: `JOB_RUN: Container node assigned. Worker processing try-on alignment...` }
      ]);

      setTimeout(() => {
        // Complete Job
        const isSuccess = Math.random() > 0.15; // 85% success rate
        const execTime = parseFloat((10 + Math.random() * 5).toFixed(1));
        const jobCost = parseFloat(((execTime * 0.74) / 3600).toFixed(4)); // RTX 4090 rate: $0.74 / hour

        setJobs(prev => prev.map(j => {
          if (j.id === jobId) {
            return {
              ...j,
              status: isSuccess ? 'COMPLETED' : 'FAILED',
              executionTime: isSuccess ? execTime : 0,
              cost: jobCost
            };
          }
          return j;
        }));

        setStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          totalCost: parseFloat((prev.totalCost + jobCost).toFixed(2))
        }));

        if (isSuccess) {
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), type: 'success', message: `JOB_COMPLETED: Try-on job ${jobId} finished successfully in ${execTime}s (Cost: $${jobCost}).` }
          ]);
        } else {
          setLogs(prev => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), type: 'err', message: `JOB_FAILED: Try-on job ${jobId} failed - Out of VRAM error during inference.` }
          ]);
        }

        setIsSimulatingJob(false);
      }, 3500); // 3.5s execution

    }, 2000); // 2s queue time
  };

  // Simulate Scale Up action
  const handleScaleUp = () => {
    if (stats.activeWorkers >= stats.maxWorkers) {
      alert("Max workers capacity reached!");
      return;
    }

    setStats(prev => ({
      ...prev,
      activeWorkers: prev.activeWorkers + 1
    }));

    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), type: 'success', message: `SCALE: Manual trigger. Provisioned NVIDIA RTX 4090 worker container ${stats.activeWorkers + 1}.` }
    ]);
  };

  // Simulate Scale Down action
  const handleScaleDown = () => {
    if (stats.activeWorkers <= 1) {
      alert("At least 1 warm worker pod instance must remain active!");
      return;
    }

    setStats(prev => ({
      ...prev,
      activeWorkers: prev.activeWorkers - 1
    }));

    setLogs(prev => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), type: 'warn', message: `SCALE: Idle container termination. Decommissioned worker instance ${stats.activeWorkers}.` }
    ]);
  };

  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>GPU Computing Control Panel</div>
          <div className={styles.pageSubtitle}>Monitor RunPod serverless VTON generations, scale metrics, and usage costs</div>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.btnGhost} onClick={() => {}} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <RefreshCw size={13} />
            Force Sync API
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        
        {/* KPI Grid */}
        <div className={styles.kpiGrid}>
          {/* Card 1 */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIconWrap} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                <Cpu size={20} color="var(--color-indigo)" />
              </div>
              <span className={styles.kpiTrend} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                Online
              </span>
            </div>
            <div className={styles.kpiLabel}>Total Try-On Runs</div>
            <div className={styles.kpiValue}>{stats.totalRequests.toLocaleString()}</div>
            <div className={styles.kpiSub}>Aggregate completed API jobs</div>
          </div>

          {/* Card 2 */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIconWrap} style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                <Layers size={20} color="var(--color-cyan)" />
              </div>
              <div className={`${styles.kpiTrend} ${styles.trendNeutral}`}>
                RTX 4090
              </div>
            </div>
            <div className={styles.kpiLabel}>Warm GPU Workers</div>
            <div className={styles.kpiValue}>{stats.activeWorkers} / {stats.maxWorkers}</div>
            <div className={styles.kpiSub}>Active Serverless Containers</div>
          </div>

          {/* Card 3 */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIconWrap} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <DollarSign size={20} color="var(--color-amber)" />
              </div>
              <span className={styles.kpiTrend} style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-indigo)' }}>
                $0.74/hr
              </span>
            </div>
            <div className={styles.kpiLabel}>Accrued GPU Cost</div>
            <div className={styles.kpiValue}>${stats.totalCost.toFixed(2)}</div>
            <div className={styles.kpiSub}>Total compute time spent</div>
          </div>

          {/* Card 4 */}
          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div className={styles.kpiIconWrap} style={{ background: 'rgba(5, 150, 105, 0.1)' }}>
                <Clock size={20} color="var(--color-emerald)" />
              </div>
              <span className={styles.kpiTrend} style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)' }}>
                98% success
              </span>
            </div>
            <div className={styles.kpiLabel}>Avg Job Latency</div>
            <div className={styles.kpiValue}>{stats.avgLatency}s</div>
            <div className={styles.kpiSub}>Queue wait + model inference</div>
          </div>
        </div>

        {/* Dashboard split content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Main timeline chart panel */}
          <div className={styles.panel} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
              <h3 className={styles.panelTitle}>
                <Zap size={16} color="var(--color-cyan)" />
                Try-On Load & Latency Distribution
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={styles.panelBadge}>24h Activity Log</span>
              </div>
            </div>

            <div style={{ width: '100%', height: '240px', position: 'relative' }}>
              <svg className={styles.chartSvg} viewBox="0 0 1000 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gpu-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gpu-line-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-cyan)" />
                    <stop offset="50%" stopColor="var(--color-indigo)" />
                    <stop offset="100%" stopColor="var(--color-violet)" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                <line x1="0" y1="40" x2="1000" y2="40" stroke="var(--d-border)" strokeWidth="1" />
                <line x1="0" y1="100" x2="1000" y2="100" stroke="var(--d-border)" strokeWidth="1" />
                <line x1="0" y1="160" x2="1000" y2="160" stroke="var(--d-border)" strokeWidth="1" />
                <line x1="0" y1="220" x2="1000" y2="220" stroke="var(--d-border)" strokeWidth="1" />

                {/* Area Path */}
                <path 
                  className={styles.chartArea}
                  d="M 0 190 L 150 160 L 300 205 L 450 120 L 600 135 L 750 80 L 900 105 L 1000 65 L 1000 220 L 0 220 Z" 
                  fill="url(#gpu-area-gradient)" 
                />

                {/* Line Path */}
                <path 
                  className={styles.chartPath}
                  d="M 0 190 L 150 160 L 300 205 L 450 120 L 600 135 L 750 80 L 900 105 L 1000 65" 
                  fill="none" 
                  stroke="url(#gpu-line-gradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Markers */}
                <circle className={styles.chartDot} cx="150" cy="160" r="4.5" fill="#fff" stroke="var(--color-cyan)" strokeWidth="2.5" />
                <circle className={styles.chartDot} cx="450" cy="120" r="4.5" fill="#fff" stroke="var(--color-indigo)" strokeWidth="2.5" />
                <circle className={styles.chartDot} cx="750" cy="80" r="4.5" fill="#fff" stroke="var(--color-violet)" strokeWidth="2.5" />
                <circle className={styles.chartDot} cx="1000" cy="65" r="5" fill="#fff" stroke="var(--color-violet)" strokeWidth="3" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--d-t4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>12:00 PM</span>
              <span>3:00 PM</span>
              <span>6:00 PM</span>
              <span>9:00 PM</span>
              <span>12:00 AM</span>
              <span>Live Now</span>
            </div>
          </div>

          {/* Action Hub Panel */}
          <div className={styles.panel} style={{ border: '1px dashed var(--d-border)', background: 'var(--d-hover)' }}>
            <div className={styles.panelHeader} style={{ borderBottomColor: 'var(--d-border)' }}>
              <span className={styles.panelTitle} style={{ color: 'var(--color-indigo)' }}>
                <Zap size={16} />
                Try-On Simulator Sandpit
              </span>
            </div>
            
            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--d-t3)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Simulate client-side Virtual Try-On requests to test the auto-scaling capability, job queue states, and cost accumulation logic.
              </p>

              <div className={styles.fGroup}>
                <label className={styles.fLabel}>VTON Garment Category</label>
                <select 
                  className={styles.fSelect}
                  value={simCategory}
                  onChange={e => setSimCategory(e.target.value as any)}
                >
                  <option value="tops">Tops & Tees</option>
                  <option value="bottoms">Trousers & Pants</option>
                  <option value="one-pieces">One-pieces & Dresses</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.50rem', marginBottom: '0.75rem' }}>
                <button 
                  onClick={handleScaleUp}
                  className={styles.actionBtnPrimary}
                  style={{ flex: 1, padding: '0.65rem 0' }}
                >
                  Scale Container +
                </button>
                <button 
                  onClick={handleScaleDown}
                  className={styles.actionBtn}
                  style={{ flex: 1, padding: '0.65rem 0' }}
                >
                  Terminate Pod -
                </button>
              </div>

              <button 
                onClick={handleTriggerSimJob} 
                className={styles.btnPrimary} 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, var(--color-indigo), #3730a3)', 
                  color: '#fff',
                  justifyContent: 'center',
                  display: 'flex',
                  gap: 6
                }}
                disabled={isSimulatingJob}
              >
                <Play size={14} />
                {isSimulatingJob ? 'Worker Processing...' : 'Simulate Tryon Request'}
              </button>
            </div>
          </div>
        </div>

        {/* Setting Configuration & Log split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Settings Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                <Settings size={16} />
                RunPod Serverless Node Configurations
              </span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className={styles.fGroup} style={{ marginBottom: 0 }}>
                  <label className={styles.fLabel}>RunPod Endpoint ID</label>
                  <input 
                    type="text" 
                    className={styles.fInput} 
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    value={endpointId}
                    onChange={e => setEndpointId(e.target.value)}
                  />
                </div>
                <div className={styles.fGroup} style={{ marginBottom: 0 }}>
                  <label className={styles.fLabel}>GPU Selection Mode</label>
                  <select className={styles.fSelect} style={{ fontSize: '0.8rem' }} disabled>
                    <option value="4090">NVIDIA RTX 4090 (24GB VRAM)</option>
                    <option value="a100">NVIDIA A100 (80GB VRAM)</option>
                  </select>
                </div>
              </div>

              <div className={styles.fGroup}>
                <label className={styles.fLabel}>Docker Container Template URI</label>
                <input 
                  type="text" 
                  className={styles.fInput} 
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  value={dockerImage}
                  onChange={e => setDockerImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ border: '1px solid var(--d-border)', borderRadius: '8px', padding: '0.75rem', background: 'var(--d-hover)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase' }}>Min Workers</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--d-t1)', marginTop: 2 }}>1 (Warm)</div>
                </div>
                <div style={{ border: '1px solid var(--d-border)', borderRadius: '8px', padding: '0.75rem', background: 'var(--d-hover)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase' }}>Max Workers</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--d-t1)', marginTop: 2 }}>10 (Limit)</div>
                </div>
                <div style={{ border: '1px solid var(--d-border)', borderRadius: '8px', padding: '0.75rem', background: 'var(--d-hover)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--d-t4)', fontWeight: 700, textTransform: 'uppercase' }}>Idle Timeout</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--d-t1)', marginTop: 2 }}>300s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live System Logging terminal */}
          <div className={styles.panel} style={{ border: '1px solid var(--d-border)' }}>
            <div className={styles.panelHeader} style={{ background: 'var(--d-hover)' }}>
              <span className={styles.panelTitle} style={{ fontSize: '0.85rem' }}>
                <Terminal size={14} style={{ marginRight: 4 }} />
                GPU Active Node Event Logs
              </span>
            </div>
            <div style={{ padding: '0.85rem', background: '#020617', minHeight: '185px', borderRadius: '0 0 16px 16px', overflowY: 'auto', maxHeight: '185px' }}>
              {logs.map((log, index) => (
                <div key={index} className={styles.consoleLogLine}>
                  <span className={styles.consoleTime}>[{log.timestamp}]</span>
                  <span className={
                    log.type === 'info' ? styles.consoleInfo :
                    log.type === 'success' ? styles.consoleSuccess :
                    log.type === 'warn' ? styles.consoleWarn :
                    styles.consoleErr
                  }>
                    {log.type.toUpperCase()}:
                  </span>
                  <span style={{ color: '#e2e8f0', wordBreak: 'break-all' }}>{log.message}</span>
                </div>
              ))}
              {isSimulatingJob && (
                <div className={styles.consoleLogLine}>
                  <span className={styles.consoleTime}>[{new Date().toLocaleTimeString()}]</span>
                  <span className={styles.consoleInfo}>PROC:</span>
                  <span style={{ color: '#e2e8f0' }}>Job processing...</span>
                  <span className={styles.consoleCursor} />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Try-On Jobs History Records list */}
        <div className={styles.panel} style={{ marginTop: '1.5rem' }}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              <Activity size={16} color="var(--color-indigo)" />
              RunPod Serverless VTON Active Jobs
            </span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job ID Reference</th>
                <th>VTON Category</th>
                <th>GPU hardware</th>
                <th>Execution Time</th>
                <th>Queue Time</th>
                <th>Compute Cost</th>
                <th>Job Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontWeight: 700, color: 'var(--d-t1)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    {job.id}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {job.category.replace('-', ' ')}
                  </td>
                  <td style={{ color: 'var(--d-t3)' }}>
                    {job.gpuModel}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {job.status === 'IN_QUEUE' ? '-' : job.status === 'IN_PROGRESS' ? 'Running...' : `${job.executionTime}s`}
                  </td>
                  <td style={{ color: 'var(--d-t3)' }}>
                    {job.status === 'IN_QUEUE' ? '-' : `${job.queueTime}s`}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-indigo)' }}>
                    {job.status === 'IN_QUEUE' || job.status === 'IN_PROGRESS' ? '-' : `$${job.cost.toFixed(4)}`}
                  </td>
                  <td>
                    <span className={`
                      ${styles.badge} 
                      ${job.status === 'COMPLETED' ? styles.badgeDelivered : 
                        job.status === 'FAILED' ? styles.badgeCancelled : 
                        job.status === 'IN_PROGRESS' ? styles.badgeShipped : styles.badgePending}
                    `}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--d-t4)' }}>
                    {new Date(job.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
