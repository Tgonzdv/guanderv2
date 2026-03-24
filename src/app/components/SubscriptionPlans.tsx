import { Check, X, Shield, Star, Rocket, Zap, Info } from 'lucide-react';

const plans = [
  {
    name: "Plan FREE",
    badge: "USUARIO",
    price: "FREE",
    period: "",
    description: "La guía esencial para descubrir la ciudad",
    features: [
      { text: "Perfil básico en la app", included: true },
      { text: "Mapa interactivo", included: true },
      { text: "Reseñas y calificaciones", included: true },
      { text: "Acumulación básica de puntos", included: true },
      { text: "Experiencia sin anuncios", included: false },
      { text: "Soporte prioritario", included: false },
      { text: "Gana puntos x2 en locales", included: false },
    ],
    buttonText: "Elegir Plan FREE",
    buttonColor: "bg-indigo-500 hover:bg-indigo-600",
    textColor: "text-indigo-500",
    popular: false,
    icon: <Shield className="w-5 h-5" />
  },
  {
    name: "Plan Basico",
    badge: "USUARIO",
    price: "$4,990",
    period: "/mes",
    description: "El pasaporte al ahorro y beneficios premium.",
    features: [
      { text: "Gana puntos x2 en locales", included: true },
      { text: "Descuentos fijos en comercios", included: true },
      { text: "Recompensas únicas", included: true },
      { text: "Experiencia sin anuncios", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    buttonText: "Elegir Plan Basico",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-blue-500",
    popular: true,
    icon: <Star className="w-5 h-5" />
  },
  {
    name: "Plan Pro",
    badge: "Profesionales",
    price: "$9,990",
    period: "/mes",
    description: "Tu vidriera digital para ganar visibilidad.",
    features: [
      { text: "Perfil premium destacado", included: true },
      { text: "Gestión multi-servicio", included: true },
      { text: "Analytics básico", included: true },
      { text: "Visibilidad estándar", included: true },
      { text: "Promociones ilimitadas", included: false },
      { text: "Soporte 24/7", included: false },
    ],
    buttonText: "Elegir Plan Pro",
    buttonColor: "bg-violet-500 hover:bg-violet-600",
    textColor: "text-violet-500",
    popular: false,
    icon: <Rocket className="w-5 h-5" />
  },
  {
    name: "Plan Premium",
    badge: "Profesionales",
    price: "$14,990",
    period: "/mes",
    description: "Máxima visibilidad para atraer más clientes",
    features: [
      { text: "Perfil premium destacado", included: true },
      { text: "Gestión multi-servicio", included: true },
      { text: "Analytics avanzado", included: true },
      { text: "Top en búsquedas", included: true },
      { text: "Promociones ilimitadas", included: true },
      { text: "Soporte 24/7", included: true },
    ],
    buttonText: "Elegir Plan Premium",
    buttonColor: "bg-fuchsia-500 hover:bg-fuchsia-600",
    textColor: "text-fuchsia-500",
    popular: false,
    icon: <Zap className="w-5 h-5" />
  }
];

export default function SubscriptionPlans() {
  return (
    <section id="planes" className="w-full bg-[#f8fafc] py-24 sm:py-32 relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Planes de Suscripción
          </h2>
          <p className="text-slate-500 text-lg md:text-xl">
            ¡Elegí el plan que mejor se adapte a vos!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1400px] mx-auto">
          {/* Grupo Usuarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {plans.slice(0, 2).map((plan, index) => (
              <div 
                key={index} 
                className={`flex flex-col h-full relative bg-white rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/10 z-10 scale-100 lg:scale-105' 
                    : 'border border-slate-100 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center drop-shadow-md">
                    <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="flex justify-center mb-6">
                  <span className="text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider bg-indigo-100 text-indigo-600">
                    {plan.badge}
                  </span>
                </div>

                <div className="text-center mb-8 flex-shrink-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 text-slate-900">
                    <span className={`text-4xl lg:text-5xl font-black tracking-tighter ${plan.textColor}`}>
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-4 italic min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* Features list grows to push button to the bottom */}
                <div className="flex-grow">
                  <ul className="flex flex-col gap-4 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${feature.included ? 'text-emerald-500' : 'text-slate-300'}`}>
                          {feature.included ? <Check strokeWidth={3} className="w-4 h-4" /> : <X strokeWidth={3} className="w-4 h-4" />}
                        </div>
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex-shrink-0">
                  <button 
                    className={`w-full py-4 px-6 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 ${plan.buttonColor} shadow-md shadow-current/20 hover:shadow-lg`}
                  >
                    {plan.icon}
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grupo Profesionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 relative">
            {/* Divisor Visual Decorativo Solo Desktop */}
            <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-px h-3/4 bg-slate-200/60" />

            {plans.slice(2, 4).map((plan, index) => (
              <div 
                key={index + 2} 
                className={`flex flex-col h-full relative bg-white rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 border border-slate-100 shadow-lg hover:shadow-xl`}
              >
                <div className="flex justify-center mb-6">
                  <span className="text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider bg-fuchsia-100 text-fuchsia-600">
                    {plan.badge}
                  </span>
                </div>

                <div className="text-center mb-8 flex-shrink-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 text-slate-900">
                    <span className={`text-4xl lg:text-5xl font-black tracking-tighter ${plan.textColor}`}>
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-4 italic min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="flex-grow">
                  <ul className="flex flex-col gap-4 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${feature.included ? 'text-emerald-500' : 'text-slate-300'}`}>
                          {feature.included ? <Check strokeWidth={3} className="w-4 h-4" /> : <X strokeWidth={3} className="w-4 h-4" />}
                        </div>
                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex-shrink-0">
                  <button 
                    className={`w-full py-4 px-6 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 ${plan.buttonColor} shadow-md shadow-current/20 hover:shadow-lg`}
                  >
                    {plan.icon}
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="inline-flex items-center gap-2 text-sm text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
            <Info className="w-4 h-4 text-amber-500" />
            Todos los planes incluyen 30 días de prueba gratis. Cancelá cuando quieras sin penalidades.
          </p>
        </div>
      </div>
    </section>
  );
}
