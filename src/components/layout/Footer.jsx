// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { FiDroplet, FiHeart, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
                <FiDroplet className="text-white text-lg" />
              </div>
              <span className="font-bold text-xl text-white">Blood<span className="text-red-500">Bridge</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Connecting blood donors with those in need. Every drop counts. Be a hero today.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/search', label: 'Find Donors' },
                { to: '/emergency', label: 'Emergency' },
                { to: '/register-donor', label: 'Register as Donor' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-red-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h3 className="text-white font-semibold mb-4">Emergency Helplines</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'National Blood Authority', number: '1800-180-1104' },
                { name: 'Emergency Services', number: '112' },
                { name: 'Red Cross Blood Services', number: '1800-11-2253' },
                { name: 'AIIMS Blood Bank', number: '011-2658-8500' },
              ].map((h) => (
                <li key={h.number} className="flex items-start gap-2">
                  <FiPhone className="mt-0.5 text-red-500 shrink-0" size={13} />
                  <div>
                    <div className="text-gray-400 text-xs">{h.name}</div>
                    <div className="text-white font-medium">{h.number}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiMail className="text-red-500 shrink-0" size={14} />
                <span>support@bloodbridge.in</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-red-500 shrink-0" size={14} />
                <span>+91 1800-BLOOD-HELP</span>
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin className="text-red-500 shrink-0 mt-0.5" size={14} />
                <span>123 Life Street, Medical District, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} BloodBridge. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <FiHeart className="text-red-500" size={13} /> to save lives
          </p>
        </div>
      </div>
    </footer>
  );
}
