import { Link } from 'react-router-dom';
import { Globe, BookOpen, Mail, ExternalLink, Phone, Info } from 'lucide-react';

const FOOTER_LINKS = [
    {
        title: 'Khám phá',
        links: [
            { name: 'Tất cả khóa học', path: '/courses' },
            { name: 'Dành cho doanh nghiệp', path: '/enterprise' },
            { name: 'Giảng dạy trên SkillMetrix', path: '/teach' },
            { name: 'Về chúng tôi', path: '/about' },
        ],
    },
    {
        title: 'Hỗ trợ',
        links: [
            { name: 'Liên hệ', path: '/contact' },
            { name: 'Trung tâm trợ giúp', path: '/support' },
            { name: 'Câu hỏi thường gặp', path: '/faq' },
        ],
    },
    {
        title: 'Điều khoản',
        links: [
            { name: 'Điều khoản sử dụng', path: '/terms' },
            { name: 'Chính sách bảo mật', path: '/privacy' },
            { name: 'Cài đặt Cookie', path: '/cookies' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-[#1c1d1f] text-white pt-12 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* --- Top Section: Links & Language --- */}
                <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-24 flex-1">
                        {FOOTER_LINKS.map((section) => (
                            <div key={section.title} className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    {section.title}
                                </h4>
                                <ul className="space-y-2">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link 
                                                to={link.path} 
                                                className="text-sm text-gray-300 hover:underline decoration-gray-400 underline-offset-4 transition-all"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="shrink-0">
                        <button className="flex items-center gap-2 px-6 py-2 border border-white text-sm font-bold hover:bg-white/10 transition-all">
                            <Globe className="w-4 h-4" />
                            Tiếng Việt
                        </button>
                    </div>
                </div>

                {/* --- Bottom Section: Brand, Copyright & Socials --- */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-gray-800">
                    
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">
                            Skill<span className="text-indigo-400">Metrix</span>
                        </span>
                    </Link>

                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} SkillMetrix LMS, Inc.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" aria-label="Email liên hệ" className="text-gray-400 hover:text-white transition-colors">
                            <Mail className="w-5 h-5" />
                        </a>
                        <a href="#" aria-label="Liên kết ngoài" className="text-gray-400 hover:text-white transition-colors">
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <a href="#" aria-label="Số điện thoại" className="text-gray-400 hover:text-white transition-colors">
                            <Phone className="w-5 h-5" />
                        </a>
                        <a href="#" aria-label="Thông tin thêm" className="text-gray-400 hover:text-white transition-colors">
                            <Info className="w-5 h-5" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}