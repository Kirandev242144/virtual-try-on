// src/lib/data.ts

export interface Post {
    id: number;
    type: 'vendor' | 'video' | 'user';
    author: string;
    avatar: string; // Vendor/User Avatar
    images?: string[]; // For vendor posts
    image?: string; // For user posts
    videoUrl?: string; // For video posts
    moreCount?: number;
    storyTitle?: string;
    likes: number;
    comments: number;
    description?: string;
    taggedProducts?: Product[];
    triedItem?: string; // For user posts
    // Product Page Specifics
    productName?: string;
    price?: string;
    rating?: number;
    category?: 'tops' | 'bottoms' | 'one-pieces';
}

export interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
}

const PRODUCTS: Product[] = [
    { id: 1, name: "Structured Wool Blazer", price: "$280", image: "/Shop_images/1/basic2-500x750.jpeg" },
    { id: 2, name: "Wide-Leg Silk Trousers", price: "$195", image: "/Shop_images/1/basic3-500x750.jpeg" },
    { id: 3, name: "Pointed Toe Ankle Boots", price: "$450", image: "/Shop_images/1/basic4-500x750.jpeg" },
    { id: 4, name: "Ribbed Tank Top", price: "$45", image: "/Shop_images/3/dressblack1-1-500x750.jpeg" },
    { id: 5, name: "Classic Gold Hoops", price: "$120", image: "/Shop_images/3/dressblack2-500x750.jpeg" }
];

