export type EventStatus = 'open' | 'soon' | 'sold_out' | 'closed'
export type EventRegistrationStatus = 'pending' | 'paid' | 'cancelled'

export interface EventItem {
  id: number
  title: string
  slug: string
  description: string
  longDescription: string
  date: string
  time: string
  location: string
  priceMember: string
  priceNonMember: string
  capacity: number
  registered: number
  status: EventStatus
  imageEmoji: string
  category: string
}

export interface EventRegistration {
  id: number
  eventId: number
  name: string
  email: string
  phone: string
  quantity: number
  isMember: boolean
  totalAmount: number
  paymentStatus: EventRegistrationStatus
  registeredAt: string
  notes?: string
}

export interface CreateEventRegistrationInput {
  eventId: number
  name: string
  email: string
  phone: string
  quantity: number
  isMember: boolean
  totalAmount: number
  notes?: string
}
export interface CreateEventInput {
  title: string
  description: string
  longDescription: string
  date: string
  time: string
  location: string
  priceMember: string
  priceNonMember: string
  capacity: number
  status: EventStatus
  imageEmoji: string
  category: string
}

export interface UpdateEventInput {
  title: string
  description: string
  longDescription: string
  date: string
  time: string
  location: string
  priceMember: string
  priceNonMember: string
  capacity: number
  status: EventStatus
  imageEmoji: string
  category: string
}