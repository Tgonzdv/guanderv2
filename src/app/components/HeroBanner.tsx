import Navbar from "./Navbar";

export default function HeroBanner() {
  return (
    <section
      className="w-full"
      style={{
        background: "linear-gradient(135deg, #3D52D5 0%, #4A9FD4 55%, #43D8B0 100%)",
      }}
    >
      <Navbar />

      <div className="flex items-center justify-between px-8 pb-20 pt-6 max-w-7xl mx-auto gap-8">
        {/* Left: copy */}
        <div className="flex flex-col gap-6 max-w-xl">
          <h1 className="text-5xl font-black leading-tight tracking-tight text-white">
            Encuentra los mejores lugares{" "}
            <span style={{ color: "#43D696" }}>petfriendly cerca de ti</span>
          </h1>
          <p className="text-white/75 text-sm leading-relaxed max-w-sm">
            Tiendas, veterinarias, cafes, restaurantes y profesionales que aman
            a las mascotas tanto como tu. Acumula puntos, canjea cupones y dale
            lo mejor a tu peludo.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="#tiendas"
              className="px-7 py-3 bg-white rounded-full text-xs font-bold uppercase tracking-widest text-[#1a1a6e] hover:bg-white/90 transition-colors"
            >
              Explorar Tiendas
            </a>
            <a
              href="#planes"
              className="px-7 py-3 border border-white rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
            >
              Ver Planes
            </a>
          </div>
        </div>

        {/* Right: glass card */}
        <div className="hidden lg:flex shrink-0">
          <div
            className="w-64 h-64 rounded-[2rem] flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* Abstract paw shapes */}
            <div className="relative w-28 h-28">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full"
                style={{ background: "rgba(255,255,255,0.35)" }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-[40%] rotate-12"
                style={{ background: "rgba(255,255,255,0.25)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
