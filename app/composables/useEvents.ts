import { usePersistedState } from './usePersistedState'
import type {
  CreateEventInput,
  CreateEventRegistrationInput,
  EventItem,
  EventRegistration,
  UpdateEventInput
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

const getNextNumericId = (items: Array<{ id: string | number }>) => {
  const numericIds = items
    .map((item) => Number(item.id))
    .filter((id) => Number.isFinite(id))

  if (!numericIds.length) {
    return 1
  }

  return Math.max(...numericIds) + 1
}

const areIdsEqual = (firstId: string | number, secondId: string | number) => {
  return String(firstId) === String(secondId)
}

export const useEvents = () => {
  const events = usePersistedState<EventItem[]>('events', initialEvents)
  const registrations = usePersistedState<EventRegistration[]>(
    'event-registrations',
    initialRegistrations
  )

  const getEvents = () => {
    return events.value
  }

  const getFeaturedEvents = () => {
    return events.value.slice(0, 3)
  }

  const getEventBySlug = (slug: string) => {
    return events.value.find((event) => event.slug === slug)
  }

  const getRegistrationsByEventId = (eventId: string | number) => {
    return registrations.value.filter((registration) => {
      return areIdsEqual(registration.eventId, eventId)
    })
  }

  const getRegistrationsByEventSlug = (slug: string) => {
    const event = getEventBySlug(slug)

    if (!event) {
      return []
    }

    return getRegistrationsByEventId(event.id)
  }

  const getEventRegisteredCount = (eventId: string | number) => {
    return getRegistrationsByEventId(eventId)
      .filter((registration) => registration.paymentStatus !== 'cancelled')
      .reduce((total, registration) => total + registration.quantity, 0)
  }

  const getEventPendingPaymentsCount = (eventId: string | number) => {
    return getRegistrationsByEventId(eventId)
      .filter((registration) => registration.paymentStatus === 'pending')
      .length
  }

  const markRegistrationAsPaid = (registrationId: string | number) => {
    const registration = registrations.value.find((item) => {
      return areIdsEqual(item.id, registrationId)
    })

    if (!registration) {
      return
    }

    registration.paymentStatus = 'paid'
  }

  const cancelRegistration = (registrationId: string | number) => {
    const registration = registrations.value.find((item) => {
      return areIdsEqual(item.id, registrationId)
    })

    if (!registration) {
      return
    }

    registration.paymentStatus = 'cancelled'
  }

  const addRegistration = (input: CreateEventRegistrationInput) => {
    const nextId = getNextNumericId(registrations.value)

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

  const slugify = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const generateUniqueSlug = (title: string) => {
    const baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 2

    while (events.value.some((event) => event.slug === slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  const createEvent = (input: CreateEventInput) => {
    const nextId = getNextNumericId(events.value)

    const newEvent: EventItem = {
      id: nextId,
      title: input.title,
      slug: generateUniqueSlug(input.title),
      description: input.description,
      longDescription: input.longDescription,
      date: input.date,
      time: input.time,
      location: input.location,
      priceMember: input.priceMember,
      priceNonMember: input.priceNonMember,
      capacity: input.capacity,
      registered: 0,
      status: input.status,
      imageEmoji: input.imageEmoji,
      category: input.category
    }

    events.value.push(newEvent)

    return newEvent
  }

  const updateEvent = (eventSlug: string, input: UpdateEventInput) => {
    const event = getEventBySlug(eventSlug)

    if (!event) {
      return null
    }

    event.title = input.title
    event.description = input.description
    event.longDescription = input.longDescription
    event.date = input.date
    event.time = input.time
    event.location = input.location
    event.priceMember = input.priceMember
    event.priceNonMember = input.priceNonMember
    event.capacity = input.capacity
    event.status = input.status
    event.imageEmoji = input.imageEmoji
    event.category = input.category

    return event
  }

  const deleteEvent = (eventSlug: string) => {
    const event = getEventBySlug(eventSlug)

    if (!event) {
      return false
    }

    events.value = events.value.filter((item) => item.slug !== eventSlug)
    registrations.value = registrations.value.filter((registration) => {
      return !areIdsEqual(registration.eventId, event.id)
    })

    return true
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
    createEvent,
    updateEvent,
    deleteEvent,
    markRegistrationAsPaid,
    cancelRegistration
  }
}