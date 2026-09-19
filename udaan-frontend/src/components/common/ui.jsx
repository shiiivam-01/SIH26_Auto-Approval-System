// Reusable UI components — forms, feedback, display with smooth Apple/Emil craftsmanship transitions & full dark mode support.
import { forwardRef, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, File as FileIcon, Inbox, Loader2, RotateCcw, UploadCloud, X, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

/* ---------------- Button ---------------- */
export const Button = forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-sm rounded-xl gap-2 shadow-xs',
    lg: 'h-11 px-5 text-base rounded-xl gap-2.5 shadow-sm',
  };

  const variants = {
    primary: 'bg-[#1a3a6b] dark:bg-blue-600 text-white hover:bg-[#14306a] dark:hover:bg-blue-700 shadow-blue-500/10',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-teal-500/10',
    outline: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs hover:border-slate-300 dark:hover:border-slate-600',
    ghost: 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-red-500/10',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, sizes[size] || sizes.md, variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-current animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

/* ---------------- Input ---------------- */
export const Input = forwardRef(({ className, label, error, ...props }, ref) => (
  <div className="flex flex-col space-y-1.5 w-full">
    {label && (
      <label htmlFor={props.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-60 transition-all duration-200 shadow-2xs',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
  </div>
));
Input.displayName = 'Input';

/* ---------------- Select ---------------- */
export const Select = forwardRef(({ className, label, error, options = [], placeholder, children, ...props }, ref) => (
  <div className="flex flex-col space-y-1.5 w-full">
    {label && (
      <label htmlFor={props.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 pr-9 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-60 transition-all duration-200 shadow-2xs',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200" aria-hidden="true" />
    </div>
    {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
  </div>
));
Select.displayName = 'Select';

/* ---------------- Textarea ---------------- */
export const Textarea = forwardRef(({ className, label, error, rows = 4, ...props }, ref) => (
  <div className="flex flex-col space-y-1.5 w-full">
    {label && (
      <label htmlFor={props.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:opacity-60 transition-all duration-200 shadow-2xs',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

/* ---------------- Card ---------------- */
export const Card = ({ className, children, hoverable = false, ...props }) => (
  <div
    className={cn(
      'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_-2px_rgba(15,23,42,0.03)] dark:shadow-none transition-all duration-300 ease-out overflow-hidden',
      hoverable && 'hover:shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:-translate-y-0.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn('px-6 py-4 border-b border-slate-100/90 dark:border-slate-800 flex items-start justify-between gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs', className)}>
    <div className="min-w-0">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ className, children }) => (
  <div className={cn('p-6', className)}>{children}</div>
);

/* ---------------- Badge ---------------- */
export const Badge = ({ label, colorClass, icon: Icon, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium tracking-tight whitespace-nowrap transition-colors duration-150',
      colorClass || 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      className
    )}
  >
    {Icon && <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />}
    {label}
  </span>
);

/* ---------------- PageHeader ---------------- */
export const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>}
    </div>
    {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
  </div>
);

/* ============================================================
   FEEDBACK — modals, confirmations, empty/error/loading states
   ============================================================ */

export const Modal = ({ open, onClose, title, children, footer, size = 'md', position = 'top', className, containerClassName }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };
  const positionClasses = position === 'top'
    ? 'items-start justify-center pt-3 sm:pt-5 md:pt-6 p-3 sm:p-4'
    : 'items-center justify-center p-4';

  return (
    <div className={cn("fixed inset-0 z-50 flex overflow-y-auto", positionClasses, containerClassName)} role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className={cn('relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-150 dark:border-slate-800 w-full max-h-[92vh] flex flex-col animate-scale-in my-0', sizes[size], className)}>
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto text-slate-800 dark:text-slate-200">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, isLoading = false }) => (
  <Modal open={open} onClose={isLoading ? undefined : onClose} title={title} size="sm" footer={<><Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button><Button onClick={onConfirm} isLoading={isLoading} variant={danger ? 'danger' : 'primary'}>{confirmLabel}</Button></>}>
    <div className="flex items-start gap-3.5 py-1">
      <div className="rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 p-2.5 flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
    </div>
  </Modal>
);

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 px-4 text-center animate-fade-in">
    <div className="w-14 h-14 rounded-2xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" aria-hidden="true" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-14 px-4 text-center animate-fade-in" role="alert">
    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800 flex items-center justify-center mb-4">
      <AlertTriangle className="w-7 h-7 text-red-500" aria-hidden="true" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    {message && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md break-words leading-relaxed">{message}</p>}
    {onRetry && (
      <Button variant="outline" className="mt-5" onClick={onRetry}>
        <RotateCcw className="w-4 h-4 mr-2" /> Try again
      </Button>
    )}
  </div>
);

export const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800', className)} aria-hidden="true" />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-xs">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const SkeletonRows = ({ rows = 4 }) => (
  <div className="space-y-2.5" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

/* ============================================================
   DISPLAY — tables, timelines, file upload
   ============================================================ */

export const DataTable = ({ columns, rows, rowKey = (r) => r.id, emptyMessage = 'No records found' }) => {
  if (!rows || rows.length === 0) return <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">{emptyMessage}</p>;
  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-800 text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors duration-150">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {rows.map((row) => (
          <div key={rowKey(row)} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5 shadow-xs">
            {columns.map((c, i) => (
              <div key={c.key} className={i === 0 ? '' : 'flex justify-between gap-3 items-center pt-1 border-t border-slate-100 dark:border-slate-800'}>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{c.header}</span>
                <span className={i === 0 ? 'block font-semibold text-slate-900 dark:text-white text-sm' : 'text-sm text-slate-700 dark:text-slate-300 text-right'}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export const Timeline = ({ steps }) => (
  <ol className="relative border-l-2 border-slate-200/80 dark:border-slate-800 ml-3 space-y-6" role="list">
    {steps.map((step, i) => (
      <li key={i} className="pl-6 relative">
        <span
          className={cn(
            'absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 shadow-xs',
            step.state === 'done' && 'bg-emerald-500 text-white',
            step.state === 'current' && 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40',
            step.state === 'failed' && 'bg-red-500 text-white',
            step.state === 'pending' && 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700'
          )}
          aria-hidden="true"
        >
          {step.state === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          {step.state === 'current' && <Loader2 className="w-3 h-3 text-white animate-spin" />}
          {step.state === 'failed' && <XCircle className="w-3.5 h-3.5 text-white" />}
        </span>
        <p className={cn('text-sm font-semibold tracking-tight', step.state === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white')}>
          {step.label}
        </p>
        {step.detail && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.detail}</p>}
      </li>
    ))}
  </ol>
);

export const applicationTimelineSteps = (status, app = {}, t = (s) => s) => {
  switch (status) {
    case 'submitted':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received & verified by UDAAN Single-Window System', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: 'Queued for department desk scrutiny', state: 'current' },
        { label: t('timeline.inspection', 'Inspection'), detail: app.requires_inspection ? 'Joint site inspection required' : 'Inspection exempt for low hazard', state: 'pending' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Pending department determination', state: 'pending' },
      ];
    case 'pending_review':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received & attached to verified vault documents', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: `Desk scrutiny in progress by department officer (${app.days_left !== undefined ? `${app.days_left}d left` : 'Active'})`, state: 'current' },
        { label: t('timeline.inspection', 'Inspection'), detail: app.requires_inspection !== false ? 'Scheduled joint site inspection pending' : 'Inspection exempt', state: 'pending' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Pending final department clearance', state: 'pending' },
      ];
    case 'query_raised':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received by UDAAN', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: 'Statutory query raised by scrutiny officer — response required', state: 'failed' },
        { label: t('timeline.inspection', 'Inspection'), detail: 'Paused pending query resolution', state: 'pending' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Pending query resolution', state: 'pending' },
      ];
    case 'pending_inspection':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received & validated by UDAAN', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: 'Desk scrutiny completed & approved by department', state: 'done' },
        { label: t('timeline.inspection', 'Inspection'), detail: `Joint site inspection scheduled (${app.days_left !== undefined ? `${app.days_left}d left` : 'Active'})`, state: 'current' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Awaiting inspector compliance report', state: 'pending' },
      ];
    case 'auto_approved':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received by UDAAN Single Window', state: 'done' },
        { label: t('timeline.systemValidation', 'System Validation'), detail: 'Low-risk automated policy verification passed', state: 'done' },
        { label: t('timeline.inspection', 'Inspection'), detail: 'Exempt under self-declaration policy', state: 'done' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Instant Auto-Approved ✓ Certificate Ready', state: 'done' },
      ];
    case 'approved':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received by UDAAN', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: 'Desk scrutiny cleared with zero non-conformities', state: 'done' },
        { label: t('timeline.inspection', 'Inspection'), detail: app.requires_inspection ? 'Joint inspection verified & passed' : 'Inspection exempt', state: 'done' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Approved ✓ Statutory Certificate Issued', state: 'done' },
      ];
    case 'rejected':
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received by UDAAN', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: 'Desk scrutiny completed', state: 'done' },
        { label: t('timeline.inspection', 'Inspection'), detail: 'Inspection completed or bypassed', state: 'done' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Application rejected by department', state: 'failed' },
      ];
    default:
      return [
        { label: t('timeline.submitted', 'Application Submitted'), detail: 'Received by UDAAN', state: 'done' },
        { label: t('timeline.officerReview', 'Officer Review'), detail: 'Desk scrutiny by department officer', state: 'current' },
        { label: t('timeline.inspection', 'Inspection'), detail: 'Joint site inspection required', state: 'pending' },
        { label: t('timeline.finalDecision', 'Final Decision'), detail: 'Pending final determination', state: 'pending' },
      ];
  }
};

export const FileUpload = ({ onFileReady, isUploading = false, error, label = 'Upload document', accept }) => {
  const inputRef = useRef(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const readFile = (file) => {
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = () => onFileReady?.({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };
  const sizeLabel = fileInfo ? `${(fileInfo.size / 1024).toFixed(0)} KB` : null;
  return (
    <div className="w-full">
      {label && <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight mb-1.5">{label}</span>}
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose a file to upload"
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files?.[0]); }}
        className={cn(
          'flex flex-col items-center justify-center gap-2.5 border-2 border-dashed rounded-2xl px-6 py-8 cursor-pointer transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-4 focus:ring-blue-500/15',
          dragOver ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 scale-[1.01]' : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 hover:border-slate-300',
          isUploading && 'opacity-60 pointer-events-none',
          error && 'border-red-400 bg-red-50/30'
        )}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" aria-hidden="true" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          </div>
        )}
        {fileInfo ? (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <FileIcon className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="font-medium text-slate-900 dark:text-white">{fileInfo.name}</span>
            <span className="text-slate-400">({sizeLabel})</span>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Click to select</span> or drag & drop
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500">Encrypted in your compliance vault (PDF, PNG, JPG)</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => readFile(e.target.files?.[0])} />
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
    </div>
  );
};
