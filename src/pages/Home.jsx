// src/pages/Home.jsx
// Landing page with hero, stats, blood compatibility chart, and features
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDroplet, FiSearch, FiAlertTriangle, FiUsers, FiHeart,
  FiMapPin, FiShield, FiChevronRight, FiPhone,
} from 'react-icons/fi';
import { BLOOD_COMPATIBILITY, BLOOD_GROUPS, DONATION_TIPS } from '../utils/constants';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// Blood Compatibility Table
function CompatibilityChart() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="text-center mb-10"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Blood Compatibility Chart
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Understanding compatibility is vital — find out which blood types can donate to or receive from each other.
          </motion.p>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="py-3 px-4 text-left font-semibold">Blood Type</th>
                <th className="py-3 px-4 text-left font-semibold">Can Donate To</th>
                <th className="py-3 px-4 text-left font-semibold">Can Receive From</th>
              </tr>
            </thead>
            <tbody>
              {BLOOD_GROUPS.map((group, i) => (
                <tr
                  key={group}
                  className={`border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}`}
                >
                  <td className="py-3 px-4">
                    <span className="font-bold text-red-600 dark:text-red-400">{group}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {BLOOD_COMPATIBILITY[group]?.canDonateTo.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {BLOOD_COMPATIBILITY[group]?.canReceiveFrom.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          * O- is the universal donor. AB+ is the universal recipient.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  const stats = [
    { icon: FiUsers, value: '50,000+', label: 'Registered Donors' },
    { icon: FiHeart, value: '1.2L+', label: 'Lives Saved' },
    { icon: FiMapPin, value: '200+', label: 'Cities Covered' },
    { icon: FiAlertTriangle, value: '10,000+', label: 'Emergency Requests' },
  ];

  const features = [
    { icon: FiSearch, title: 'Smart Search', desc: 'Find donors by blood group and city instantly.' },
    { icon: FiAlertTriangle, title: 'Emergency Alerts', desc: 'Post and respond to critical blood requests.' },
    { icon: FiMapPin, title: 'Location Based', desc: 'Auto-detect your location to find nearby donors.' },
    { icon: FiShield, title: 'Verified Donors', desc: 'All donors are authenticated via secure login.' },
  ];

  return (
    <div className="dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-700 to-red-500" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        {/* Decorative drops */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-red-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-800/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden" animate="show" variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2 text-sm mb-6 backdrop-blur-sm border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Donors Active Now
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Donate Blood.<br />
                <span className="text-red-200">Save Lives.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-red-100 text-lg leading-relaxed mb-8 max-w-lg">
                BloodBridge connects blood donors with those in critical need. Register as a donor, search for donors in your city, or post emergency blood requests — all in one place.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  to="/search"
                  className="flex items-center gap-2 bg-white text-red-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FiSearch size={18} />
                  Find Donors
                </Link>
                <Link
                  to="/register-donor"
                  className="flex items-center gap-2 bg-transparent border-2 border-white/60 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <FiDroplet size={18} />
                  Become a Donor
                </Link>
                <Link
                  to="/emergency"
                  className="flex items-center gap-2 bg-red-900/60 border border-red-300/30 text-red-100 font-semibold px-6 py-3.5 rounded-xl hover:bg-red-900/80 transition-all"
                >
                  <FiAlertTriangle size={18} />
                  Emergency Request
                </Link>
              </motion.div>
            </motion.div>

            {/* Blood Group Wheel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FiDroplet size={40} className="mx-auto mb-2 text-red-200" />
                    <p className="text-2xl font-bold">8 Types</p>
                    <p className="text-red-200 text-sm">Blood Groups</p>
                  </div>
                </div>
                {BLOOD_GROUPS.map((group, i) => {
                  const angle = (i / 8) * 360 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const r = 130;
                  const x = 160 + r * Math.cos(rad);
                  const y = 160 + r * Math.sin(rad);
                  return (
                    <div
                      key={group}
                      className="absolute w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white font-bold text-sm transform -translate-x-1/2 -translate-y-1/2 hover:bg-white/30 transition-colors"
                      style={{ left: x, top: y }}
                    >
                      {group}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl mb-3">
                  <s.icon size={22} />
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Why Choose BloodBridge?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Built to connect donors with recipients faster than ever before.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl mb-4">
                  <f.icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatibility Chart */}
      <CompatibilityChart />

      {/* Donation Tips */}
      <section className="py-16 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Donation Eligibility Tips
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400">
              Make sure you're ready before you donate.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DONATION_TIPS.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <FiShield size={14} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tip.tip}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 bg-gradient-to-r from-red-800 to-red-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 pulse-ring">
              <FiPhone size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Need Blood Urgently?</h2>
            <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
              Post an emergency blood request right now and connect with donors in your city instantly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/emergency"
                className="flex items-center gap-2 bg-white text-red-700 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all shadow-xl hover:scale-105"
              >
                <FiAlertTriangle size={18} />
                Post Emergency Request
              </Link>
              <Link
                to="/search"
                className="flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                <FiSearch size={18} />
                Search Donors
                <FiChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
