// 100 promociones semanales rotativas para afiliados
// Cada una diseñada para maximizar referidos y dar ganancia estable
// Se rotan automáticamente cada semana según el número de semana del año

const promotions = [
  // === COMMISSION BOOSTS (semanas 1-30) ===
  { id: 1, type: 'commission_boost', title: '🔥 Comisión Doble', desc: '50% de comisión en TODOS los referidos esta semana', value: 50, bonus: 25, color: 'from-red-500 to-orange-500' },
  { id: 2, type: 'commission_boost', title: '⚡ Flash 35%', desc: '35% de comisión en todos los planes esta semana', value: 35, bonus: 10, color: 'from-yellow-500 to-orange-500' },
  { id: 3, type: 'commission_boost', title: '🚀 Mega Semana', desc: '40% en Plan Pro, 30% en los demás', value: 40, bonus: 15, color: 'from-violet-500 to-purple-500' },
  { id: 4, type: 'commission_boost', title: '💎 Premium Boost', desc: '45% de comisión en Plan AI esta semana', value: 45, bonus: 20, color: 'from-blue-500 to-indigo-500' },
  { id: 5, type: 'commission_boost', title: '🌟 Súper Afiliado', desc: '38% en todos los planes, sin límite de referidos', value: 38, bonus: 13, color: 'from-emerald-500 to-teal-500' },
  { id: 6, type: 'commission_boost', title: '🎯 Triple Pro', desc: '75% en el primer mes de cada referido Pro', value: 75, bonus: 50, color: 'from-pink-500 to-rose-500' },
  { id: 7, type: 'commission_boost', title: '📈 Escalada', desc: '30% base + 5% extra por cada 3 referidos', value: 30, bonus: 5, color: 'from-cyan-500 to-blue-500' },
  { id: 8, type: 'commission_boost', title: '🏆 Máximo Rendimiento', desc: '55% de comisión para los primeros 10 referidos', value: 55, bonus: 30, color: 'from-amber-500 to-yellow-500' },
  { id: 9, type: 'commission_boost', title: '🎪 Feria de Comisiones', desc: 'Elegí tu plan: 35% Starter, 40% Pro, 50% AI', value: 50, bonus: 25, color: 'from-fuchsia-500 to-pink-500' },
  { id: 10, type: 'commission_boost', title: '⚡ Relámpago', desc: '42% en todas las suscripciones, 48hs de duración', value: 42, bonus: 17, color: 'from-lime-500 to-green-500' },
  { id: 11, type: 'commission_boost', title: '🎯 Precisión', desc: '33% en Starter, 44% en Pro, 55% en AI', value: 55, bonus: 30, color: 'from-sky-500 to-indigo-500' },
  { id: 12, type: 'commission_boost', title: '🚀 Despegue', desc: 'Doble comisión en Plan AI + 35% en el resto', value: 50, bonus: 25, color: 'from-orange-500 to-red-500' },
  { id: 13, type: 'commission_boost', title: '💥 IMPACTO Total', desc: 'Comisión del 60% esta semana. NO todos los meses.', value: 60, bonus: 35, color: 'from-purple-600 to-pink-600' },
  { id: 14, type: 'commission_boost', title: '🌊 Ola de Referidos', desc: 'Cada referido suma +2% a tu comisión acumulada', value: 25, bonus: 2, color: 'from-teal-500 to-cyan-500' },
  { id: 15, type: 'commission_boost', title: '🎆 Fin de Semana Épico', desc: 'Viernes a Domingo: 50% en todos los planes', value: 50, bonus: 25, color: 'from-rose-600 to-purple-600' },
  { id: 16, type: 'commission_boost', title: '🔝 Top Tier', desc: 'Referí 5+ esta semana y bloqueá 40% permanente', value: 40, bonus: 15, color: 'from-amber-600 to-red-600' },
  { id: 17, type: 'commission_boost', title: '🎁 Caja de Comisiones', desc: '33% base + bonos sorpresa por cada referido', value: 33, bonus: 8, color: 'from-green-500 to-emerald-500' },
  { id: 18, type: 'commission_boost', title: '♠️ As en la Manga', desc: '42% en Plan Pro. Mejor semana para vender Pro', value: 42, bonus: 17, color: 'from-indigo-600 to-blue-600' },
  { id: 19, type: 'commission_boost', title: '💪 Power Week', desc: '48% comisión para los que tengan 3+ referidos activos', value: 48, bonus: 23, color: 'from-red-600 to-orange-600' },
  { id: 20, type: 'commission_boost', title: '🎰 Comisión Variable', desc: 'Entre 30% y 60% según el plan. Pro paga más.', value: 60, bonus: 35, color: 'from-yellow-600 to-amber-600' },
  { id: 21, type: 'commission_boost', title: '🧲 Iman de Referidos', desc: 'Bonus de 5% extra por cada referido que pague AI', value: 30, bonus: 5, color: 'from-violet-600 to-fuchsia-600' },
  { id: 22, type: 'commission_boost', title: '🔥 Fuego Cruzado', desc: '37% en Starter + 47% en Pro. Combinación letal.', value: 47, bonus: 22, color: 'from-orange-500 to-red-500' },
  { id: 23, type: 'commission_boost', title: '🦅 Águila', desc: 'Mirá desde arriba: 40% en TODOS los planes', value: 40, bonus: 15, color: 'from-sky-600 to-blue-600' },
  { id: 24, type: 'commission_boost', title: '🐉 Dragón Semanal', desc: 'Comisión escala: 30% → 35% → 45% según referidos', value: 45, bonus: 20, color: 'from-emerald-600 to-green-600' },
  { id: 25, type: 'commission_boost', title: '⭐ 5 Estrellas', desc: '50% para los que refieran 5 personas', value: 50, bonus: 25, color: 'from-yellow-400 to-amber-500' },
  { id: 26, type: 'commission_boost', title: '🎭 Dúo Dinámico', desc: 'Referí 2 y activá 45% en todos los planes', value: 45, bonus: 20, color: 'from-pink-500 to-violet-500' },
  { id: 27, type: 'commission_boost', title: '🧨 Explosión', desc: 'Semana de 52% en Plan AI. IA vende solo.', value: 52, bonus: 27, color: 'from-red-700 to-orange-700' },
  { id: 28, type: 'commission_boost', title: '🏅 Medalla de Oro', desc: '38% en Starter, 48% en Pro, 58% en AI', value: 58, bonus: 33, color: 'from-amber-500 to-yellow-600' },
  { id: 29, type: 'commission_boost', title: '🎯 Blanco Fijo', desc: 'Referí a dueños de agencia: 55% comisión', value: 55, bonus: 30, color: 'from-blue-700 to-indigo-700' },
  { id: 30, type: 'commission_boost', title: '🌈 Arcoíris de Comisiones', desc: 'Cada plan paga distinto. Promedio 42%.', value: 42, bonus: 17, color: 'from-purple-500 via-pink-500 to-red-500' },

  // === FIXED BONUSES (semanas 31-48) ===
  { id: 31, type: 'fixed_bonus', title: '💰 $5 por Referido', desc: 'Ganá $5 extra además de tu comisión del 25%', value: 5, bonus: 5, color: 'from-green-500 to-emerald-500' },
  { id: 32, type: 'fixed_bonus', title: '🎉 $10 Bonus', desc: '$10 por cada referido que se suscriba a Pro', value: 10, bonus: 10, color: 'from-violet-500 to-purple-500' },
  { id: 33, type: 'fixed_bonus', title: '💵 $15 Directo', desc: '$15 por cada referido a Plan AI esta semana', value: 15, bonus: 15, color: 'from-amber-500 to-orange-500' },
  { id: 34, type: 'fixed_bonus', title: '🎊 $8 por Cabeza', desc: '$8 extra por cada referido, cualquier plan', value: 8, bonus: 8, color: 'from-teal-500 to-cyan-500' },
  { id: 35, type: 'fixed_bonus', title: '💎 $20 Premium', desc: '$20 por cada referido a Plan Anual', value: 20, bonus: 20, color: 'from-blue-500 to-indigo-500' },
  { id: 36, type: 'fixed_bonus', title: '🧧 $3 Mínimo', desc: 'Ganá mínimo $3 por referido aunque elija el plan más barato', value: 3, bonus: 3, color: 'from-red-500 to-pink-500' },
  { id: 37, type: 'fixed_bonus', title: '✨ $12 Sorpresa', desc: '$12 por cada referido que complete el onboarding', value: 12, bonus: 12, color: 'from-fuchsia-500 to-violet-500' },
  { id: 38, type: 'fixed_bonus', title: '📊 $7 Acumulable', desc: '$7 extra por referido + comisión normal. Todo suma.', value: 7, bonus: 7, color: 'from-lime-500 to-green-500' },
  { id: 39, type: 'fixed_bonus', title: '🏦 $25 Anual', desc: '$25 por cada referido que pague plan anual', value: 25, bonus: 25, color: 'from-emerald-600 to-teal-600' },
  { id: 40, type: 'fixed_bonus', title: '💸 $18 Flash', desc: '$18 por cada referido en las primeras 48hs', value: 18, bonus: 18, color: 'from-orange-500 to-red-500' },
  { id: 41, type: 'fixed_bonus', title: '🎯 $6 Seguro', desc: '$6 por referido + 25% comisión. Ganancias aseguradas.', value: 6, bonus: 6, color: 'from-sky-500 to-blue-500' },
  { id: 42, type: 'fixed_bonus', title: '🚀 $22 Pro', desc: '$22 por cada referido que se suscriba a Pro anual', value: 22, bonus: 22, color: 'from-purple-500 to-indigo-500' },
  { id: 43, type: 'fixed_bonus', title: '🎪 $9 Carnaval', desc: '$9 por referido + sorteo de $100 entre todos', value: 9, bonus: 9, color: 'from-pink-500 to-rose-500' },
  { id: 44, type: 'fixed_bonus', title: '💎 $30 VIP', desc: '$30 por cada referido que sea empresa/agencia', value: 30, bonus: 30, color: 'from-amber-600 to-yellow-600' },
  { id: 45, type: 'fixed_bonus', title: '🎄 $14 Regalo', desc: '$14 por referido + comisión. Sin límite.', value: 14, bonus: 14, color: 'from-green-600 to-emerald-600' },
  { id: 46, type: 'fixed_bonus', title: '🔥 $11 Caliente', desc: '$11 por cada Starter, $16 por cada Pro, $21 por AI', value: 21, bonus: 11, color: 'from-red-600 to-orange-600' },
  { id: 47, type: 'fixed_bonus', title: '🎁 $13 Suerte', desc: '$13 por referido + 1 entry al sorteo de $500', value: 13, bonus: 13, color: 'from-violet-600 to-fuchsia-600' },
  { id: 48, type: 'fixed_bonus', title: '💪 $17 Esfuerzo', desc: '$17 por cada referido que pague más de $29/mes', value: 17, bonus: 17, color: 'from-blue-600 to-indigo-600' },

  // === TIER BONUSES (semanas 49-60) ===
  { id: 49, type: 'tier_bonus', title: '🎯 3×$50', desc: '3 referidos = $50 de bonus. Simple.', value: 50, bonus: 50, color: 'from-violet-500 to-purple-600' },
  { id: 50, type: 'tier_bonus', title: '🏅 5×$100', desc: '5 referidos en la semana = $100 garantizados', value: 100, bonus: 100, color: 'from-amber-500 to-orange-600' },
  { id: 51, type: 'tier_bonus', title: '🎖 2×$25', desc: 'Con solo 2 referidos ganás $25 extra', value: 25, bonus: 25, color: 'from-blue-500 to-cyan-500' },
  { id: 52, type: 'tier_bonus', title: '🏆 10×$300', desc: '10 referidos en una semana = $300 de bonus', value: 300, bonus: 300, color: 'from-yellow-500 to-amber-600' },
  { id: 53, type: 'tier_bonus', title: '🎪 4×$75', desc: '4 referidos = $75. 8 referidos = $200', value: 200, bonus: 75, color: 'from-emerald-500 to-teal-600' },
  { id: 54, type: 'tier_bonus', title: '🚀 Meta 1: $20', desc: 'Primer referido de la semana: $20 de regalo', value: 20, bonus: 20, color: 'from-pink-500 to-rose-600' },
  { id: 55, type: 'tier_bonus', title: '💎 7×$200', desc: '7 referidos (uno por día) = $200 de bonus', value: 200, bonus: 200, color: 'from-indigo-500 to-purple-600' },
  { id: 56, type: 'tier_bonus', title: '🔥 Escalera: 1+3+5', desc: '1=$10, 3=$40, 5=$100. Bonus acumulativos.', value: 100, bonus: 10, color: 'from-red-500 to-orange-600' },
  { id: 57, type: 'tier_bonus', title: '🎯 6×$150', desc: '6 referidos a Plan Pro = $150 de bonus', value: 150, bonus: 150, color: 'from-fuchsia-500 to-violet-600' },
  { id: 58, type: 'tier_bonus', title: '🌟 8×$250', desc: '8 referidos en 7 días = $250. ¿Te animás?', value: 250, bonus: 250, color: 'from-lime-500 to-green-600' },
  { id: 59, type: 'tier_bonus', title: '🎰 3+3+3', desc: '3 Starter + 3 Pro + 3 AI = $500 de bonus total', value: 500, bonus: 500, color: 'from-cyan-500 to-blue-600' },
  { id: 60, type: 'tier_bonus', title: '🏁 Meta Rápida', desc: 'Primeros 3 referidos de la semana: $15 c/u', value: 45, bonus: 15, color: 'from-teal-500 to-emerald-600' },

  // === DOUBLE PLAN (semanas 61-72) ===
  { id: 61, type: 'double_plan', title: '🎯 Pro Power', desc: 'Comisión DOBLE en Plan Pro (50%) toda la semana', value: 50, bonus: 25, color: 'from-violet-600 to-indigo-600' },
  { id: 62, type: 'double_plan', title: '🤖 AI Explosion', desc: 'Doble comisión en Plan AI. 50% directo.', value: 50, bonus: 25, color: 'from-emerald-500 to-teal-500' },
  { id: 63, type: 'double_plan', title: '🚀 Starter Boost', desc: 'Doble en Starter: 50% para arrancar fuerte', value: 50, bonus: 25, color: 'from-blue-500 to-sky-500' },
  { id: 64, type: 'double_plan', title: '💎 Triple Anual', desc: 'Comisión TRIPLE en planes anuales. ¡75%!', value: 75, bonus: 50, color: 'from-amber-500 to-orange-500' },
  { id: 65, type: 'double_plan', title: '📊 Pro + AI Combo', desc: 'Doble en Pro + AI. Referí al que más paga.', value: 50, bonus: 25, color: 'from-pink-500 to-purple-500' },
  { id: 66, type: 'double_plan', title: '🔥 Starter a Pro', desc: '50% si suben de Starter a Pro esta semana', value: 50, bonus: 25, color: 'from-red-500 to-orange-500' },
  { id: 67, type: 'double_plan', title: '🧠 AI Only Week', desc: '55% exclusivo en Plan AI. IA es el futuro.', value: 55, bonus: 30, color: 'from-fuchsia-500 to-violet-500' },
  { id: 68, type: 'double_plan', title: '🏢 Agencia Week', desc: 'Doble comisión en planes empresa (Pro+). 60%', value: 60, bonus: 35, color: 'from-indigo-500 to-blue-600' },
  { id: 69, type: 'double_plan', title: '📈 Crecimiento', desc: 'Doble en Pro. Ayudá a crecer a tu red.', value: 50, bonus: 25, color: 'from-green-500 to-emerald-500' },
  { id: 70, type: 'double_plan', title: '💰 Monetizá', desc: 'Doble comisión en el plan más caro (AI)', value: 50, bonus: 25, color: 'from-yellow-500 to-amber-500' },
  { id: 71, type: 'double_plan', title: '🎯 Precisión Quirúrgica', desc: 'Doble en el plan que vos elijas. Comunicanos cuál.', value: 50, bonus: 25, color: 'from-cyan-500 to-blue-500' },
  { id: 72, type: 'double_plan', title: '♻️ Upgrade Week', desc: '50% si referís upgrades (Starter→Pro, Pro→AI)', value: 50, bonus: 25, color: 'from-teal-500 to-green-500' },

  // === FREE ACCESS (semanas 73-80) ===
  { id: 73, type: 'free_access', title: '🎟 1 Mes Gratis', desc: '3 referidos = 1 mes de NEXUS gratis para VOS', value: 29, bonus: 29, color: 'from-violet-500 to-purple-500' },
  { id: 74, type: 'free_access', title: '🗓 3 Meses Free', desc: '5 referidos = 3 meses de Plan Pro sin pagar', value: 87, bonus: 87, color: 'from-emerald-500 to-teal-500' },
  { id: 75, type: 'free_access', title: '🎫 6 Meses Pro', desc: '8 referidos = medio año de Pro gratis', value: 174, bonus: 174, color: 'from-amber-500 to-orange-500' },
  { id: 76, type: 'free_access', title: '🏆 Año Gratis', desc: '15 referidos = 1 año COMPLETO de NEXUS Pro', value: 348, bonus: 348, color: 'from-red-500 to-pink-500' },
  { id: 77, type: 'free_access', title: '🤖 AI Gratis 1 Mes', desc: '4 referidos a Plan AI = 1 mes de AI gratis', value: 49, bonus: 49, color: 'from-blue-500 to-indigo-500' },
  { id: 78, type: 'free_access', title: '📦 Combo: 2 meses', desc: '6 referidos = 2 meses de NEXUS gratis', value: 58, bonus: 58, color: 'from-cyan-500 to-sky-500' },
  { id: 79, type: 'free_access', title: '🎪 Feria Gratis', desc: 'Cada 3 referidos = 1 mes gratis. Sin tope.', value: 29, bonus: 29, color: 'from-fuchsia-500 to-violet-500' },
  { id: 80, type: 'free_access', title: '💎 Lifetime Free', desc: '25 referidos = NEXUS GRATIS DE POR VIDA', value: 999, bonus: 999, color: 'from-yellow-500 to-amber-500' },

  // === CONTESTS (semanas 81-90) ===
  { id: 81, type: 'contest', title: '🥇 Top 1: $500', desc: 'El que más referidos tenga este mes gana $500', value: 500, bonus: 500, color: 'from-amber-500 to-yellow-500' },
  { id: 82, type: 'contest', title: '🥈 Top 3: $200 c/u', desc: 'Los 3 mejores reciben $200 cada uno', value: 200, bonus: 200, color: 'from-sky-500 to-blue-500' },
  { id: 83, type: 'contest', title: '🥉 Top 10: $50 c/u', desc: 'Los 10 mejores afiliados ganan $50', value: 50, bonus: 50, color: 'from-emerald-500 to-teal-500' },
  { id: 84, type: 'contest', title: '🎰 Rifa Semanal', desc: 'Cada referido = 1 entry. Sorteo de $200.', value: 200, bonus: 200, color: 'from-purple-500 to-fuchsia-500' },
  { id: 85, type: 'contest', title: '🎲 Sorpresa Diaria', desc: 'El referido N° de cada día gana bonus extra', value: 50, bonus: 50, color: 'from-pink-500 to-rose-500' },
  { id: 86, type: 'contest', title: '🏅 Medallas', desc: 'Oro: $300, Plata: $150, Bronce: $75', value: 300, bonus: 300, color: 'from-yellow-600 to-amber-600' },
  { id: 87, type: 'contest', title: '🎯 Blanco Móvil', desc: 'Meta de 10 referidos entre todos. Si se llega, sorteo de $1,000', value: 1000, bonus: 1000, color: 'from-red-600 to-orange-600' },
  { id: 88, type: 'contest', title: '👑 Rey de la Semana', desc: 'El #1 en referidos gana $350 + badge especial', value: 350, bonus: 350, color: 'from-indigo-600 to-purple-600' },
  { id: 89, type: 'contest', title: '🚀 Cohete', desc: 'El que más recaude en comisiones gana $400', value: 400, bonus: 400, color: 'from-blue-600 to-indigo-600' },
  { id: 90, type: 'contest', title: '🎊 Sorteo Garantizado', desc: 'Todos los que refieran 1+ entran al sorteo de $100', value: 100, bonus: 100, color: 'from-green-600 to-emerald-600' },

  // === SPECIAL (semanas 91-100) ===
  { id: 91, type: 'special', title: '🎄 Especial Navidad', desc: '50% en todos los planes + $20 por referido', value: 50, bonus: 20, color: 'from-red-600 to-green-600' },
  { id: 92, type: 'special', title: '🎆 Año Nuevo', desc: 'Doble comisión + bonus de $50 por cada 3 referidos', value: 50, bonus: 50, color: 'from-yellow-500 to-red-500' },
  { id: 93, type: 'special', title: '❤️ San Valentín', desc: 'Referí a un colega: 45% comisión para los dos', value: 45, bonus: 20, color: 'from-pink-500 to-red-500' },
  { id: 94, type: 'special', title: '🎃 Halloween', desc: 'Comisión del 66%... ¡de miedo! Por 48hs.', value: 66, bonus: 41, color: 'from-orange-700 to-black' },
  { id: 95, type: 'special', title: '🦃 Thanksgiving', desc: 'Semana de agradecimiento: 40% para todos', value: 40, bonus: 15, color: 'from-amber-600 to-orange-600' },
  { id: 96, type: 'special', title: '🎂 Aniversario', desc: 'Celebramos X años: 55% en todos los planes', value: 55, bonus: 30, color: 'from-violet-500 to-fuchsia-500' },
  { id: 97, type: 'special', title: '💼 Lunes de Negocios', desc: 'Referí startups: 60% comisión en sus primeros 3 meses', value: 60, bonus: 35, color: 'from-blue-500 to-indigo-500' },
  { id: 98, type: 'special', title: '📚 Educación', desc: 'Referí estudiantes: 40% + 1 mes gratis para ellos', value: 40, bonus: 15, color: 'from-teal-500 to-cyan-500' },
  { id: 99, type: 'special', title: '🌍 Global Week', desc: 'Referidos internacionales: 35% + $5 bonus c/u', value: 35, bonus: 5, color: 'from-green-500 to-emerald-500' },
  { id: 100, type: 'special', title: '🏁 Grand Finale', desc: 'TODO ACTIVADO: 50% comisión + bonus por referido + sorteo', value: 50, bonus: 30, color: 'from-red-600 via-purple-600 to-indigo-600' },
]

export function getCurrentPromotion() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7)
  const index = (week - 1) % promotions.length
  return { ...promotions[index], week }
}

export function getPromotionByWeek(week) {
  const index = (week - 1) % promotions.length
  return { ...promotions[index], week }
}

export function getAllPromotions() {
  return promotions
}

export default promotions
