// src/pages/About.jsx
import { motion } from 'framer-motion';
import { FiHeart, FiUsers, FiDroplet, FiShield, FiTarget, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const TEAM = [
  { name: 'Dr. Priya Nair', role: 'Medical Director', initials: 'PN' },
  { name: 'Arjun Mehta', role: 'Lead Developer', initials: 'AM' },
  { name: 'Sneha Kapoor', role: 'UX Designer', initials: 'SK' },
  { name: 'Ravi Shankar', role: 'Operations Head', initials: 'RS' },
];

export default function About() {
  return (
    <div className="min-h-screen dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-900 via-red-700 to-red-500 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm border border-white/30">
              <FiDroplet size={28} />
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl font-bold mb-4">About BloodBridge</motion.h1>
            <motion.p variants={fadeUp} className="text-red-100 text-lg max-w-2xl mx-auto leading-relaxed">
              We're on a mission to bridge the gap between blood donors and recipients across India, saving lives one connection at a time.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</motion.h2>
              <motion.p variants={fadeUp} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                BloodBridge was born out of a simple yet urgent need — connecting people who need blood with those willing to donate, quickly and efficiently. Every year, millions of lives are lost due to blood shortages. We believe technology can change that.
              </motion.p>
              <motion.p variants={fadeUp} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Our platform enables donors to register their availability, helps recipients search for compatible donors by blood group and city, and facilitates emergency requests that can reach donors within minutes.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: FiHeart, title: 'Save Lives', desc: 'Every donation can save up to 3 lives.' },
                { icon: FiUsers, title: 'Community', desc: 'A network of 50,000+ donors across India.' },
                { icon: FiShield, title: 'Verified', desc: 'Secure authentication for all users.' },
                { icon: FiTarget, title: 'Efficient', desc: 'Find matching donors in under a minute.' },
              ].map((item) => (
                <div key={item.title} className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <item.icon size={22} className="text-red-600 dark:text-red-400 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900/50 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: FiHeart, title: 'Compassion', desc: 'We care deeply about every life and strive to make blood donation accessible to all.' },
              { icon: FiShield, title: 'Trust', desc: 'We maintain the highest standards of privacy and data security for our users.' },
              { icon: FiStar, title: 'Excellence', desc: 'We continuously improve our platform to deliver the best experience possible.' },
            ].map((v) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <v.icon size={22} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - commented out
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">Meet the Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-center"
              >
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  {member.initials}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* CTA */}
      <section className="py-14 bg-gradient-to-r from-red-800 to-red-600 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-red-100 mb-8">Register as a donor today and be part of the network saving lives every day.</p>
          <Link to="/register-donor" className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-8 py-4 rounded-xl hover:bg-red-50 transition-all shadow-xl hover:scale-105">
            <FiDroplet size={18} />
            Become a Donor
          </Link>
        </div>
      </section>
    </div>
  );
}
