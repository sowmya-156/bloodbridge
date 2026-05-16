// src/components/emergency/EmergencyCard.jsx
import { motion } from 'framer-motion';
import { FiPhone, FiMapPin, FiClock, FiAlertCircle, FiUser, FiTrash2 } from 'react-icons/fi';
import { BLOOD_GROUP_COLORS, URGENCY_COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { deleteRequest } from '../../services/donorService';
import toast from 'react-hot-toast';

export default function EmergencyCard({ request, index = 0, onDelete }) {
  const { user } = useAuth();
  const bloodColor = BLOOD_GROUP_COLORS[request.bloodGroup] || 'bg-gray-100 text-gray-700 border-gray-300';
  const urgencyColor = URGENCY_COLORS[request.urgency] || 'bg-gray-100 text-gray-700 border-gray-300';

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this emergency request?')) return;
    try {
      await deleteRequest(request.id);
      toast.success('Request deleted');
      onDelete?.(request.id);
    } catch {
      toast.error('Failed to delete request');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-5 shadow-sm relative overflow-hidden"
    >
      {/* Urgency indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        request.urgency === 'Critical' ? 'bg-red-600' :
        request.urgency === 'High' ? 'bg-orange-500' :
        request.urgency === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />

      <div className="flex items-start justify-between mb-3 pt-1">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiUser size={14} className="text-red-500" />
            {request.patientName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{request.hospitalName}</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${bloodColor}`}>
            {request.bloodGroup}
          </span>
          {user?.uid === request.userId && (
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors p-1">
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiMapPin size={13} className="text-red-500 shrink-0" />
          <span>{request.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiPhone size={13} className="text-red-500 shrink-0" />
          <span>{request.contactNumber}</span>
        </div>
        {request.additionalInfo && (
          <p className="text-xs text-gray-500 dark:text-gray-500 italic">{request.additionalInfo}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${urgencyColor}`}>
          <FiAlertCircle size={11} />
          {request.urgency}
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <FiClock size={11} />
          {timeAgo(request.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
