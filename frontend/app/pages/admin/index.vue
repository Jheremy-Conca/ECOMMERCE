<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Panel admin',
  robots: 'noindex',
})

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()

const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    await Promise.all([
      productsStore.fetchProducts(),
      ordersStore.fetchOrders(),
    ])
  } catch (err: any) {
    loadError.value = err.message || 'Error al cargar el dashboard'
  } finally {
    isLoading.value = false
  }
})

// ---------------------------------------------------------------------------
// Ajusta estos nombres de campo si tu store de pedidos usa otros distintos.
// Asumo: o.createdAt (fecha), o.customerName, o.total, o.status
// ---------------------------------------------------------------------------
function getOrderDate(o: any): Date {
  return new Date(o.createdAt ?? o.date ?? Date.now())
}

const totalProducts = computed(() => productsStore.products.length)

const lowStockProducts = computed(() =>
  [...productsStore.products]
    .filter(p => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
)
const lowStockCount = computed(() => productsStore.products.filter(p => p.stock <= 10).length)

const activeOrders = computed(() => ordersStore.orders.filter(o => o.status !== 'CANCELLED'))
const pendingOrdersCount = computed(() => ordersStore.orders.filter(o => o.status === 'PENDING').length)
const totalRevenue = computed(() => activeOrders.value.reduce((sum, o) => sum + o.total, 0))

// ---- Serie de ingresos (14 días, uso los últimos 7 + los 7 previos para la tendencia) ----
function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

const last14Days = computed(() => {
  const days: { key: string; label: string; revenue: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', ''),
      revenue: 0,
    })
  }
  const map = new Map(days.map(d => [d.key, d]))
  for (const o of activeOrders.value) {
    const entry = map.get(dayKey(getOrderDate(o)))
    if (entry) entry.revenue += o.total
  }
  return days
})

const last7Days = computed(() => last14Days.value.slice(7))
const previous7Days = computed(() => last14Days.value.slice(0, 7))

const revenueLast7 = computed(() => last7Days.value.reduce((s, d) => s + d.revenue, 0))
const revenuePrev7 = computed(() => previous7Days.value.reduce((s, d) => s + d.revenue, 0))

const revenueTrend = computed(() => {
  if (revenuePrev7.value === 0) return revenueLast7.value > 0 ? 100 : 0
  return Math.round(((revenueLast7.value - revenuePrev7.value) / revenuePrev7.value) * 100)
})

const maxDayRevenue = computed(() => Math.max(...last7Days.value.map(d => d.revenue), 1))

