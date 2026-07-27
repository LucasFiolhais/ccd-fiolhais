import type {
  CreateEventRegistrationInput,
  EventItem,
  EventRegistration
} from '~/types/event'

const initialEvents: EventItem[] = [
  {
    id: 1,
    title: 'Almoço Comunitário',
    slug: 'almoco-comunitario',
    description: 'Um almoço de convívio para juntar sócios, famílias e amigos da comunidade.',
    longDescription:
      'O Almoço Comunitário é um momento pensado para juntar a população de Fiolhais, sócios, famílias e amigos num ambiente simples, próximo e familiar. No futuro, esta página permitirá inscrição online, controlo de lugares disponíveis e confirmação de pagamento.',
    date: 'Data a anunciar',
    time: '12:30',
    location: 'Fiolhais',
    priceMember: '12€',
    priceNonMember: '15€',
    capacity: 80,
    registered: 0,
    status: 'open',
    imageEmoji: '🍽️',
    category: 'Convívio'
  },
  {
    id: 2,
    title: 'Magusto de Fiolhais',
    slug: 'magusto-fiolhais',
    description: 'Celebração tradicional com castanhas, convívio e momentos de partilha.',
    longDescription:
      'O Magusto de Fiolhais será dedicado à tradição, ao convívio e à partilha entre gerações. Esta página poderá futuramente incluir fotografias, cartaz oficial, inscrições e pagamento por MB WAY ou referência Multibanco.',
    date: 'Novembro',
    time: '15:00',
    location: 'Sede do CCD',
    priceMember: 'Inscrição necessária',
    priceNonMember: 'Inscrição necessária',
    capacity: 120,
    registered: 0,
    status: 'soon',
    imageEmoji: '🌰',
    category: 'Tradição'
  },
  {
    id: 3,
    title: 'Noite de Fados',
    slug: 'noite-de-fados',
    description: 'Uma noite cultural dedicada à música portuguesa e à comunidade.',
    longDescription:
      'A Noite de Fados pretende criar um ambiente cultural e acolhedor, valorizando a música portuguesa e a participação da comunidade. Será possível limitar lugares, gerir inscrições e consultar participantes através da área de administração.',
    date: 'Data a anunciar',
    time: '21:00',
    location: 'Fiolhais',
    priceMember: 'A definir',
    priceNonMember: 'A definir',
    capacity: 60,
    registered: 0,
    status: 'soon',
    imageEmoji: '🎤',
    category: 'Cultura'
  }
]

const initialRegistrations: EventRegistration[] = [
  {
    id: 1,
    eventId: 1,
    name: 'Ana Carvalho',
    email: 'ana@email.com',
    phone: '912 345 678',
    quantity: 2,
    isMember: true,
    totalAmount: 24,
    paymentStatus: 'paid',
    registeredAt: '2026-07-20',
    notes: 'Mesa perto da entrada.'
  },
  {
    id: 2,
    eventId: 1,
    name: 'João Martins',
    email: 'joao@email.com',
    phone: '913 456 789',
    quantity: 1,
    isMember: false,
    totalAmount: 15,
    paymentStatus: 'pending',
    registeredAt: '2026-07-21'
  },
  {
    id: 3,
    eventId: 1,
    name: 'Maria Fernandes',
    email: 'maria@email.com',
    phone: '914 567 890',
    quantity: 3,
    isMember: true,
    totalAmount: 36,
    paymentStatus: 'pending',
    registeredAt: '2026-07-22',
    notes: 'Uma pessoa vegetariana.'
  }
]

export const useEvents = () => {
  const events = useState<EventItem[]>('events', () => initialEvents)
  const registrations = useState<EventRegistration[]>('event-registrations', () => initialRegistrations)

  const getEvents = () => {
    return events.value
  }

  const getFeaturedEvents = () => {
    return events.value.slice(0, 3)
  }

  const getEventBySlug = (slug: string) => {
    return events.value.find((event) => event.slug === slug)
  }

  const getRegistrationsByEventId = (eventId: number) => {
    return registrations.value.filter((registration) => registration.eventId === eventId)
  }

  const getRegistrationsByEventSlug = (slug: string) => {
    const event = getEventBySlug(slug)

    if (!event) {
      return []
    }

    return getRegistrationsByEventId(event.id)
  }

  const getEventRegisteredCount = (eventId: number) => {
    return getRegistrationsByEventId(eventId)
      .filter((registration) => registration.paymentStatus !== 'cancelled')
      .reduce((total, registration) => total + registration.quantity, 0)
  }

  const getEventPendingPaymentsCount = (eventId: number) => {
    return getRegistrationsByEventId(eventId)
      .filter((registration) => registration.paymentStatus === 'pending').length
  }

  const markRegistrationAsPaid = (registrationId: number) => {
    const registration = registrations.value.find((item) => item.id === registrationId)

    if (!registration) {
      return
    }

    registration.paymentStatus = 'paid'
  }

  const cancelRegistration = (registrationId: number) => {
    const registration = registrations.value.find((item) => item.id === registrationId)

    if (!registration) {
      return
    }

    registration.paymentStatus = 'cancelled'
  }

  const addRegistration = (input: CreateEventRegistrationInput) => {
  const nextId =
    registrations.value.length > 0
      ? Math.max(...registrations.value.map((registration) => registration.id)) + 1
      : 1

  const newRegistration: EventRegistration = {
    id: nextId,
    eventId: input.eventId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    quantity: input.quantity,
    isMember: input.isMember,
    totalAmount: input.totalAmount,
    paymentStatus: 'pending',
    registeredAt: new Date().toISOString().slice(0, 10),
    notes: input.notes?.trim() || undefined
  }

  registrations.value.push(newRegistration)

  return newRegistration
}

return {
  events,
  registrations,
  getEvents,
  getFeaturedEvents,
  getEventBySlug,
  getRegistrationsByEventId,
  getRegistrationsByEventSlug,
  getEventRegisteredCount,
  getEventPendingPaymentsCount,
  addRegistration,
  markRegistrationAsPaid,
  cancelRegistration
}
}