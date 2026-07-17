import type { EventItem } from '~/types/event'

export const useEvents = () => {
  const getEvents = () => events

  const getFeaturedEvents = () => events.slice(0, 3)

  const getEventBySlug = (slug: string) => {
    return events.find((event) => event.slug === slug)
  }

  return {
    getEvents,
    getFeaturedEvents,
    getEventBySlug
  }
}

const events: EventItem[] = [
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
    priceMember: 'A definir',
    priceNonMember: 'A definir',
    capacity: 80,
    registered: 0,
    status: 'soon',
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
