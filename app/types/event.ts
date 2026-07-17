export type EventStatus = 'open' | 'soon' | 'sold_out' | 'closed'

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