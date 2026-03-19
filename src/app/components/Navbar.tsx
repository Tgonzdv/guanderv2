const navLinks = [
  { label: "Inicio", href: "#", active: true },
  { label: "Tiendas", href: "#" },
  { label: "Planes", href: "#" },
  { label: "Contacto", href: "#" },
];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto">
      <a href="/" className="flex items-center gap-2">
        <span className="text-[#43D696] text-2xl font-bold">✶</span>
        <span className="text-white font-bold text-xl tracking-tight">Guander</span>
      </a>
      <ul className="flex items-center gap-8">
        {navLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                link.active
                  ? "text-[#43D696]"
                  : "text-white hover:text-[#43D696]"
              }`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
