import { Smartphone } from 'lucide-react';

export default function DownloadsSection() {
  return (
    <section className="relative w-full bg-[#1b3d2b] overflow-hidden py-24 sm:py-32">
      {/* Decorative abstract elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-black/10 blur-3xl" />
        
        {/* Subtle curve at the bottom similar to screenshot */}
        <svg 
          className="absolute bottom-0 w-full h-24 sm:h-32 text-white/5" 
          preserveAspectRatio="none" 
          viewBox="0 0 1440 320" 
          fill="currentColor"
        >
          <path d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,170.7C672,171,768,213,864,224C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center focus-within:outline-none">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#f9fafb] tracking-tight text-balance leading-tight mb-8">
          Conecta tu mascota con lugares <br className="hidden md:block" /> pet-friendly
        </h2>
        
        <p className="mt-4 text-lg md:text-xl text-[#d1d5db] max-w-2xl mx-auto leading-relaxed text-balance mb-12">
          Descubre locales, restaurantes y servicios que aman a las mascotas tanto como tú. Gana puntos por cada visita y canjéalos por recompensas.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group flex items-center gap-3 px-8 py-4 bg-[#f8fafc] hover:bg-white text-[#1b3d2b] rounded-2xl font-bold text-base md:text-lg transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:translate-y-0">
            <Smartphone strokeWidth={2.5} className="w-6 h-6 text-[#2a5d42] group-hover:scale-110 transition-transform" />
            <span>Descargar para Android</span>
          </button>
        </div>
      </div>
    </section>
  );
}
