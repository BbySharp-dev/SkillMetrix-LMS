import { Link } from 'react-router-dom';

// Raw SVGs
const SvgGlobe = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const SvgBookOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const SvgMail = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const SvgPhone = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const SvgInfo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
);
const SvgExternalLink = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
);

export default function Footer() {
    const footerLinks = [
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

    return (
        <footer className="bg-[#1c1d1f] text-white pt-12 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-24 flex-1">
                        {footerLinks.map((section) => (
                            <div key={section.title} className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{section.title}</h4>
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
                            <SvgGlobe />
                            Tiếng Việt
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-gray-800">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <span className="text-white"><SvgBookOpen /></span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">
                            Skill<span className="text-indigo-400">Metrix</span>
                        </span>
                    </Link>

                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        © 2026 SkillMetrix LMS, Inc.
                    </p>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><SvgMail /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><SvgExternalLink /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><SvgPhone /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><SvgInfo /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