export const ALL_POSTS: Post[] = [
    {
        id: 1,
        type: 'vendor',
        author: "Ankita Manot",
        avatar: "/Shop_images/1/basic2-500x750.jpeg",
        images: [
            "/Shop_images/1/basic2-500x750.jpeg",
            "/Shop_images/1/basic3-500x750.jpeg",
            "/Shop_images/1/basic4-500x750.jpeg"
        ],
        moreCount: 14,
        storyTitle: "VOGUESOCIAL EXCLUSIVE STORY",
        likes: 2400,
        comments: 128,
        description: "Exploring the intersection of minimalism and avant-garde street style. Based in Milan. Curating high-end silhouettes with accessible textures.",
        taggedProducts: [PRODUCTS[0], PRODUCTS[1], PRODUCTS[2]],
        productName: "Structured Wool Blazer",
        price: "$280.00",
        rating: 4.8,
        category: 'tops'
    },
    {
        id: 2,
        type: 'video',
        author: "Style Diva",
        avatar: "/Shop_images/2/cup1-500x750.jpeg",
        images: [
            "/Shop_images/2/cup1-500x750.jpeg",
            "/Shop_images/2/cup2-500x750.jpeg",
            "/Shop_images/2/cup3-500x750.jpeg"
        ],
        videoUrl: "/Shop_images/2/u1858448214_httpss.mj.run_rdUyXdL2Eo_add_a_motion_to_this_guy_ec878c06-ea1d-4d38-b9e4-fbd2a1112ae4_1.mp4",
        moreCount: 22,
        storyTitle: "SUMMER COLLECTION",
        likes: 1850,
        comments: 95,
        description: "Get ready for the summer heat with our new lightweight collection.",
        taggedProducts: [PRODUCTS[3], PRODUCTS[4]],
        productName: "Summer Breeze Set",
        price: "$115.00",
        rating: 4.5,
        category: 'one-pieces'
    },
    {
        id: 101,
        type: 'user',
        author: "Sarah Jen",
        avatar: "/Shop_images/1/basic4-500x750.jpeg",
        image: "/Shop_images/3/dressblack1-1-500x750.jpeg",
        likes: 1240,
        comments: 45,
        triedItem: "Summer Floral Dress",
        description: "Tried this lovely dress via VogueSocial! The fit is amazing.",
        taggedProducts: [PRODUCTS[1]]
    },
    {
        id: 3,
        type: 'vendor',
        author: "Urban Chic",
        avatar: "/Shop_images/3/dressblack1-1-500x750.jpeg",
        images: [
            "/Shop_images/3/dressblack1-1-500x750.jpeg",
            "/Shop_images/3/dressblack2-500x750.jpeg",
            "/Shop_images/3/dressblack3-500x750.jpeg"
        ],
        moreCount: 22,
        storyTitle: "EVENING WEAR",
        likes: 3100,
        comments: 210,
        description: "Elegant evening wear for the modern woman.",
        taggedProducts: [PRODUCTS[0], PRODUCTS[2]],
        productName: "Midnight Silk Dress",
        price: "$320.00",
        rating: 4.9,
        category: 'one-pieces'
    },
    {
        id: 102,
        type: 'user',
        author: "Mike Ross",
        avatar: "/Shop_images/9/pocketmen1-500x750.jpeg",
        image: "/Shop_images/9/pocketmen1-500x750.jpeg",
        likes: 856,
        comments: 23,
        triedItem: "Urban Hoodie",
        description: "The virtual try-on was spot on! Loving this hoodie.",
        taggedProducts: [PRODUCTS[0]]
    },
    {
        id: 5,
        type: 'video',
        author: "Trends Today",
        avatar: "/Shop_images/5/knotted1-500x750.jpeg",
        images: [
            "/Shop_images/5/knotted1-500x750.jpeg",
            "/Shop_images/5/knotted2-500x750.jpeg",
            "/Shop_images/5/knotted3-500x750.jpeg"
        ],
        videoUrl: "/nenaevans on LTK.mp4",
        moreCount: 65,
        storyTitle: "CASUAL VIBES",
        likes: 980,
        comments: 34,
        description: "Casual fits for everyday comfort.",
        taggedProducts: [PRODUCTS[3], PRODUCTS[4]],
        productName: "Knotted Casual Tee",
        price: "$55.00",
        rating: 4.2,
        category: 'tops'
    },
    {
        id: 6,
        type: 'vendor',
        author: "Fashion Forward",
        avatar: "/Shop_images/6/leggings1-500x750.jpeg",
        images: [
            "/Shop_images/6/leggings1-500x750.jpeg",
            "/Shop_images/6/leggings2-500x750.jpeg",
            "/Shop_images/6/leggings3-500x750.jpeg"
        ],
        moreCount: 10,
        storyTitle: "ACTIVE WEAR",
        likes: 1200,
        comments: 45,
        productName: "Sculpting Leggings",
        price: "$85.00",
        rating: 4.7,
        category: 'bottoms'
    },
    {
        id: 9,
        type: 'vendor',
        author: "Mens Edit",
        avatar: "/Shop_images/9/pocketmen1-500x750.jpeg",
        images: [
            "/Shop_images/9/pocketmen1-500x750.jpeg",
            "/Shop_images/9/pocketmen2-500x750.jpeg",
            "/Shop_images/9/pocketmen3-500x750.jpeg"
        ],
        moreCount: 5,
        storyTitle: "MEN'S FASHION",
        likes: 850,
        comments: 67,
        productName: "Cargo Pocket Trousers",
        price: "$110.00",
        rating: 4.6,
        category: 'bottoms'
    },
    {
        id: 10,
        type: 'video',
        author: "Denim Cult",
        avatar: "/Shop_images/10/ripped1-500x750.jpeg",
        images: [
            "/Shop_images/10/ripped1-500x750.jpeg",
            "/Shop_images/10/ripped2-500x750.jpeg",
            "/Shop_images/10/ripped3-500x750.jpeg"
        ],
        videoUrl: "/HelloDrea16 on LTK.mp4",
        moreCount: 42,
        storyTitle: "DENIM SERIES",
        likes: 1540,
        comments: 89,
        productName: "Distressed Boyfriend Jeans",
        price: "$160.00",
        rating: 4.8,
        category: 'bottoms'
    },
    {
        id: 11,
        type: 'vendor',
        author: "Sleeve Story",
        avatar: "/Shop_images/11/sleev1-500x750.jpeg",
        images: [
            "/Shop_images/11/sleev1-500x750.jpeg",
            "/Shop_images/11/sleev2-500x750.jpeg",
            "/Shop_images/11/sleev3-500x750.jpeg"
        ],
        moreCount: 18,
        storyTitle: "ELEGANT SLEEVES",
        likes: 2100,
        comments: 134,
        productName: "Bell Sleeve Blouse",
        price: "$145.00",
        rating: 4.8,
        category: 'tops'
    },
    {
        id: 14,
        type: 'vendor',
        author: "SummerVibes",
        avatar: "/Shop_images/14/bTgDVAex_00915cef3b634c61a7a77980d8384727.jpg",
        images: [
            "/Shop_images/14/bTgDVAex_00915cef3b634c61a7a77980d8384727.jpg",
            "/Shop_images/14/u97PsqkV_1c92d329f65c42d4a0590ecd2690b550.jpg"
        ],
        moreCount: 8,
        storyTitle: "SUMMER ESSENTIALS",
        likes: 1320,
        comments: 56,
        productName: "Women Halter Neck Printed Jumpsuit",
        price: "$65.00",
        rating: 4.6,
        description: "Elegant halter neck jumpsuit featuring a vibrant print and comfortable fit. Perfect for summer outings.",
        category: 'one-pieces'
    },
    {
        id: 15,
        type: 'vendor',
        author: "ChicEssentials",
        avatar: "/Shop_images/15/1000016314131-Red-RED-1000016314131_01-2100.jpg",
        images: [
            "/Shop_images/15/1000016314131-Red-RED-1000016314131_01-2100.jpg",
            "/Shop_images/15/1000016314131-Red-RED-1000016314131_02-2100.jpg",
            "/Shop_images/15/1000016314131-Red-RED-1000016314131_03-2100.jpg",
            "/Shop_images/15/1000016314131-Red-RED-1000016314131_05-2100.jpg"
        ],
        moreCount: 12,
        storyTitle: "OFFICE CHIC",
        likes: 980,
        comments: 42,
        productName: "Women Solid Shirt Dress with Belt",
        price: "$78.00",
        rating: 4.7,
        description: "A versatile solid shirt dress with a waist belt for a flattering silhouette. Suitable for both work and casual outings.",
        category: 'one-pieces'
    },
    {
        id: 16,
        type: 'vendor',
        author: "Chemistry",
        avatar: "/Shop_images/16/2062af47-4098-4cc2-9e3f-f36ebca76b881725273460897-Chemistry-Women-Dresses-9631725273460568-5.jpg",
        images: [
            "/Shop_images/16/2062af47-4098-4cc2-9e3f-f36ebca76b881725273460897-Chemistry-Women-Dresses-9631725273460568-5.jpg",
            "/Shop_images/16/9fe85a3b-34fb-4fc6-96f5-16fb2e2fcc501725273460948-Chemistry-Women-Dresses-9631725273460568-1.jpg",
            "/Shop_images/16/e153de40-ddd6-4f56-8014-546b51a238a71725428382600-Chemistry-Women-Dresses-291725428382542-2.jpg"
        ],
        moreCount: 15,
        storyTitle: "MODERN FEMININITY",
        likes: 1105,
        comments: 64,
        productName: "Chemistry Floral Print Midi Dress",
        price: "$89.00",
        rating: 4.8,
        description: "A beautiful floral print midi dress from Chemistry. Designed for comfort and style with premium fabric.",
        category: 'one-pieces'
    },
];
