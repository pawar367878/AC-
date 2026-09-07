import React, { useState } from 'react';
import { ServiceRequest } from '../../types.ts';
import { api } from '../../services/api.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import { InvoiceModal } from '../common/InvoiceModal.tsx';
import {
  X,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Star,
  Image as ImageIcon,
  Wrench,
  Check,
} from 'lucide-react';

interface RequestDetailsModalProps {
  request: ServiceRequest;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
  onStatusUpdated,
}) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const canCancel = ['PENDING', 'ASSIGNED', 'REJECTED'].includes(request.status);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const res = await api.cancelRequest(
        request.id,
        cancelReason || 'Cancelled by customer',
        request.customer_id,
        request.customer_name,
        'CUSTOMER'
      );
      if (res.success) {
        setShowCancelPrompt(false);
        if (onStatusUpdated) onStatusUpdated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to cancel request:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">PENDING DISPATCH</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">TECHNICIAN ASSIGNED</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">REQUEST ACCEPTED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">TECHNICIAN DECLINED / REASSIGNING</span>;
      case 'IN PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">SERVICE IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">SERVICE COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const steps = [
    { label: 'Request Submitted', status: 'PENDING' },
    { label: 'Technician Assigned', status: 'ASSIGNED' },
    { label: 'Technician Accepted', status: 'ACCEPTED' },
    { label: 'Service Started', status: 'IN PROGRESS' },
    { label: 'Service Completed', status: 'COMPLETED' },
  ];

  const statusOrder: Record<string, number> = {
    PENDING: 1,
    ASSIGNED: 2,
    ACCEPTED: 3,
    'IN PROGRESS': 4,
    COMPLETED: 5,
    CANCELLED: -1,
  };

  const currentStepNum = statusOrder[request.status] || 1;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.assigned_technician_id) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview({
        service_request_id: request.id,
        customer_id: request.customer_id,
        customer_name: request.customer_name,
        technician_id: request.assigned_technician_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setReviewSubmitted(true);
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err) {
      console.error('Review submit failed:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">{request.id}</h2>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Booked on {new Date(request.created_at).toLocaleDateString()} at{' '}
                {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          {/* Timeline Progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" /> Live Service Status Timeline
            </h3>
            <div className="relative flex items-center justify-between">
              {/* Connector line */}
              <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200 -z-0" />
              <div
                className="absolute left-4 top-3.5 h-0.5 bg-sky-500 transition-all duration-500 -z-0"
                style={{
                  width: `${Math.max(0, Math.min(100, ((currentStepNum - 1) / (steps.length - 1)) * 100))}%`,
                }}
              />

              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStepNum >= stepNum && request.status !== 'CANCELLED';
                const isCurrent = currentStepNum === stepNum && request.status !== 'CANCELLED';

                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10 text-center max-w-[70px]">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                        isPassed
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                    </div>
                    <span
                      className={`text-[10px] font-semibold mt-1.5 leading-tight ${
                        isCurrent ? 'text-sky-700' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {request.status === 'CANCELLED' && (
              <div className="mt-3 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                This request was cancelled.
              </div>
            )}
          </div>

          {/* AC Model & Service Required Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                AC Unit Information
              </span>
              <div className="flex items-start gap-3">
                {request.model?.image_url && (
                  <img
                    src={request.model.image_url}
                    alt={request.model.model_name}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                )}
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px] mb-1">
                    {request.brand?.name || 'AC Brand'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">
                    {request.model?.model_name || 'AC Model'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {request.model?.ac_type} • {request.model?.capacity} • {request.model?.technology}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Service Requested
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm text-sky-700">
                  {request.service?.name || 'General AC Service'}
                </h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {request.service?.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Base Service Fee:</span>
                  <span className="font-bold text-slate-900 text-sm">₹{request.service?.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-rose-500" /> Service Address & Live Location
              </div>
              <p className="text-slate-700 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                {request.address}
              </p>
              <InteractiveMap
                latitude={request.latitude}
                longitude={request.longitude}
                address={request.address}
                technicianLat={request.technician?.current_latitude}
                technicianLon={request.technician?.current_longitude}
                technicianName={request.technician?.name}
                heightClass="h-44"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Calendar className="w-4 h-4 text-sky-600" /> Preferred Appointment Slot
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{request.preferred_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-bold text-slate-900">{request.preferred_time}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Customer Problem Description:</span>
                  <p className="text-slate-800 italic bg-white p-2 rounded border border-slate-200/60">
                    "{request.problem_description}"
                  </p>
                </div>
              </div>

              {/* Technician Info Card */}
              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800">
                    Assigned Technician
                  </span>
                  {request.technician_response === 'ACCEPTED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Confirmed by Tech
                    </span>
                  )}
                  {request.technician_response === 'PENDING' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Awaiting Tech Acceptance
                    </span>
                  )}
                  {request.technician_response === 'REJECTED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      Tech Declined • Reassigning
                    </span>
                  )}
                </div>

                {request.technician ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> {request.technician.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {request.technician.experience_years} yrs exp • {request.technician.rating} ★ ({request.technician.total_ratings_count} ratings)
                        </p>
                      </div>
                      <a
                        href={`tel:${request.technician.phone}`}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                    {request.technician_response === 'REJECTED' && (
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                        <strong>Note:</strong> {request.technician_rejection_reason || 'Technician was unavailable.'} Our dispatch team is reassigning a qualified technician.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Technician dispatch pending. Admin is reviewing nearest certified experts.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Cancellation Box */}
          {showCancelPrompt && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2.5">
              <h4 className="font-bold text-xs text-rose-900">Confirm Booking Cancellation</h4>
              <p className="text-[11px] text-rose-700">
                Are you sure you want to cancel this service request? This cannot be undone.
              </p>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)..."
                className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs text-slate-900"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  Keep Request
                </button>
              </div>
            </div>
          )}

          {/* Completion Details & Photos if Completed */}
          {request.status === 'COMPLETED' && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Service Summary & Work Report
                </h3>
                {request.invoice && (
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Tax Invoice
                  </button>
                )}
              </div>

              {request.work_performed && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600">Work Performed:</span>
                  <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 mt-0.5">
                    {request.work_performed}
                  </p>
                </div>
              )}

              {request.parts_used && request.parts_used.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600">Parts Replaced / Used:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {request.parts_used.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                      >
                        {p.name} (₹{p.cost})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Before and After Photos */}
              {request.photos && request.photos.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Service Verification Photos:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {request.photos.map((photo) => (
                      <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-200">
                        <img src={photo.photo_url} alt={photo.caption} className="w-full h-32 object-cover" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur rounded text-[10px] font-bold text-white uppercase">
                          {photo.photo_type} Service
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-slate-900/90 to-transparent text-[10px] text-white truncate">
                          {photo.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Rating & Review Section (if completed) */}
          {request.status === 'COMPLETED' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate Technician Service
              </h3>

              {request.review || reviewSubmitted ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(request.review?.rating || reviewRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-bold text-slate-800 ml-1">
                      {request.review?.rating || reviewRating} / 5 Stars
                    </span>
                  </div>
                  <p className="text-slate-700 italic">
                    "{request.review?.comment || reviewComment || 'Great service and prompt resolution!'}"
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold block pt-1">
                    ✓ Feedback recorded in technician performance records.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your service experience (cooling speed, technician cleanliness, punctuality)..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting Review...' : 'Submit Rating & Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {canCancel && !showCancelPrompt && (
              <button
                type="button"
                onClick={() => setShowCancelPrompt(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition"
              >
                Cancel Service Request
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Invoice Modal if open */}
      {showInvoice && request.invoice && (
        <InvoiceModal
          invoice={request.invoice}
          onClose={() => setShowInvoice(false)}
          onPaymentSuccess={() => {
            if (onStatusUpdated) onStatusUpdated();
          }}
        />
      )}
    </div>
  );
};
