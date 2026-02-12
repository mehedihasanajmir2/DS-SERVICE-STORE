
import { Product } from './types';

export const CATEGORIES = ['All', 'New Apple Account', 'Old Apple Account', 'All Type Icloud', 'All Type Virtual Card', 'All Type Gmail Id', 'All Type Facebook Id'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 
    name: 'New 1 Apple id',
    description: 'Freshly created, not verified Apple ID. Secure and ready for immediate use across all your Apple devices.',
    price: 0.20,
    category: 'New Apple Account',
    image: 'https://play-lh.googleusercontent.com/OdTRFsZcHBBeN3XzAtlD9F-y9E19vuTSt_MZhh7QWdsQRrtpAqbEffvzNGGtlkMs2yCj',
    stock: 1000,
    rating: 4.9
  },
  {
    id: 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4',
    name: '1 year 1 Apple id',
    description: 'Not verified Apple ID with 1-year history. Perfect for developers and legacy app compatibility.',
    price: 0.50,
    category: 'Old Apple Account',
    image: 'https://play-lh.googleusercontent.com/OdTRFsZcHBBeN3XzAtlD9F-y9E19vuTSt_MZhh7QWdsQRrtpAqbEffvzNGGtlkMs2yCj',
    stock: 200,
    rating: 4.7
  },
  {
    id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
    name: 'New 1 pis iCloud',
    description: 'Premium not verified iCloud accounts for professional and personal use. High quality guaranteed.',
    price: 0.15,
    category: 'All Type Icloud',
    image: 'https://www.blueapplesystems.co.uk/uploads/6/0/2/7/60276537/icloud_orig.png',
    stock: 2000,
    rating: 4.9
  },
  {
    id: 'b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8',
    name: 'Old 1 pis iCloud',
    description: 'Premium not verified iCloud accounts for professional and personal use. High quality guaranteed.',
    price: 0.70,
    category: 'All Type Icloud',
    image: 'https://www.blueapplesystems.co.uk/uploads/6/0/2/7/60276537/icloud_orig.png',
    stock: 2000,
    rating: 4.9
  },
  {
    id: 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
    name: '1 Pis visa card for apple id',
    description: 'Premium virtual Visa cards specifically optimized for Apple ID verification and global digital payments.',
    price: 0.30,
    category: 'All Type Virtual Card',
    image: 'https://media.gettyimages.com/id/79989029/photo/visa-plans-largest-ipo-in-u-s-history.jpg?s=594x594&w=gi&k=20&c=OqVn902U2U7PNJKpVohns7W3YR6dgNHjbhIR5ATc5BY=',
    stock: 500,
    rating: 4.8
  },
  {
    id: 'f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6',
    name: 'New Fresh Gmail ID',
    description: 'All Gmail create only android and PC create Gmail',
    price: 0.10,
    category: 'All Type Gmail Id',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    stock: 1500,
    rating: 4.8
  },
  {
    id: 'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
    name: 'Old Fresh Gmail ID',
    description: 'All Gmail create only android and PC create Gmail',
    price: 0.18,
    category: 'All Type Gmail Id',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    stock: 1500,
    rating: 4.8
  },
  {
    id: 'f7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7',
    name: 'Fresh Facebook ID',
    description: 'New and fresh Facebook accounts for marketing, business activities, or personal use. High quality and secure.',
    price: 0.22,
    category: 'All Type Facebook Id',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg',
    stock: 1200,
    rating: 4.7
  }
];
