interface CheckoutAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
}

interface CheckoutSessionData {
  url: string
  orderId: string
}

interface CheckoutResponse {
  success: boolean
  message?: string
  data: CheckoutSessionData
}

export const useCheckout = () => {
  const { apiFetch } = useApi()

  const createSession = async (address: CheckoutAddress) => {
    const response = await apiFetch<CheckoutResponse>('/checkout', {
      method: 'POST',
      body: { address },
    })
    return response.data
  }

  return { createSession }
}