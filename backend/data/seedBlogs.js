/** Dummy blog posts for SEO demos — use {{product:seedKey|Link text}} for internal product links. */
const SAMPLE_BLOG_POSTS = [
    {
        title: '10 Online Shopping Tips for Smart Buyers in Pakistan',
        slug: 'online-shopping-tips-pakistan',
        excerpt:
            'Save money and shop safely on izzmarket with these practical tips for comparing prices, reading reviews, and secure checkout.',
        coverImage: 'https://picsum.photos/seed/blog-shopping-tips/1200/630',
        tags: ['shopping tips', 'pakistan', 'ecommerce'],
        published: true,
        seo: {
            pageTitle: '10 Online Shopping Tips Pakistan | izzmarket Blog',
            metaDescription:
                'Smart online shopping tips for Pakistani buyers — compare prices, use secure payment, and find the best deals on izzmarket.',
            keywords: 'online shopping pakistan, ecommerce tips, izzmarket',
            canonicalPath: '/blog/online-shopping-tips-pakistan',
        },
        content: `<p>Shopping online in Pakistan is easier than ever. Here is how to get the most from <strong>izzmarket</strong>.</p>
<h2>Compare before you buy</h2>
<p>Check ratings, cut prices, and category filters on our <a href="/products">full catalog</a>. Start with a bestseller like the {{product:power-bank|Anker 20000mAh power bank}} for everyday value.</p>
<h2>Use secure checkout</h2>
<p>Pay with Stripe; card data stays with Stripe, not on our servers.</p>
<h2>Track your order</h2>
<p>Ask our shopping assistant "Where is my order?" after checkout.</p>`,
    },
    {
        title: 'How to Choose the Right Electronics on a Budget',
        slug: 'choose-electronics-on-a-budget',
        excerpt:
            'Laptops, mobiles, and accessories — what to look for when shopping electronics online in PKR.',
        coverImage: 'https://picsum.photos/seed/blog-electronics/1200/630',
        tags: ['electronics', 'laptops', 'mobiles'],
        published: true,
        seo: {
            pageTitle: 'Choose Electronics on a Budget | izzmarket',
            metaDescription:
                'Guide to picking laptops, phones, and electronics online — filters, ratings, and deals on izzmarket.',
            keywords: 'electronics pakistan, budget laptop, mobile deals',
            canonicalPath: '/blog/choose-electronics-on-a-budget',
        },
        content: `<p>Electronics are a top category on izzmarket. Start with your budget in PKR, then filter by category.</p>
<p>For audio on a budget, see the {{product:sony-headphones|Sony WH-CH520 headphones}}. Need a desk setup? The {{product:desk-lamp|LED desk lamp}} is a popular pick.</p>
<p>For laptops, compare the {{product:hp-15s|HP 15s Core i5}} and {{product:lenovo-ideapad|Lenovo IdeaPad Slim 3}} side by side on <a href="/products?category=Laptops">Laptops</a>.</p>`,
    },
    {
        title: 'Free Shipping & Delivery: What to Expect',
        slug: 'shipping-delivery-guide',
        excerpt:
            'Standard delivery times, free shipping, and how order tracking works on izzmarket.',
        coverImage: 'https://picsum.photos/seed/blog-shipping/1200/630',
        tags: ['shipping', 'delivery', 'orders'],
        published: true,
        seo: {
            pageTitle: 'Shipping & Delivery Guide | izzmarket Blog',
            metaDescription:
                'Free shipping, 5–7 day delivery across Pakistan, and order status on izzmarket.',
            keywords: 'free shipping pakistan, delivery time, order tracking',
            canonicalPath: '/blog/shipping-delivery-guide',
        },
        content: `<p>We offer <strong>free delivery</strong> on orders. Most packages arrive in 5–7 business days.</p>
<p>Track from My Orders or the shopping assistant chat. Small items like the {{product:electric-kettle|electric kettle}} or {{product:power-bank|power bank}} ship quickly from our warehouse.</p>
<p>Browse <a href="/products">all products</a> to build a cart that qualifies for free shipping.</p>`,
    },
    {
        title: 'Fashion Finds: Building a Capsule Wardrobe Online',
        slug: 'fashion-capsule-wardrobe-online',
        excerpt:
            'Mix and match essentials from our Fashion category without overspending.',
        coverImage: 'https://picsum.photos/seed/blog-fashion/1200/630',
        tags: ['fashion', 'style', 'wardrobe'],
        published: true,
        seo: {
            pageTitle: 'Capsule Wardrobe Shopping Online | izzmarket',
            metaDescription:
                'Build a versatile wardrobe with fashion picks from izzmarket — shoes, apparel, and seasonal deals in PKR.',
            keywords: 'fashion online pakistan, capsule wardrobe, izzmarket fashion',
            canonicalPath: '/blog/fashion-capsule-wardrobe-online',
        },
        content: `<p>Start with neutral basics, one pair of versatile shoes, and layers you can wear year-round.</p>
<p>Core pieces: {{product:mens-polo|men’s cotton polo}}, {{product:womens-kurti|printed kurti}}, and {{product:running-shoes|running shoes}}.</p>
<p>Browse <a href="/products?category=Fashion">Fashion on izzmarket</a> and filter by price.</p>`,
    },
    {
        title: 'Home Essentials: Smart Buys for Every Room',
        slug: 'home-essentials-smart-buys',
        excerpt:
            'From kitchen appliances to décor — how to furnish your home from one marketplace.',
        coverImage: 'https://picsum.photos/seed/blog-home/1200/630',
        tags: ['home', 'appliances', 'decor'],
        published: true,
        seo: {
            pageTitle: 'Home Essentials Online Shopping | izzmarket Blog',
            metaDescription:
                'Shop home appliances, furniture, and décor on izzmarket with free delivery across Pakistan.',
            keywords: 'home shopping pakistan, appliances online, home decor',
            canonicalPath: '/blog/home-essentials-smart-buys',
        },
        content: `<p>Prioritize appliances you use daily, then add comfort items like lighting and storage.</p>
<p>Kitchen starters: {{product:electric-kettle|electric kettle}} and {{product:air-fryer|4.5L air fryer}}. For the living room, try the {{product:storage-ottoman|storage ottoman}} and {{product:desk-lamp|LED desk lamp}}.</p>
<p>See <a href="/products?category=Home">Home</a> and <a href="/products?category=Appliances">Appliances</a> for more.</p>`,
    },
    {
        title: 'Understanding Product Ratings & Reviews',
        slug: 'product-ratings-reviews-guide',
        excerpt:
            'How star ratings work on izzmarket and what to look for before you add to cart.',
        coverImage: 'https://picsum.photos/seed/blog-reviews/1200/630',
        tags: ['reviews', 'ratings', 'trust'],
        published: true,
        seo: {
            pageTitle: 'Product Ratings Explained | izzmarket',
            metaDescription:
                'Learn how to use ratings and reviews on izzmarket to pick the best products in every category.',
            keywords: 'product reviews, star ratings, izzmarket trust',
            canonicalPath: '/blog/product-ratings-reviews-guide',
        },
        content: `<p>Filter products by minimum rating when browsing. Read recent reviews for sizing, quality, and delivery experience.</p>
<p>Highly rated examples: {{product:galaxy-a15|Samsung Galaxy A15}} (4.4★) and {{product:sony-headphones|Sony WH-CH520}} (4.5★).</p>
<p>After purchase, leave an honest review to help other shoppers.</p>`,
    },
    {
        title: 'How to Use Promo Codes at Checkout',
        slug: 'promo-codes-checkout-guide',
        excerpt:
            'Save extra with WELCOME500 and SAVE10 — how coupons work with our shopping assistant.',
        coverImage: 'https://picsum.photos/seed/blog-coupons/1200/630',
        tags: ['coupons', 'deals', 'checkout'],
        published: true,
        seo: {
            pageTitle: 'Promo Codes & Coupons | izzmarket Blog',
            metaDescription:
                'Apply WELCOME500 and SAVE10 on izzmarket. Tips for stacking deals with product discounts in PKR.',
            keywords: 'promo code, coupon izzmarket, discount pakistan',
            canonicalPath: '/blog/promo-codes-checkout-guide',
        },
        content: `<p>Product pages already show cut prices. For extra savings, open the chat and say <strong>apply coupon WELCOME500</strong> (orders over Rs 5,000).</p>
<p>Pair a coupon with sale items like the {{product:bluetooth-speaker|JBL Bluetooth speaker}} or {{product:air-fryer|air fryer}}.</p>
<p>Ask "what coupons are available?" anytime, then <a href="/cart">go to cart</a>.</p>`,
    },
    {
        title: 'Mobile Shopping: Best Phones Under Rs 50,000',
        slug: 'best-phones-under-50000-pkr',
        excerpt:
            'A quick guide to finding value mobiles in our catalog without compromising on ratings.',
        coverImage: 'https://picsum.photos/seed/blog-mobiles/1200/630',
        tags: ['mobiles', 'smartphones', 'budget'],
        published: true,
        seo: {
            pageTitle: 'Best Phones Under 50000 PKR | izzmarket',
            metaDescription:
                'Compare mobiles under Rs 50,000 on izzmarket — battery, camera, and verified buyer ratings.',
            keywords: 'cheap phones pakistan, mobile under 50000, smartphone deals',
            canonicalPath: '/blog/best-phones-under-50000-pkr',
        },
        content: `<p>Set a max price filter and sort by rating. Compare battery life and warranty in product descriptions.</p>
<p>Top picks under Rs 50,000: {{product:galaxy-a15|Samsung Galaxy A15}} and {{product:redmi-note-13|Redmi Note 13}}. Need iOS? See the {{product:iphone-se|iPhone SE (2022)}}.</p>
<p><a href="/products?category=Mobiles">Browse all mobiles</a> or search "phones under 50000" in the header.</p>`,
    },
    {
        title: 'Why Shop Local: Supporting PKR Pricing & Fast Delivery',
        slug: 'shop-local-pkr-pricing',
        excerpt:
            'Transparent PKR prices, local support, and a marketplace built for Pakistani shoppers.',
        coverImage: 'https://picsum.photos/seed/blog-local/1200/630',
        tags: ['izzmarket', 'pakistan', 'shopping'],
        published: true,
        seo: {
            pageTitle: 'Shop Local with izzmarket | Blog',
            metaDescription:
                'izzmarket offers PKR pricing, free shipping, and customer support tailored for Pakistan.',
            keywords: 'local ecommerce pakistan, izzmarket, online marketplace',
            canonicalPath: '/blog/shop-local-pkr-pricing',
        },
        content: `<p>All prices are in <strong>PKR</strong>. No currency surprises at checkout.</p>
<p>Our team focuses on categories Pakistan shops most: electronics, fashion, home, and more. Try a local bestseller — {{product:samsung-watch|Galaxy Watch6 Classic}} or {{product:lenovo-ideapad|Lenovo IdeaPad}} — then explore <a href="/">the homepage</a>.</p>`,
    },
];

module.exports = { SAMPLE_BLOG_POSTS };
