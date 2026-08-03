<template>
  <div class="max-w-lg mx-auto px-4 py-20 text-center">
    <h1 class="text-2xl font-bold mb-3">Pago cancelado</h1>
    <p class="text-white/60 mb-8">
      No se realizó ningún cargo. Tu carrito sigue intacto si quieres intentarlo de nuevo.
    </p>
    <NuxtLink
      to="/carrito"
      class="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg"
    >
      Volver al carrito
    </NuxtLink>
  </div>
</template>