// SVG area chart: puntos del sparkline grande de la cabecera (14 días)
const sparklinePoints = computed(() => {
  const w = 100
  const h = 32
  const max = Math.max(...last14Days.value.map(d => d.revenue), 1)
  return last14Days.value
    .map((d, i) => {
      const x = (i / (last14Days.value.length - 1)) * w
      const y = h - (d.revenue / max) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

// ---- Estados de pedidos (donut con conic-gradient, sin librerías) ----
const statusConfig = [
  { key: 'PENDING', label: 'Pendiente', color: '#f59e0b' },
  { key: 'PAID', label: 'Pagado', color: '#3b82f6' },
  { key: 'SHIPPED', label: 'Enviado', color: '#8b5cf6' },
  { key: 'DELIVERED', label: 'Entregado', color: '#10b981' },
  { key: 'CANCELLED', label: 'Cancelado', color: '#ef4444' },
]

const statusBreakdown = computed(() => {
  const total = ordersStore.orders.length || 1
  let cumulative = 0
  return statusConfig.map(s => {
    const count = ordersStore.orders.filter(o => o.status === s.key).length
    const percent = (count / total) * 100
    const start = cumulative
    cumulative += percent
    return { ...s, count, percent, start, end: cumulative }
  })
})

const donutGradient = computed(() => {
  const parts = statusBreakdown.value
    .filter(s => s.percent > 0)
    .map(s => `${s.color} ${s.start}% ${s.end}%`)
  return parts.length ? `conic-gradient(${parts.join(', ')})` : 'conic-gradient(#e4e4e7 0% 100%)'
})

const recentOrders = computed(() =>
  [...ordersStore.orders]
    .sort((a, b) => getOrderDate(b).getTime() - getOrderDate(a).getTime())
    .slice(0, 5)
)

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}
const statusBadgeClass: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  PAID: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  SHIPPED: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}

function formatCurrency(n: number) {
  return `S/ ${n.toFixed(2)}`
}
function formatDate(d: Date) {
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

const stats = computed(() => [
  {
    label: 'Productos',
    value: String(totalProducts.value),
    to: '/admin/productos',
    icon: 'box',
  },
  {
    label: 'Stock bajo (≤10)',
    value: String(lowStockCount.value),
    to: '/admin/productos',
    icon: 'alert',
    tone: lowStockCount.value > 0 ? 'warn' : 'default',
  },
  {
    label: 'Pedidos pendientes',
    value: String(pendingOrdersCount.value),
    to: '/admin/pedidos',
    icon: 'clock',
    tone: pendingOrdersCount.value > 0 ? 'warn' : 'default',
  },
  {
    label: 'Total vendido',
    value: formatCurrency(totalRevenue.value),
    to: '/admin/pedidos',
    icon: 'trend',
    trend: revenueTrend.value,
  },
])
</script>

<template>
  <div>
    <div class="flex items-end justify-between mb-6 sm:mb-8 gap-4">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-zinc-500 mt-1">Resumen general de la tienda</p>
      </div>

      <!-- Sparkline de ingresos de los últimos 14 días -->
      <div v-if="!isLoading && !loadError" class="hidden sm:block w-32 h-10">
        <svg viewBox="0 0 100 32" class="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
            </linearGradient>
          </defs>
          <polygon :points="`0,32 ${sparklinePoints} 100,32`" fill="url(#sparkFill)" />
          <polyline
            :points="sparklinePoints"
            fill="none"
            stroke="#10b981"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-24 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-900 lg:col-span-2" />
        <div class="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
      </div>
    </div>

    <p v-else-if="loadError" class="text-red-500">{{ loadError }}</p>

    <div v-else class="space-y-4 sm:space-y-6">
      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="stat in stats"
          :key="stat.label"
          :to="stat.to"
          class="group border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors relative overflow-hidden"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-zinc-500 mb-1">{{ stat.label }}</p>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
            </div>
            <div
              class="shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-colors"
              :class="stat.tone === 'warn'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'"
            >
              <svg v-if="stat.icon === 'box'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M21 8l-9-5-9 5 9 5 9-5z" stroke-linejoin="round" />
                <path d="M3 8v8l9 5 9-5V8" stroke-linejoin="round" />
                <path d="M12 13v8" />
              </svg>
              <svg v-else-if="stat.icon === 'alert'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M12 3l10 18H2L12 3z" stroke-linejoin="round" />
                <path d="M12 10v4" stroke-linecap="round" />
                <circle cx="12" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
              </svg>
              <svg v-else-if="stat.icon === 'clock'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" stroke-linecap="round" />
              </svg>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M3 17l6-6 4 4 8-9" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 6h6v6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <p v-if="stat.trend !== undefined" class="text-xs mt-3 flex items-center gap-1"
             :class="stat.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
            <span>{{ stat.trend >= 0 ? '▲' : '▼' }}</span>
            <span>{{ Math.abs(stat.trend) }}% vs. 7 días previos</span>
          </p>
        </NuxtLink>
      </div>

      <!-- Ingresos por día + estados de pedidos -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Gráfico de barras: ingresos últimos 7 días -->
        <div class="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold">Ingresos — últimos 7 días</h2>
            <span class="text-sm text-zinc-500">{{ formatCurrency(revenueLast7) }}</span>
          </div>

          <div class="flex items-end justify-between gap-2 h-40">
            <div
              v-for="day in last7Days"
              :key="day.key"
              class="flex-1 flex flex-col items-center justify-end h-full gap-2 group"
            >
              <span class="text-[11px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {{ formatCurrency(day.revenue) }}
              </span>
              <div class="w-full rounded-t-md bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden" style="height: 100%">
                <div
                  class="absolute bottom-0 left-0 w-full rounded-t-md bg-emerald-500/80 group-hover:bg-emerald-500 transition-all duration-500"
                  :style="{ height: `${(day.revenue / maxDayRevenue) * 100}%` }"
                />
              </div>
              <span class="text-[11px] text-zinc-500 capitalize">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- Donut: estados de pedidos -->
        <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
          <h2 class="font-semibold mb-4">Pedidos por estado</h2>

          <div class="flex items-center justify-center mb-4">
            <div class="relative w-32 h-32 rounded-full" :style="{ background: donutGradient }">
              <div class="absolute inset-3 rounded-full bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
                <span class="text-xl font-bold">{{ ordersStore.orders.length }}</span>
                <span class="text-[11px] text-zinc-500">pedidos</span>
              </div>
            </div>
          </div>

          <ul class="space-y-1.5">
            <li
              v-for="s in statusBreakdown.filter(s => s.count > 0)"
              :key="s.key"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: s.color }" />
                {{ s.label }}
              </span>
              <span class="text-zinc-500">{{ s.count }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Stock bajo + pedidos recientes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold">Stock bajo</h2>
            <NuxtLink to="/admin/productos" class="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              Ver todos →
            </NuxtLink>
          </div>

          <p v-if="lowStockProducts.length === 0" class="text-sm text-zinc-500">
            Ningún producto por debajo del umbral. Todo en orden.
          </p>

          <ul v-else class="space-y-3">
            <li v-for="p in lowStockProducts" :key="p.id" class="flex items-center gap-3">
              <span class="flex-1 text-sm truncate">{{ p.name }}</span>
              <div class="w-20 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="p.stock <= 3 ? 'bg-red-500' : 'bg-amber-500'"
                  :style="{ width: `${Math.min((p.stock / 10) * 100, 100)}%` }"
                />
              </div>
              <span class="text-xs w-6 text-right tabular-nums"
                    :class="p.stock <= 3 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'">
                {{ p.stock }}
              </span>
            </li>
          </ul>
        </div>

        <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold">Pedidos recientes</h2>
            <NuxtLink to="/admin/pedidos" class="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              Ver todos →
            </NuxtLink>
          </div>

          <p v-if="recentOrders.length === 0" class="text-sm text-zinc-500">
            Todavía no hay pedidos.
          </p>

          <ul v-else class="space-y-3">
            <li v-for="o in recentOrders" :key="o.id" class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">{{ o.customerName ?? 'Cliente' }}</p>
                <p class="text-xs text-zinc-500">{{ formatDate(getOrderDate(o)) }}</p>
              </div>
              <span class="text-sm font-medium tabular-nums">{{ formatCurrency(o.total) }}</span>
              <span
                class="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                :class="statusBadgeClass[o.status]"
              >
                {{ statusLabel[o.status] ?? o.status }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>