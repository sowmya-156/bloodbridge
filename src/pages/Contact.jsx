// src/pages/Contact.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handle = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields.'); return; }
    setSent(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400">Have a question or need help? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: FiMail, title: 'Email', value: 'support@bloodbridge.in', sub: 'We reply within 24 hours' },
              { icon: FiPhone, title: 'Phone', value: '+91 1800-BLOOD-HELP', sub: 'Mon–Sat, 9AM–6PM' },
              { icon: FiMapPin, title: 'Address', value: '123 Life Street, Medical District', sub: 'New Delhi, India 110001' },
            ].map((item) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="flex gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="w-11 h-11 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{item.value}</p>
                  <p className="text-gray-400 text-xs">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Emergency */}
            <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-900/50">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 text-sm">Emergency Helplines</h3>
              <div className="space-y-1 text-sm text-red-600 dark:text-red-300">
                <p>National Blood Authority: <strong>1800-180-1104</strong></p>
                <p>Emergency Services: <strong>112</strong></p>
                <p>Red Cross Blood: <strong>1800-11-2253</strong></p>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
          >
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Thank you for reaching out. We'll respond within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors text-sm">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Send us a message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { f: 'name', label: 'Your Name', placeholder: 'John Doe', req: true },
                    { f: 'email', label: 'Email', placeholder: 'you@example.com', req: true, type: 'email' },
                  ].map(({ f, label, placeholder, req, type = 'text' }) => (
                    <div key={f}>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
                      <input type={type} value={form[f]} onChange={handle(f)} placeholder={placeholder}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Subject</label>
                  <input type="text" value={form.subject} onChange={handle('subject')} placeholder="How can we help?"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Message <span className="text-red-500">*</span></label>
                  <textarea value={form.message} onChange={handle('message')} rows={5} placeholder="Tell us more..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none" />
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md">
                  <FiSend size={16} />
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
