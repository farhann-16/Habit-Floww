import { Github, Linkedin, Globe, Mail } from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { name: 'GitHub', href: 'https://github.com/farhann-16', icon: Github },
        { name: 'LinkedIn', href: 'https://www.linkedin.com/in/farhan16/', icon: Linkedin },
        { name: 'Portfolio', href: 'https://decodedbyfarhan.tech', icon: Globe },
    ];

    return (
        <footer className="mt-auto py-8 px-4 border-t border-sidebar-border bg-sidebar text-sidebar-foreground/80">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Branding & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sidebar-foreground text-lg">HabitFlow</span>
                        <span className="text-xs text-sidebar-foreground/40 hidden md:inline">•</span>
                        <span className="text-xs text-sidebar-foreground/60 transition-colors">Premium Habit Tracking</span>
                    </div>
                    <p className="text-[10px] text-sidebar-foreground/30 uppercase tracking-[0.2em] font-semibold">
                        © {currentYear} CRAFTED BY FARHAN DIWAN
                    </p>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-6">
                    {socialLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all transform hover:scale-110"
                                title={link.name}
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        );
                    })}
                    <div className="w-px h-4 bg-sidebar-border hidden md:block" />
                    <a
                        href="mailto:farhandiwan0001@gmail.com"
                        className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
                    >
                        <Mail className="w-4 h-4 text-sidebar-foreground/40" />
                        <span className="hidden sm:inline">farhandiwan0001@gmail.com</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};
