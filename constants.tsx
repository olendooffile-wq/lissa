
import { User, Coupon, Wristband, NewsItem, MenuItem } from './types';

export const INITIAL_CLIENTS: User[] = [
  {
    id: '1',
    name: 'Lia Kim',
    email: 'lia@purple.com',
    password: '123',
    whatsapp: '5511999999999',
    role: 'client',
    photo: 'https://picsum.photos/seed/lia/200/200',
    status: 'active'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c1',
    // Fix: Changed clientId to client_id to match the Coupon interface in types.ts
    client_id: '1',
    code: 'PURPLE20',
    discount: '20%',
    validity: '2025-12-31',
    status: 'active'
  }
];

export const INITIAL_WRISTBANDS: Wristband[] = [
  {
    id: 'w1',
    // Fix: Changed clientId to client_id to match the Wristband interface in types.ts
    client_id: '1',
    code: 'EVENT-442-XP',
    status: 'valid',
    // Fix: Changed eventName to event_name to match the Wristband interface in types.ts
    event_name: 'K-Night Special'
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'New BTS Merch Just Arrived!',
    content: 'Check out our latest collection of limited edition lightsticks and albums.',
    image: 'https://picsum.photos/seed/kpop1/400/200',
    date: '2024-05-20'
  },
  {
    id: 'n2',
    title: 'Blackpink Comeback Event',
    content: 'Join our watch party this Friday at the store. Exclusive drinks included!',
    image: 'https://picsum.photos/seed/kpop2/400/200',
    date: '2024-05-22'
  }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Strawberry Milk Boba',
    price: 'R$ 18,90',
    description: 'Fresh strawberries with premium jasmine tea and tapioca pearls.',
    image: 'https://picsum.photos/seed/drink1/200/200'
  },
  {
    id: 'm2',
    name: 'Purple Velvet Cake',
    price: 'R$ 15,00',
    description: 'Moist purple velvet cake with cream cheese frosting.',
    image: 'https://picsum.photos/seed/cake1/200/200'
  }
];

export const ADMIN_USER: User = {
  id: 'admin-0',
  name: 'Purple Admin',
  email: 'purpledream.ap@gmail.com',
  password: 'Maju1605#',
  role: 'admin',
  photo: 'https://picsum.photos/seed/admin/200/200',
  status: 'active'
};
